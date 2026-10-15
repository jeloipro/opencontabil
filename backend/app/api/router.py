from fastapi import APIRouter
from app.api.endpoints import (
    empresas, plano_contas, lancamentos, centros_custo,
    relatorios, conciliacao, fiscal_sped, dashboard
)

api_router = APIRouter()

api_router.include_router(empresas.router, prefix="/empresas", tags=["Empresas"])
api_router.include_router(plano_contas.router, prefix="/plano-contas", tags=["Plano de Contas"])
api_router.include_router(lancamentos.router, prefix="/lancamentos", tags=["Lançamentos"])
api_router.include_router(centros_custo.router, prefix="/centros-custo", tags=["Centros de Custo"])
api_router.include_router(relatorios.router, prefix="/relatorios", tags=["Relatórios Oficiais"])
api_router.include_router(conciliacao.router, prefix="/conciliacao", tags=["Conciliação Bancária OFX"])
api_router.include_router(fiscal_sped.router, prefix="/fiscal-sped", tags=["SPED ECD & Reforma Tributária"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Executivo"])
