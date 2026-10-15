from datetime import date
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Lancamento, Partida, ContaContabil, Empresa
from app.schemas.schemas import BalanceteResponse, BalancoPatrimonialResponse, DREResponse
from app.services.relatorios_service import RelatoriosService

router = APIRouter()

@router.get("/balancete/{empresa_id}", response_model=BalanceteResponse)
def get_balancete(
    empresa_id: int,
    data_inicio: date = Query(default_factory=lambda: date(date.today().year, 1, 1)),
    data_fim: date = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    return RelatoriosService.gerar_balancete(db, empresa_id, data_inicio, data_fim)

@router.get("/balanco-patrimonial/{empresa_id}", response_model=BalancoPatrimonialResponse)
def get_balanco(
    empresa_id: int,
    data_posicao: date = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    return RelatoriosService.gerar_balanco_patrimonial(db, empresa_id, data_posicao)

@router.get("/dre/{empresa_id}", response_model=DREResponse)
def get_dre(
    empresa_id: int,
    data_inicio: date = Query(default_factory=lambda: date(date.today().year, 1, 1)),
    data_fim: date = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    return RelatoriosService.gerar_dre(db, empresa_id, data_inicio, data_fim)

@router.get("/indicadores/{empresa_id}")
def get_indicadores(
    empresa_id: int,
    data_posicao: date = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    return RelatoriosService.gerar_indicadores(db, empresa_id, data_posicao)

@router.get("/livro-diario/{empresa_id}")
def get_livro_diario(
    empresa_id: int,
    data_inicio: date = Query(default_factory=lambda: date(date.today().year, 1, 1)),
    data_fim: date = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")

    lancamentos = db.query(Lancamento).filter(
        Lancamento.empresa_id == empresa_id,
        Lancamento.data >= data_inicio,
        Lancamento.data <= data_fim
    ).order_by(Lancamento.data, Lancamento.numero).all()

    total_geral = 0.0
    diario_itens = []
    for l in lancamentos:
        partidas_itens = []
        deb_total = sum(p.valor for p in l.partidas if p.tipo == "DEBITO")
        total_geral += deb_total
        for p in l.partidas:
            conta = db.query(ContaContabil).filter(ContaContabil.id == p.conta_id).first()
            partidas_itens.append({
                "conta_codigo": conta.codigo if conta else "",
                "conta_descricao": conta.descricao if conta else "",
                "tipo": p.tipo,
                "valor": p.valor,
                "complemento": p.complemento
            })
        diario_itens.append({
            "numero": l.numero,
            "data": l.data,
            "historico": l.historico,
            "documento": l.documento,
            "partidas": partidas_itens
        })

    return {
        "empresa": empresa.razao_social,
        "cnpj": empresa.cnpj,
        "periodo": f"{data_inicio.strftime('%d/%m/%Y')} a {data_fim.strftime('%d/%m/%Y')}",
        "total_movimento": round(total_geral, 2),
        "lancamentos": diario_itens
    }

@router.get("/livro-razao/{empresa_id}")
def get_livro_razao(
    empresa_id: int,
    conta_id: Optional[int] = Query(None),
    data_inicio: date = Query(default_factory=lambda: date(date.today().year, 1, 1)),
    data_fim: date = Query(default_factory=date.today),
    db: Session = Depends(get_db)
):
    query = db.query(ContaContabil).filter(
        ContaContabil.empresa_id == empresa_id,
        ContaContabil.tipo == "ANALITICA"
    )
    if conta_id:
        query = query.filter(ContaContabil.id == conta_id)

    contas = query.order_by(ContaContabil.codigo).all()
    resultado = []

    for c in contas:
        # Saldo anterior
        deb_ant = db.query(func.coalesce(func.sum(Partida.valor), 0.0)).join(Lancamento).filter(
            Lancamento.empresa_id == empresa_id,
            Lancamento.data < data_inicio,
            Partida.conta_id == c.id,
            Partida.tipo == "DEBITO"
        ).scalar()

        cred_ant = db.query(func.coalesce(func.sum(Partida.valor), 0.0)).join(Lancamento).filter(
            Lancamento.empresa_id == empresa_id,
            Lancamento.data < data_inicio,
            Partida.conta_id == c.id,
            Partida.tipo == "CREDITO"
        ).scalar()

        saldo_ant = (deb_ant - cred_ant) if c.natureza == "DEVEDORA" else (cred_ant - deb_ant)

        # Partidas no período
        partidas = db.query(Partida, Lancamento).join(Lancamento).filter(
            Lancamento.empresa_id == empresa_id,
            Lancamento.data >= data_inicio,
            Lancamento.data <= data_fim,
            Partida.conta_id == c.id
        ).order_by(Lancamento.data, Lancamento.numero).all()

        saldo_acumulado = saldo_ant
        movimentos = []
        for p, l in partidas:
            if c.natureza == "DEVEDORA":
                saldo_acumulado += p.valor if p.tipo == "DEBITO" else -p.valor
            else:
                saldo_acumulado += p.valor if p.tipo == "CREDITO" else -p.valor

            movimentos.append({
                "data": l.data,
                "lancamento_numero": l.numero,
                "historico": l.historico,
                "documento": l.documento,
                "tipo": p.tipo,
                "valor": p.valor,
                "saldo_resultante": round(saldo_acumulado, 2)
            })

        resultado.append({
            "conta_id": c.id,
            "codigo": c.codigo,
            "descricao": c.descricao,
            "natureza": c.natureza,
            "saldo_anterior": round(saldo_ant, 2),
            "saldo_final": round(saldo_acumulado, 2),
            "movimentos": movimentos
        })

    return resultado
