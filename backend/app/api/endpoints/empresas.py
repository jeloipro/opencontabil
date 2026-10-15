from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Empresa, ContaContabil
from app.schemas.schemas import EmpresaCreate, EmpresaUpdate, EmpresaResponse
from app.services.seed_service import PLANO_CONTAS_PADRAO

router = APIRouter()

@router.get("/", response_model=List[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)):
    return db.query(Empresa).order_by(Empresa.razao_social).all()

@router.get("/{empresa_id}", response_model=EmpresaResponse)
def obter_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
    return empresa

@router.post("/", response_model=EmpresaResponse)
def criar_empresa(payload: EmpresaCreate, db: Session = Depends(get_db)):
    existe = db.query(Empresa).filter(Empresa.cnpj == payload.cnpj).first()
    if existe:
        raise HTTPException(status_code=400, detail="CNPJ já cadastrado no sistema.")

    empresa = Empresa(**payload.model_dump())
    db.add(empresa)
    db.commit()
    db.refresh(empresa)

    # Inicializar plano de contas padrão automaticamente para a nova empresa
    for cod, cod_red, desc, tipo, nat, grupo, nivel, ref_rfb in PLANO_CONTAS_PADRAO:
        c = ContaContabil(
            empresa_id=empresa.id,
            codigo=cod,
            codigo_reduzido=cod_red,
            descricao=desc,
            tipo=tipo,
            natureza=nat,
            grupo=grupo,
            nivel=nivel,
            codigo_referencial_rfb=ref_rfb,
            ativa=True
        )
        db.add(c)
    db.commit()

    return empresa

@router.put("/{empresa_id}", response_model=EmpresaResponse)
def atualizar_empresa(empresa_id: int, payload: EmpresaUpdate, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(empresa, field, val)

    db.commit()
    db.refresh(empresa)
    return empresa

