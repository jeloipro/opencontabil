from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ContaContabil, Empresa
from app.schemas.schemas import ContaContabilCreate, ContaContabilResponse

router = APIRouter()

@router.get("/{empresa_id}", response_model=List[ContaContabilResponse])
def listar_contas(
    empresa_id: int,
    tipo: Optional[str] = Query(None, description="ANALITICA ou SINTETICA"),
    grupo: Optional[str] = Query(None, description="ATIVO, PASSIVO, PL, etc"),
    apenas_ativas: bool = Query(True),
    db: Session = Depends(get_db)
):
    query = db.query(ContaContabil).filter(ContaContabil.empresa_id == empresa_id)
    if apenas_ativas:
        query = query.filter(ContaContabil.ativa == True)
    if tipo:
        query = query.filter(ContaContabil.tipo == tipo)
    if grupo:
        query = query.filter(ContaContabil.grupo == grupo)

    return query.order_by(ContaContabil.codigo).all()

@router.post("/{empresa_id}", response_model=ContaContabilResponse)
def criar_conta(empresa_id: int, payload: ContaContabilCreate, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")

    # Verificar se código já existe
    existe_cod = db.query(ContaContabil).filter(
        ContaContabil.empresa_id == empresa_id,
        ContaContabil.codigo == payload.codigo
    ).first()
    if existe_cod:
        raise HTTPException(status_code=400, detail="Código de conta contábil já cadastrado.")

    # Verificar se código reduzido já existe
    existe_red = db.query(ContaContabil).filter(
        ContaContabil.empresa_id == empresa_id,
        ContaContabil.codigo_reduzido == payload.codigo_reduzido
    ).first()
    if existe_red:
        raise HTTPException(status_code=400, detail="Código reduzido já utilizado por outra conta.")

    conta = ContaContabil(empresa_id=empresa_id, **payload.model_dump())
    db.add(conta)
    db.commit()
    db.refresh(conta)
    return conta

