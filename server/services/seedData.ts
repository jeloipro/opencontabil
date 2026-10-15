export interface EmpresaModel {
  id: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  regime_tributario: string;
  cnae?: string;
  cidade: string;
  uf: string;
  ano_exercicio: number;
  data_bloqueio?: string | null;
  criado_em: string;
}

export interface ContaModel {
  id: number;
  empresa_id: number;
  codigo: string;
  codigo_reduzido: number;
  descricao: string;
  tipo: "SINTETICA" | "ANALITICA";
  natureza: "DEVEDORA" | "CREDORA";
  grupo: "ATIVO" | "PASSIVO" | "PATRIMONIO_LIQUIDO" | "CUSTOS" | "DESPESAS" | "RECEITAS";
  nivel: number;
  codigo_referencial_rfb?: string;
  ativa: boolean;
}

export interface CentroCustoModel {
  id: number;
  empresa_id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
}

export interface PartidaModel {
  id: number;
  lancamento_id: number;
  conta_id: number;
  tipo: "DEBITO" | "CREDITO";
  valor: number;
  centro_custo_id?: number | null;
  complemento?: string | null;
}

export interface LancamentoModel {
  id: number;
  empresa_id: number;
  numero: number;
  data: string;
  tipo: string;
  historico: string;
  documento?: string | null;
  conciliado: boolean;
  criado_em: string;
}

export interface TransacaoOFXModel {
  id: number;
  empresa_id: number;
  conta_bancaria_id: number;
  fitid: string;
  data: string;
  tipo: "DEBIT" | "CREDIT";
  valor: number;
  memo: string;
  status: "PENDENTE" | "CONCILIADO" | "IGNORADO";
  lancamento_id?: number | null;
}

export interface RegraConciliacaoModel {
  id: number;
  empresa_id: number;
  padrao_texto: string;
  conta_contrapartida_id: number;
  centro_custo_id?: number | null;
  historico_padrao: string;
  ativa: boolean;
}

export const PLANO_CONTAS_PADRAO: Array<[string, number, string, "SINTETICA" | "ANALITICA", "DEVEDORA" | "CREDORA", any, number, string]> = [
  // 1 - ATIVO
  ["1", 1, "ATIVO", "SINTETICA", "DEVEDORA", "ATIVO", 1, "1"],
  ["1.1", 2, "ATIVO CIRCULANTE", "SINTETICA", "DEVEDORA", "ATIVO", 2, "1.01"],
  ["1.1.01", 3, "DISPONIBILIDADES", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.01"],
  ["1.1.01.001", 10, "Caixa Geral", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.01.01"],
  ["1.1.01.002", 20, "Banco Itaú C/C", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.02.01"],
  ["1.1.01.003", 25, "Banco Bradesco C/C", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.02.02"],
  ["1.1.01.004", 30, "Aplicações de Liquidez Imediata", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.03.01"],
  ["1.1.02", 4, "CLIENTES E CONTAS A RECEBER", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.02"],
  ["1.1.02.001", 40, "Clientes Nacionais", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.02.01.01"],
  ["1.1.02.002", 45, "(-) Provisão para Devedores Duvidosos (PCLD)", "ANALITICA", "CREDORA", "ATIVO", 4, "1.01.02.01.09"],
  ["1.1.03", 5, "ESTOQUES", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.03"],
  ["1.1.03.001", 50, "Mercadorias para Revenda", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.03.01.01"],
  ["1.1.04", 6, "TRIBUTOS A RECUPERAR", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.04"],
  ["1.1.04.001", 60, "ICMS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.01"],
  ["1.1.04.002", 61, "PIS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.02"],
  ["1.1.04.003", 62, "COFINS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.03"],
  ["1.1.04.004", 63, "CBS a Recuperar (Reforma Tributária)", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.04"],
  ["1.1.04.005", 64, "IBS a Recuperar (Reforma Tributária)", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.05"],

  ["1.2", 7, "ATIVO NÃO CIRCULANTE", "SINTETICA", "DEVEDORA", "ATIVO", 2, "1.02"],
  ["1.2.01", 8, "IMOBILIZADO", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.02.01"],
  ["1.2.01.001", 80, "Computadores e Equipamentos", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.02.01.01.01"],
  ["1.2.01.002", 81, "Móveis e Utensílios", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.02.01.01.02"],
  ["1.2.01.003", 85, "(-) Depreciação Acumulada", "ANALITICA", "CREDORA", "ATIVO", 4, "1.02.01.01.09"],

  // 2 - PASSIVO
  ["2", 100, "PASSIVO", "SINTETICA", "CREDORA", "PASSIVO", 1, "2"],
  ["2.1", 101, "PASSIVO CIRCULANTE", "SINTETICA", "CREDORA", "PASSIVO", 2, "2.01"],
  ["2.1.01", 102, "OBRIGAÇÕES TRABALHISTAS E PREVIDENCIÁRIAS", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.01"],
  ["2.1.01.001", 110, "Salários e Ordenados a Pagar", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.01.01"],
  ["2.1.01.002", 111, "INSS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.02.01"],
  ["2.1.01.003", 112, "FGTS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.02.02"],
  ["2.1.01.004", 115, "Provisão de Férias e 13º Salário", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.03.01"],
  ["2.1.02", 103, "FORNECEDORES", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.02"],
  ["2.1.02.001", 120, "Fornecedores Nacionais", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.02.01.01"],
  ["2.1.03", 104, "OBRIGAÇÕES FISCAIS / TRIBUTÁRIAS", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.03"],
  ["2.1.03.001", 130, "Simples Nacional a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.01"],
  ["2.1.03.002", 131, "IRPJ e CSLL a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.02"],
  ["2.1.03.003", 132, "PIS / COFINS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.03"],
  ["2.1.03.004", 133, "ISSQN a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.04"],
  ["2.1.03.005", 134, "CBS a Recolher (Reforma)", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.05"],
  ["2.1.03.006", 135, "IBS a Recolher (Reforma)", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.06"],

  // 3 - PATRIMÔNIO LÍQUIDO
  ["3", 200, "PATRIMÔNIO LÍQUIDO", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 1, "2.03"],
  ["3.1", 201, "CAPITAL SOCIAL", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 2, "2.03.01"],
  ["3.1.01.001", 210, "Capital Social Subscrito e Integralizado", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.01.01.01"],
  ["3.2", 202, "LUCROS OU PREJUÍZOS ACUMULADOS", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 2, "2.03.04"],
  ["3.2.01.001", 220, "Lucros Acumulados de Exercícios Anteriores", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.04.01.01"],
  ["3.2.01.002", 225, "Resultado do Exercício Atual", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.04.01.02"],

  // 4 - CUSTOS E DESPESAS (RESULTADO)
  ["4", 300, "CONTAS DE RESULTADO - DESPESAS E CUSTOS", "SINTETICA", "DEVEDORA", "DESPESAS", 1, "3"],
  ["4.1", 301, "CUSTOS DOS SERVIÇOS E MERCADORIAS", "SINTETICA", "DEVEDORA", "CUSTOS", 2, "3.01"],
  ["4.1.01.001", 310, "Custo das Mercadorias Vendidas (CMV)", "ANALITICA", "DEVEDORA", "CUSTOS", 4, "3.01.01.01.01"],
  ["4.1.01.002", 315, "Custo dos Serviços Prestados (CSP)", "ANALITICA", "DEVEDORA", "CUSTOS", 4, "3.01.01.01.02"],
  ["4.2", 302, "DESPESAS OPERACIONAIS", "SINTETICA", "DEVEDORA", "DESPESAS", 2, "3.02"],
  ["4.2.01", 303, "DESPESAS ADMINISTRATIVAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.01"],
  ["4.2.01.001", 320, "Aluguel e Condomínio", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.01"],
  ["4.2.01.002", 321, "Energia Elétrica, Água e Internet", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.02"],
  ["4.2.01.003", 322, "Material de Escritório e Informática", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.03"],
  ["4.2.01.004", 323, "Honorários Contábeis e Jurídicos", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.04"],
  ["4.2.02", 304, "DESPESAS COM PESSOAL", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.02"],
  ["4.2.02.001", 330, "Salários, Pró-Labore e Benefícios", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.02.01.01"],
  ["4.2.02.002", 331, "Encargos Sociais (INSS / FGTS)", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.02.01.02"],
  ["4.2.03", 305, "DESPESAS FINANCEIRAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.03"],
  ["4.2.03.001", 340, "Tarifas Bancárias e Manutenção de Conta", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.03.01.01"],
  ["4.2.03.002", 341, "Juros Passivos e Multas", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.03.01.02"],
  ["4.2.04", 306, "DESPESAS TRIBUTÁRIAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.04"],
  ["4.2.04.001", 350, "Simples Nacional / DAS", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.04.01.01"],
  ["4.2.04.002", 351, "IRPJ e CSLL do Exercício", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.04.01.02"],

  // 5 - RECEITAS (RESULTADO)
  ["5", 400, "CONTAS DE RESULTADO - RECEITAS", "SINTETICA", "CREDORA", "RECEITAS", 1, "4"],
  ["5.1", 401, "RECEITA OPERACIONAL BRUTA", "SINTETICA", "CREDORA", "RECEITAS", 2, "4.01"],
  ["5.1.01.001", 410, "Receita de Prestação de Serviços Contábeis/TI", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.01.01.01.01"],
  ["5.1.01.002", 420, "Receita de Venda de Mercadorias", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.01.01.02.01"],
  ["5.2", 402, "RECEITAS FINANCEIRAS", "SINTETICA", "CREDORA", "RECEITAS", 2, "4.02"],
  ["5.2.01.001", 430, "Rendimentos de Aplicações Financeiras", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.02.01.01.01"]
];

