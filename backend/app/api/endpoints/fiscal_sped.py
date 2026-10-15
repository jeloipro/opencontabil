from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.sped_ecd_service import SpedEcdService
from app.services.reforma_tributaria_service import ReformaTributariaService
from app.schemas.schemas import SimuladorReformaRequest, SimuladorReformaResponse

router = APIRouter()

@router.get("/exportar-ecd/{empresa_id}")
def exportar_sped_ecd(
    empresa_id: int,
    ano: int = Query(2026),
    db: Session = Depends(get_db)
):
    conteudo_sped = SpedEcdService.gerar_arquivo_sped(db, empresa_id, ano)
    return Response(
        content=conteudo_sped,
        media_type="text/plain; charset=iso-8859-1",
        headers={"Content-Disposition": f"attachment; filename=SPED_ECD_{empresa_id}_{ano}.txt"}
    )

@router.get("/validar-ecd/{empresa_id}")
def validar_sped_ecd(
    empresa_id: int,
    ano: int = Query(2026),
    db: Session = Depends(get_db)
):
    return SpedEcdService.validar_consistencia(db, empresa_id, ano)

@router.post("/simular-reforma", response_model=SimuladorReformaResponse)
def simular_reforma_tributaria(dados: SimuladorReformaRequest):
    return ReformaTributariaService.simular(dados)

