from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    cnpj = Column(String(18), unique=True, index=True, nullable=False)
    razao_social = Column(String(200), nullable=False)
    nome_fantasia = Column(String(200), nullable=True)
    inscricao_estadual = Column(String(30), nullable=True)
    inscricao_municipal = Column(String(30), nullable=True)
    regime_tributario = Column(String(50), default="SIMPLES")  # SIMPLES, LUCRO_PRESUMIDO, LUCRO_REAL, MEI
    cnae = Column(String(10), nullable=True)
    cidade = Column(String(100), default="São Paulo")
    uf = Column(String(2), default="SP")
    ano_exercicio = Column(Integer, default=2026)
    data_bloqueio = Column(Date, nullable=True)
    criado_em = Column(DateTime, default=utc_now)

    contas = relationship("ContaContabil", back_populates="empresa", cascade="all, delete-orphan")
    centros_custo = relationship("CentroCusto", back_populates="empresa", cascade="all, delete-orphan")
    lancamentos = relationship("Lancamento", back_populates="empresa", cascade="all, delete-orphan")
    transacoes_ofx = relationship("TransacaoOFX", back_populates="empresa", cascade="all, delete-orphan")
    regras_conciliacao = relationship("RegraConciliacao", back_populates="empresa", cascade="all, delete-orphan")


class ContaContabil(Base):
    __tablename__ = "contas_contabeis"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    codigo = Column(String(50), nullable=False, index=True)          # Ex: 1.1.01.001
    codigo_reduzido = Column(Integer, nullable=False, index=True)     # Ex: 10
    descricao = Column(String(200), nullable=False)
    tipo = Column(String(20), nullable=False)                        # SINTETICA ou ANALITICA
    natureza = Column(String(20), nullable=False)                    # DEVEDORA ou CREDORA
    grupo = Column(String(30), nullable=False)                       # ATIVO, PASSIVO, PL, CUSTOS, DESPESAS, RECEITAS
    nivel = Column(Integer, nullable=False, default=1)
    codigo_referencial_rfb = Column(String(50), nullable=True)       # Mapeamento SPED ECD / ECF da Receita Federal
    ativa = Column(Boolean, default=True)

    empresa = relationship("Empresa", back_populates="contas")
    partidas = relationship("Partida", back_populates="conta")


class CentroCusto(Base):
    __tablename__ = "centros_custo"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    codigo = Column(String(30), nullable=False)                      # Ex: 01.01
    nome = Column(String(100), nullable=False)
    ativo = Column(Boolean, default=True)

    empresa = relationship("Empresa", back_populates="centros_custo")
    partidas = relationship("Partida", back_populates="centro_custo")


class Lancamento(Base):
    __tablename__ = "lancamentos"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    numero = Column(Integer, nullable=False, index=True)
    data = Column(Date, nullable=False, index=True)
    tipo = Column(String(30), default="ORDINARIO")                   # ORDINARIO, ENCERRAMENTO, ESTORNO, ABERTURA
    historico = Column(Text, nullable=False)
    documento = Column(String(100), nullable=True)                   # NF, Recibo, Contrato
    conciliado = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=utc_now)

    empresa = relationship("Empresa", back_populates="lancamentos")
    partidas = relationship("Partida", back_populates="lancamento", cascade="all, delete-orphan")


class Partida(Base):
    __tablename__ = "partidas"

    id = Column(Integer, primary_key=True, index=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=False, index=True)
    conta_id = Column(Integer, ForeignKey("contas_contabeis.id"), nullable=False, index=True)
    tipo = Column(String(10), nullable=False)                        # DEBITO ou CREDITO
    valor = Column(Float, nullable=False)
    centro_custo_id = Column(Integer, ForeignKey("centros_custo.id"), nullable=True)
    complemento = Column(String(255), nullable=True)

    lancamento = relationship("Lancamento", back_populates="partidas")
    conta = relationship("ContaContabil", back_populates="partidas")
    centro_custo = relationship("CentroCusto", back_populates="partidas")


class TransacaoOFX(Base):
    __tablename__ = "transacoes_ofx"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    conta_bancaria_id = Column(Integer, ForeignKey("contas_contabeis.id"), nullable=False)
    fitid = Column(String(100), nullable=False, index=True)
    data = Column(Date, nullable=False)
    tipo = Column(String(10), nullable=False)                        # DEBIT ou CREDIT
    valor = Column(Float, nullable=False)
    memo = Column(String(255), nullable=False)
    status = Column(String(20), default="PENDENTE")                  # PENDENTE, CONCILIADO, IGNORADO
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"), nullable=True)

    empresa = relationship("Empresa", back_populates="transacoes_ofx")


class RegraConciliacao(Base):
    __tablename__ = "regras_conciliacao"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    padrao_texto = Column(String(100), nullable=False)               # Ex: "TARIFA", "PIX TRANSF"
    conta_contrapartida_id = Column(Integer, ForeignKey("contas_contabeis.id"), nullable=False)
    centro_custo_id = Column(Integer, ForeignKey("centros_custo.id"), nullable=True)
    historico_padrao = Column(String(200), nullable=False)
    ativa = Column(Boolean, default=True)

    empresa = relationship("Empresa", back_populates="regras_conciliacao")
