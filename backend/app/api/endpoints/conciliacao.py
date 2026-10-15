from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import TransacaoOFX, RegraConciliacao, ContaContabil
from app.schemas.schemas import (
    TransacaoOFXResponse, ConciliarTransacaoRequest,
    RegraConciliacaoCreate, RegraConciliacaoResponse,
    LancamentoCreate, PartidaCreate
)
from app.services.ofx_parser_service import OFXParserService
from app.services.contabilidade_service import ContabilidadeService

router = APIRouter()

@router.get("/transacoes/{empresa_id}", response_model=List[TransacaoOFXResponse])
def listar_transacoes_ofx(
    empresa_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TransacaoOFX).filter(TransacaoOFX.empresa_id == empresa_id)
    if status:
        query = query.filter(TransacaoOFX.status == status)
    return query.order_by(TransacaoOFX.data.desc(), TransacaoOFX.id.desc()).all()

@router.post("/importar-ofx/{empresa_id}")
async def importar_ofx_arquivo(
    empresa_id: int,
    conta_bancaria_id: int = Form(...),
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    content = await arquivo.read()
    text = content.decode("utf-8", errors="ignore")
    res = OFXParserService.importar_e_processar(db, empresa_id, conta_bancaria_id, text)
    return res

@router.post("/importar-ofx-texto/{empresa_id}")
def importar_ofx_texto(
    empresa_id: int,
    conta_bancaria_id: int = Body(...),
    conteudo_ofx: str = Body(...),
    db: Session = Depends(get_db)
):
    res = OFXParserService.importar_e_processar(db, empresa_id, conta_bancaria_id, conteudo_ofx)
    return res

@router.post("/conciliar/{transacao_id}")
def conciliar_manualmente(
    transacao_id: int,
    payload: ConciliarTransacaoRequest,
    db: Session = Depends(get_db)
):
    trn = db.query(TransacaoOFX).filter(TransacaoOFX.id == transacao_id).first()
    if not trn:
        raise HTTPException(status_code=404, detail="Transação OFX não encontrada.")
    if trn.status == "CONCILIADO":
        raise HTTPException(status_code=400, detail="Transação já se encontra conciliada.")

    conta_banco = db.query(ContaContabil).filter(ContaContabil.id == trn.conta_bancaria_id).first()
    conta_contra = db.query(ContaContabil).filter(ContaContabil.id == payload.conta_contrapartida_id).first()

    if not conta_banco or not conta_contra:
        raise HTTPException(status_code=400, detail="Contas contábeis inválidas.")

    # Se tipo CREDIT (entrada no banco): Débito no Banco, Crédito na Contrapartida
    # Se tipo DEBIT (saída no banco): Débito na Contrapartida, Crédito no Banco
    if trn.tipo == "CREDIT":
        partidas = [
            PartidaCreate(conta_id=trn.conta_bancaria_id, tipo="DEBITO", valor=trn.valor),
            PartidaCreate(conta_id=payload.conta_contrapartida_id, tipo="CREDITO", valor=trn.valor, centro_custo_id=payload.centro_custo_id)
        ]
    else:
        partidas = [
            PartidaCreate(conta_id=payload.conta_contrapartida_id, tipo="DEBITO", valor=trn.valor, centro_custo_id=payload.centro_custo_id),
            PartidaCreate(conta_id=trn.conta_bancaria_id, tipo="CREDITO", valor=trn.valor)
        ]

    l_create = LancamentoCreate(
        data=trn.data,
        tipo="ORDINARIO",
        historico=f"{payload.historico} - Extrato OFX: {trn.memo}",
        documento=f"OFX-{trn.fitid[:15]}",
        partidas=partidas
    )

    lancamento = ContabilidadeService.criar_lancamento(db, trn.empresa_id, l_create)
    trn.status = "CONCILIADO"
    trn.lancamento_id = lancamento.id
    db.commit()

    return {"status": "sucesso", "lancamento_id": lancamento.id, "numero": lancamento.numero}

@router.get("/regras/{empresa_id}", response_model=List[RegraConciliacaoResponse])
def listar_regras(empresa_id: int, db: Session = Depends(get_db)):
    return db.query(RegraConciliacao).filter(RegraConciliacao.empresa_id == empresa_id).all()

@router.post("/regras/{empresa_id}", response_model=RegraConciliacaoResponse)
def criar_regra(empresa_id: int, payload: RegraConciliacaoCreate, db: Session = Depends(get_db)):
    regra = RegraConciliacao(empresa_id=empresa_id, **payload.model_dump())
    db.add(regra)
    db.commit()
    db.refresh(regra)
    return regra

