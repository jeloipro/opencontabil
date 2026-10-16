const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "") + "/api/v1";

export function buildUrl(path: string): URL {
  const base = API_BASE.startsWith("http")
    ? API_BASE
    : (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000") + API_BASE;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(base + cleanPath);
}

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
    try {
      const res = await fetch(buildUrl("/empresas").toString());
      if (!res.ok) {
        console.error("Erro getEmpresas:", res.status, res.statusText);
        return [];
      }
      return await res.json();
    } catch (e) {
      console.error("Falha ao buscar empresas:", e);
      return [];
    }
  },
  async getEmpresa(id: number): Promise<Empresa> {
    const res = await fetch(buildUrl(`/empresas/${id}`).toString());
    if (!res.ok) throw new Error("Empresa não encontrada");
    return res.json();
  },
  async createEmpresa(data: Partial<Empresa>): Promise<Empresa> {
    const res = await fetch(buildUrl("/empresas").toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao criar empresa");
    return res.json();
  },

  // Plano de Contas
  async getPlanoContas(empresaId: number, tipo?: string): Promise<ContaContabil[]> {
    try {
      const url = buildUrl(`/plano-contas/${empresaId}`);
      if (tipo) url.searchParams.append("tipo", tipo);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Falha ao buscar plano de contas:", e);
      return [];
    }
  },
  async createConta(empresaId: number, data: Partial<ContaContabil>): Promise<ContaContabil> {
    const res = await fetch(buildUrl(`/plano-contas/${empresaId}`).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao criar conta");
    return res.json();
  },

  // Centros de Custo
  async getCentrosCusto(empresaId: number): Promise<CentroCusto[]> {
    try {
      const res = await fetch(buildUrl(`/centros-custo/${empresaId}`).toString());
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Falha ao buscar centros de custo:", e);
      return [];
    }
  },

  // Lançamentos
  async getLancamentos(empresaId: number, dataInicio?: string, dataFim?: string): Promise<Lancamento[]> {
    try {
      const url = buildUrl(`/lancamentos/${empresaId}`);
      if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
      if (dataFim) url.searchParams.append("data_fim", dataFim);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Falha ao buscar lançamentos:", e);
      return [];
    }
  },
  async createLancamento(empresaId: number, data: any): Promise<Lancamento> {
    const res = await fetch(buildUrl(`/lancamentos/${empresaId}`).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao criar lançamento");
    return res.json();
  },
  async deleteLancamento(id: number): Promise<any> {
    const res = await fetch(buildUrl(`/lancamentos/${id}`).toString(), { method: "DELETE" });
    return res.json();
  },

  // Relatórios
  async getBalancete(empresaId: number, dataInicio?: string, dataFim?: string): Promise<BalanceteData> {
    const url = buildUrl(`/relatorios/balancete/${empresaId}`);
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Erro ao gerar Balancete");
    return res.json();
  },
  async getBalanco(empresaId: number, dataPosicao?: string): Promise<BalancoData> {
    const url = buildUrl(`/relatorios/balanco-patrimonial/${empresaId}`);
    if (dataPosicao) url.searchParams.append("data_posicao", dataPosicao);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Erro ao gerar Balanço Patrimonial");
    return res.json();
  },
  async getDRE(empresaId: number, dataInicio?: string, dataFim?: string): Promise<DREData> {
    const url = buildUrl(`/relatorios/dre/${empresaId}`);
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Erro ao gerar DRE");
    return res.json();
  },
  async getLivroDiario(empresaId: number, dataInicio?: string, dataFim?: string): Promise<any> {
    const url = buildUrl(`/relatorios/livro-diario/${empresaId}`);
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Erro ao gerar Livro Diário");
    return res.json();
  },
  async getLivroRazao(empresaId: number, contaId?: number, dataInicio?: string, dataFim?: string): Promise<any[]> {
    const url = buildUrl(`/relatorios/livro-razao/${empresaId}`);
    if (contaId) url.searchParams.append("conta_id", contaId.toString());
    if (dataInicio) url.searchParams.append("data_inicio", dataInicio);
    if (dataFim) url.searchParams.append("data_fim", dataFim);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Erro ao gerar Livro Razão");
    return res.json();
  },

  // Conciliação Bancária
  async getTransacoesOFX(empresaId: number, status?: string): Promise<TransacaoOFX[]> {
    try {
      const url = buildUrl(`/conciliacao/transacoes/${empresaId}`);
      if (status) url.searchParams.append("status", status);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Falha ao buscar transações OFX:", e);
      return [];
    }
  },
  async importarOFXTexto(empresaId: number, contaBancariaId: number, conteudoOfx: string): Promise<any> {
    const res = await fetch(buildUrl(`/conciliacao/importar-ofx-texto/${empresaId}`).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conta_bancaria_id: contaBancariaId, conteudo_ofx: conteudoOfx }),
    });
    return res.json();
  },
  async conciliarTransacao(transacaoId: number, data: { conta_contrapartida_id: number; historico: string; centro_custo_id?: number }): Promise<any> {
    const res = await fetch(buildUrl(`/conciliacao/conciliar/${transacaoId}`).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || "Erro ao conciliar");
    return res.json();
  },

  // Fiscal / SPED
  getSpedEcdUrl(empresaId: number, ano: number = 2026): string {
    return buildUrl(`/fiscal-sped/exportar-ecd/${empresaId}?ano=${ano}`).toString();
  },
  async validarSpedECD(empresaId: number, ano: number = 2026): Promise<any> {
    const res = await fetch(buildUrl(`/fiscal-sped/validar-ecd/${empresaId}?ano=${ano}`).toString());
    return res.json();
  },
  async simularReforma(data: any): Promise<any> {
    const res = await fetch(buildUrl("/fiscal-sped/simular-reforma").toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Dashboard
  async getDashboard(empresaId: number): Promise<any> {
    const res = await fetch(buildUrl(`/dashboard/${empresaId}`).toString());
    if (!res.ok) throw new Error("Erro ao carregar dados do dashboard");
    return res.json();
  },
};
