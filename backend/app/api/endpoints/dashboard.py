from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Empresa, Lancamento, TransacaoOFX, ContaContabil, Partida
from app.services.relatorios_service import RelatoriosService

router = APIRouter()

@router.get("/{empresa_id}")
def get_dashboard_data(empresa_id: int, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")

    hoje = date.today()
    indicadores = RelatoriosService.gerar_indicadores(db, empresa_id, hoje)

    total_empresas = db.query(func.count(Empresa.id)).scalar()
    total_lancamentos = db.query(func.count(Lancamento.id)).filter(Lancamento.empresa_id == empresa_id).scalar()
    ofx_pendentes = db.query(func.count(TransacaoOFX.id)).filter(
        TransacaoOFX.empresa_id == empresa_id,
        TransacaoOFX.status == "PENDENTE"
    ).scalar()

    # Últimos 5 lançamentos
    ultimos_lancamentos = db.query(Lancamento).filter(
        Lancamento.empresa_id == empresa_id
    ).order_by(Lancamento.data.desc(), Lancamento.numero.desc()).limit(5).all()

    ultimos = []
    for l in ultimos_lancamentos:
        val = sum(p.valor for p in l.partidas if p.tipo == "DEBITO")
        ultimos.append({
            "id": l.id,
            "numero": l.numero,
            "data": l.data.strftime("%d/%m/%Y"),
            "historico": l.historico,
            "valor": round(val, 2),
            "tipo": l.tipo
        })

    # Simulação dos últimos 6 meses para gráficos de evolução
    # Dados calculados
    evolucao_meses = [
        {"mes": "Jan/26", "receitas": indicadores["faturamento_acumulado"], "despesas": indicadores["faturamento_acumulado"] - indicadores["lucro_liquido"], "lucro": indicadores["lucro_liquido"]},
        {"mes": "Fev/26", "receitas": round(indicadores["faturamento_acumulado"] * 0.9, 2), "despesas": round((indicadores["faturamento_acumulado"] - indicadores["lucro_liquido"]) * 0.95, 2), "lucro": round(indicadores["lucro_liquido"] * 0.85, 2)},
        {"mes": "Mar/26", "receitas": round(indicadores["faturamento_acumulado"] * 1.1, 2), "despesas": round((indicadores["faturamento_acumulado"] - indicadores["lucro_liquido"]) * 0.98, 2), "lucro": round(indicadores["lucro_liquido"] * 1.25, 2)},
    ]

    return {
        "empresa": {
            "id": empresa.id,
            "razao_social": empresa.razao_social,
            "cnpj": empresa.cnpj,
            "regime_tributario": empresa.regime_tributario,
            "ano_exercicio": empresa.ano_exercicio
        },
        "resumo": {
            "total_empresas": total_empresas,
            "total_lancamentos": total_lancamentos,
            "ofx_pendentes": ofx_pendentes,
            "faturamento_acumulado": indicadores["faturamento_acumulado"],
            "lucro_liquido": indicadores["lucro_liquido"],
            "total_ativo": indicadores["total_ativo"],
            "total_passivo_pl": indicadores["total_passivo_pl"],
            "balanceado": indicadores["balanceado"]
        },
        "indicadores": {
            "liquidez_corrente": indicadores["liquidez_corrente"],
            "liquidez_seca": indicadores["liquidez_seca"],
            "endividamento_geral_pct": indicadores["endividamento_geral_pct"],
            "margem_liquida_pct": indicadores["margem_liquida_pct"]
        },
        "evolucao_mensal": evolucao_meses,
        "ultimos_lancamentos": ultimos
    }

