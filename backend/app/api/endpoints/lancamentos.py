from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Lancamento, Partida, ContaContabil
from app.schemas.schemas import LancamentoCreate, LancamentoResponse, PartidaResponse
from app.services.contabilidade_service import ContabilidadeService

router = APIRouter()

@router.get("/{empresa_id}", response_model=List[LancamentoResponse])
def listar_lancamentos(
    empresa_id: int,
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    tipo: Optional[str] = Query(None),
    limite: int = Query(200),
    db: Session = Depends(get_db)
):
    query = db.query(Lancamento).filter(Lancamento.empresa_id == empresa_id)
    if data_inicio:
        query = query.filter(Lancamento.data >= data_inicio)
    if data_fim:
        query = query.filter(Lancamento.data <= data_fim)
    if tipo:
        query = query.filter(Lancamento.tipo == tipo)

    lancamentos = query.order_by(Lancamento.data.desc(), Lancamento.numero.desc()).limit(limite).all()

    # Formatar resposta com dados da conta
    res = []
    for l in lancamentos:
        partidas_dto = []
        for p in l.partidas:
            conta = db.query(ContaContabil).filter(ContaContabil.id == p.conta_id).first()
            partidas_dto.append(PartidaResponse(
                id=p.id,
                lancamento_id=p.lancamento_id,
                conta_id=p.conta_id,
                tipo=p.tipo,
                valor=p.valor,
                centro_custo_id=p.centro_custo_id,
                complemento=p.complemento,
                conta_codigo=conta.codigo if conta else "",
                conta_descricao=conta.descricao if conta else ""
            ))
        res.append(LancamentoResponse(
            id=l.id,
            empresa_id=l.empresa_id,
            numero=l.numero,
            data=l.data,
            tipo=l.tipo,
            historico=l.historico,
            documento=l.documento,
            conciliado=l.conciliado,
            criado_em=l.criado_em,
            partidas=partidas_dto
        ))
    return res

@router.post("/{empresa_id}", response_model=LancamentoResponse)
def criar_lancamento(empresa_id: int, payload: LancamentoCreate, db: Session = Depends(get_db)):
    lancamento = ContabilidadeService.criar_lancamento(db, empresa_id, payload)
    
    # Reload with relations
    partidas_dto = []
    for p in lancamento.partidas:
        conta = db.query(ContaContabil).filter(ContaContabil.id == p.conta_id).first()
        partidas_dto.append(PartidaResponse(
            id=p.id,
            lancamento_id=p.lancamento_id,
            conta_id=p.conta_id,
            tipo=p.tipo,
            valor=p.valor,
            centro_custo_id=p.centro_custo_id,
            complemento=p.complemento,
            conta_codigo=conta.codigo if conta else "",
            conta_descricao=conta.descricao if conta else ""
        ))

    return LancamentoResponse(
        id=lancamento.id,
        empresa_id=lancamento.empresa_id,
        numero=lancamento.numero,
        data=lancamento.data,
        tipo=lancamento.tipo,
        historico=lancamento.historico,
        documento=lancamento.documento,
        conciliado=lancamento.conciliado,
        criado_em=lancamento.criado_em,
        partidas=partidas_dto
    )

@router.delete("/{lancamento_id}")
def excluir_lancamento(lancamento_id: int, db: Session = Depends(get_db)):
    l = db.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado.")
    db.delete(l)
    db.commit()
    return {"status": "sucesso", "mensagem": f"Lançamento Nº {l.numero} excluído com sucesso."}
