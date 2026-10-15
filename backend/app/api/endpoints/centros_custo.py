from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CentroCusto, Empresa
from app.schemas.schemas import CentroCustoCreate, CentroCustoResponse

router = APIRouter()

@router.get("/{empresa_id}", response_model=List[CentroCustoResponse])
def listar_centros_custo(empresa_id: int, db: Session = Depends(get_db)):
    return db.query(CentroCusto).filter(
        CentroCusto.empresa_id == empresa_id,
        CentroCusto.ativo == True
    ).order_by(CentroCusto.codigo).all()

@router.post("/{empresa_id}", response_model=CentroCustoResponse)
def criar_centro_custo(empresa_id: int, payload: CentroCustoCreate, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")

    cc = CentroCusto(empresa_id=empresa_id, **payload.model_dump())
    db.add(cc)
    db.commit()
    db.refresh(cc)
    return cc
