from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, model_validator, ConfigDict

# --- Empresa ---
class EmpresaBase(BaseModel):
    cnpj: str
    razao_social: str
    nome_fantasia: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    regime_tributario: str = "SIMPLES"
    cnae: Optional[str] = None
    cidade: str = "São Paulo"
    uf: str = "SP"
    ano_exercicio: int = 2026
    data_bloqueio: Optional[date] = None

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    regime_tributario: Optional[str] = None
    ano_exercicio: Optional[int] = None
    data_bloqueio: Optional[date] = None

class EmpresaResponse(EmpresaBase):
    id: int
    criado_em: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Centro de Custo ---
class CentroCustoBase(BaseModel):
    codigo: str
    nome: str
    ativo: bool = True

class CentroCustoCreate(CentroCustoBase):
    pass

class CentroCustoResponse(CentroCustoBase):
    id: int
    empresa_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Conta Contabil ---
class ContaContabilBase(BaseModel):
    codigo: str
    codigo_reduzido: int
    descricao: str
    tipo: str  # SINTETICA ou ANALITICA
    natureza: str  # DEVEDORA ou CREDORA
    grupo: str  # ATIVO, PASSIVO, PL, CUSTOS, DESPESAS, RECEITAS
    nivel: int = 1
    codigo_referencial_rfb: Optional[str] = None
    ativa: bool = True

class ContaContabilCreate(ContaContabilBase):
    pass

class ContaContabilResponse(ContaContabilBase):
    id: int
    empresa_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Partidas e Lançamentos ---
class PartidaCreate(BaseModel):
    conta_id: int
    tipo: str  # DEBITO ou CREDITO
    valor: float = Field(gt=0)
    centro_custo_id: Optional[int] = None
    complemento: Optional[str] = None

class PartidaResponse(PartidaCreate):
    id: int
    lancamento_id: int
    conta_codigo: Optional[str] = None
    conta_descricao: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class LancamentoCreate(BaseModel):
    data: date
    tipo: str = "ORDINARIO"
    historico: str
    documento: Optional[str] = None
    partidas: List[PartidaCreate]

    @model_validator(mode="after")
    def validar_partidas_dobradas(self):
        debitos = sum(p.valor for p in self.partidas if p.tipo == "DEBITO")
        creditos = sum(p.valor for p in self.partidas if p.tipo == "CREDITO")
        if abs(debitos - creditos) > 0.009:
            raise ValueError(f"As partidas não fecham! Total Débitos: R$ {debitos:.2f} != Total Créditos: R$ {creditos:.2f}")
        if len(self.partidas) < 2:
            raise ValueError("O lançamento contábil exige no mínimo uma partida a débito e uma a crédito.")
        return self

class LancamentoResponse(BaseModel):
    id: int
    empresa_id: int
    numero: int
    data: date
    tipo: str
    historico: str
    documento: Optional[str] = None
    conciliado: bool
    criado_em: datetime
    partidas: List[PartidaResponse]
    model_config = ConfigDict(from_attributes=True)


# --- Conciliação OFX ---
class TransacaoOFXResponse(BaseModel):
    id: int
    empresa_id: int
    conta_bancaria_id: int
    fitid: str
    data: date
    tipo: str
    valor: float
    memo: str
    status: str
    lancamento_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class ConciliarTransacaoRequest(BaseModel):
    conta_contrapartida_id: int
    historico: str
    centro_custo_id: Optional[int] = None

class RegraConciliacaoCreate(BaseModel):
    padrao_texto: str
    conta_contrapartida_id: int
    centro_custo_id: Optional[int] = None
    historico_padrao: str
    ativa: bool = True

class RegraConciliacaoResponse(RegraConciliacaoCreate):
    id: int
    empresa_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Relatórios Contábeis ---
class LinhaBalancete(BaseModel):
    conta_id: int
    codigo: str
    codigo_reduzido: int
    descricao: str
    tipo: str
    natureza: str
    saldo_anterior: float
    movimento_debito: float
    movimento_credito: float
    saldo_atual: float

class BalanceteResponse(BaseModel):
    empresa_id: int
    data_inicio: date
    data_fim: date
    total_debito: float
    total_credito: float
    linhas: List[LinhaBalancete]

class LinhaDemonstracao(BaseModel):
    codigo: str
    descricao: str
    valor: float
    nivel: int
    destaque: bool = False

class BalancoPatrimonialResponse(BaseModel):
    empresa_id: int
    data_posicao: date
    ativo: List[LinhaDemonstracao]
    passivo_pl: List[LinhaDemonstracao]
    total_ativo: float
    total_passivo_pl: float
    balanceado: bool

class DREResponse(BaseModel):
    empresa_id: int
    data_inicio: date
    data_fim: date
    linhas: List[LinhaDemonstracao]
    lucro_prejuizo_liquido: float

class DFCResponse(BaseModel):
    empresa_id: int
    data_inicio: date
    data_fim: date
    operacionais: List[LinhaDemonstracao]
    investimentos: List[LinhaDemonstracao]
    financiamentos: List[LinhaDemonstracao]
    variacao_liquida_caixa: float

# --- Reforma Tributária ---
class SimuladorReformaRequest(BaseModel):
    faturamento_mensal: float
    compras_insumos_mensal: float
    folha_salarios_mensal: float
    regime_atual: str = "LUCRO_PRESUMIDO" # SIMPLES, LUCRO_PRESUMIDO, LUCRO_REAL
    aliquota_cbs: float = 8.8   # CBS Federal prevista
    aliquota_ibs: float = 17.7  # IBS Estados/Municípios previsto
    aliquota_is: float = 0.0    # Imposto Seletivo se aplicável

class SimuladorReformaResponse(BaseModel):
    tributacao_atual: dict
    tributacao_nova_reforma: dict
    diferenca_mensal: float
    diferenca_anual: float
    variacao_percentual: float
    credito_cbs_ibs_mensal: float
    diagnostico: str
