from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.models.models import Lancamento, Partida, ContaContabil, Empresa
from app.schemas.schemas import LancamentoCreate

class ContabilidadeService:

    @staticmethod
    def get_proximo_numero(db: Session, empresa_id: int) -> int:
        max_num = db.query(func.max(Lancamento.numero)).filter(Lancamento.empresa_id == empresa_id).scalar()
        return (max_num or 0) + 1

    @staticmethod
    def criar_lancamento(db: Session, empresa_id: int, payload: LancamentoCreate) -> Lancamento:
        empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="Empresa não encontrada.")

        # Verificar período bloqueado
        if empresa.data_bloqueio and payload.data <= empresa.data_bloqueio:
            raise HTTPException(
                status_code=400,
                detail=f"Período contábil até {empresa.data_bloqueio.strftime('%d/%m/%Y')} está bloqueado para alterações."
            )

        # Validar contas
        for p in payload.partidas:
            conta = db.query(ContaContabil).filter(
                ContaContabil.id == p.conta_id,
                ContaContabil.empresa_id == empresa_id
            ).first()
            if not conta:
                raise HTTPException(status_code=400, detail=f"Conta ID {p.conta_id} não encontrada para esta empresa.")
            if conta.tipo != "ANALITICA":
                raise HTTPException(status_code=400, detail=f"A conta {conta.codigo} ({conta.descricao}) é SINTÉTICA e não aceita lançamentos.")
            if not conta.ativa:
                raise HTTPException(status_code=400, detail=f"A conta {conta.codigo} está inativa.")

        numero = ContabilidadeService.get_proximo_numero(db, empresa_id)

        lancamento = Lancamento(
            empresa_id=empresa_id,
            numero=numero,
            data=payload.data,
            tipo=payload.tipo,
            historico=payload.historico,
            documento=payload.documento,
            conciliado=False
        )
        db.add(lancamento)
        db.flush()

        for p in payload.partidas:
            partida = Partida(
                lancamento_id=lancamento.id,
                conta_id=p.conta_id,
                tipo=p.tipo,
                valor=p.valor,
                centro_custo_id=p.centro_custo_id,
                complemento=p.complemento
            )
            db.add(partida)

        db.commit()
        db.refresh(lancamento)
        return lancamento
