const API_BASE = "http://localhost:8000/api/v1";

export interface Empresa {
  id: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  regime_tributario: string;
  cnae?: string;
  cidade: string;
  uf: string;
  ano_exercicio: number;
  data_bloqueio?: string;
}

export interface ContaContabil {
  id: number;
  empresa_id: number;
  codigo: string;
  codigo_reduzido: number;
  descricao: string;
  tipo: "SINTETICA" | "ANALITICA";
  natureza: "DEVEDORA" | "CREDORA";
  grupo: string;
  nivel: number;
  codigo_referencial_rfb?: string;
  ativa: boolean;
}

export interface CentroCusto {
  id: number;
  empresa_id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
}

export interface Partida {
  id?: number;
  conta_id: number;
  tipo: "DEBITO" | "CREDITO";
  valor: number;
  centro_custo_id?: number;
  complemento?: string;
  conta_codigo?: string;
  conta_descricao?: string;
}

export interface Lancamento {
  id: number;
  empresa_id: number;
  numero: number;
  data: string;
  tipo: string;
  historico: string;
  documento?: string;
  conciliado: boolean;
  partidas: Partida[];
}

export interface LinhaBalancete {
  conta_id: number;
  codigo: string;
  codigo_reduzido: number;
  descricao: string;
  tipo: string;
  natureza: string;
  saldo_anterior: number;
  movimento_debito: number;
  movimento_credito: number;
  saldo_atual: number;
}

export interface BalanceteData {
  empresa_id: number;
  data_inicio: string;
  data_fim: string;
  total_debito: number;
  total_credito: number;
  linhas: LinhaBalancete[];
}

export interface LinhaDemonstracao {
  codigo: string;
  descricao: string;
  valor: number;
  nivel: number;
  destaque?: boolean;
}

export interface BalancoData {
  empresa_id: number;
  data_posicao: string;
  ativo: LinhaDemonstracao[];
  passivo_pl: LinhaDemonstracao[];
  total_ativo: number;
  total_passivo_pl: number;
  balanceado: boolean;
}

export interface DREData {
  empresa_id: number;
  data_inicio: string;
  data_fim: string;
  linhas: LinhaDemonstracao[];
  lucro_prejuizo_liquido: number;
}

export interface TransacaoOFX {
  id: number;
  empresa_id: number;
  conta_bancaria_id: number;
  fitid: string;
  data: string;
  tipo: "DEBIT" | "CREDIT";
  valor: number;
  memo: string;
  status: "PENDENTE" | "CONCILIADO" | "IGNORADO";
  lancamento_id?: number;
}

export const api = {
  // Empresas
  async getEmpresas(): Promise<Empresa[]> {
    const res = await fetch(`${API_BASE}/empresas/`);
    return res.json();
  },
  async getEmpresa(id: number): Promise<Empresa> {
    const res = await fetch(`${API_BASE}/empresas/${id}`);
    return res.json();
  },
  async createEmpresa(data: Partial<Empresa>): Promise<Empresa> {
    const res = await fetch(`${API_BASE}/empresas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao criar empresa");
    return res.json();
  },

  // Plano de Contas
  async getPlanoContas(empresaId: number, tipo?: string): Promise<ContaContabil[]> {
    const url = new URL(`${API_BASE}/plano-contas/${empresaId}`);
    if (tipo) url.searchParams.append("tipo", tipo);
    const res = await fetch(url.toString());
    return res.json();
  },
  async createConta(empresaId: number, data: Partial<ContaContabil>): Promise<ContaContabil> {
    const res = await fetch(`${API_BASE}/plano-contas/${empresaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao criar conta");
    return res.json();
  },

  // Centros de Custo
  async getCentrosCusto(empresaId: number): Promise<CentroCusto[]> {
    const res = await fetch(`${API_BASE}/centros-custo/${empresaId}`);
    return res.json();
  },

  // Lançamentos
  async getLancamentos(empresaId: number, dataInicio?: string, dataFim?: string): Promise<Lancamento[]> {
    const url = new URL(`${API_BASE}/lancamentos/${empresaId}`);
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    return res.json();
  },
  async createLancamento(empresaId: number, data: any): Promise<Lancamento> {
    const res = await fetch(`${API_BASE}/lancamentos/${empresaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao criar lançamento");
    return res.json();
  },
  async deleteLancamento(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/lancamentos/${id}`, { method: "DELETE" });
    return res.json();
  },

  // Relatórios
  async getBalancete(empresaId: number, dataInicio?: string, dataFim?: string): Promise<BalanceteData> {
    const url = new URL(`${API_BASE}/relatorios/balancete/${empresaId}`);
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    return res.json();
  },
  async getBalanco(empresaId: number, dataPosicao?: string): Promise<BalancoData> {
    const url = new URL(`${API_BASE}/relatorios/balanco-patrimonial/${empresaId}`);
    if (dataPosicao) url.searchParams.append("data_posicao", dataPosicao);
    const res = await fetch(url.toString());
    return res.json();
  },
  async getDRE(empresaId: number, dataInicio?: string, dataFim?: string): Promise<DREData> {
    const url = new URL(`${API_BASE}/relatorios/dre/${empresaId}`);
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    return res.json();
  },
  async getLivroDiario(empresaId: number, dataInicio?: string, dataFim?: string): Promise<any> {
    const url = new URL(`${API_BASE}/relatorios/livro-diario/${empresaId}`);
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    return res.json();
  },
  async getLivroRazao(empresaId: number, contaId?: number, dataInicio?: string, dataFim?: string): Promise<any[]> {
    const url = new URL(`${API_BASE}/relatorios/livro-razao/${empresaId}`);
    if (contaId) url.searchParams.append("conta_id", contaId.toString());
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    return res.json();
  },

  // Conciliação Bancária
  async getTransacoesOFX(empresaId: number, status?: string): Promise<TransacaoOFX[]> {
    const url = new URL(`${API_BASE}/conciliacao/transacoes/${empresaId}`);
    if (status) url.searchParams.append("status", status);
    const res = await fetch(url.toString());
    return res.json();
  },
  async importarOFXTexto(empresaId: number, contaBancariaId: number, conteudoOfx: string): Promise<any> {
    const res = await fetch(`${API_BASE}/conciliacao/importar-ofx-texto/${empresaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conta_bancaria_id: contaBancariaId, conteudo_ofx: conteudoOfx }),
    });
    return res.json();
  },
  async conciliarTransacao(transacaoId: number, data: { conta_contrapartida_id: number; historico: string; centro_custo_id?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/conciliacao/conciliar/${transacaoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao conciliar");
    return res.json();
  },

  // Fiscal / SPED
  getSpedEcdUrl(empresaId: number, ano: number = 2026): string {
    return `${API_BASE}/fiscal-sped/exportar-ecd/${empresaId}?ano=${ano}`;
  },
  async validarSpedECD(empresaId: number, ano: number = 2026): Promise<any> {
    const res = await fetch(`${API_BASE}/fiscal-sped/validar-ecd/${empresaId}?ano=${ano}`);
    return res.json();
  },
  async simularReforma(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/fiscal-sped/simular-reforma`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Dashboard
  async getDashboard(empresaId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboard/${empresaId}`);
    if (!res.ok) throw new Error("Erro ao carregar dados do dashboard");
    return res.json();
  },
};
