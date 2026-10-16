// server/app.ts
import express from "express";
import cors from "cors";

// server/services/seedData.ts
var PLANO_CONTAS_PADRAO = [
  // 1 - ATIVO
  ["1", 1, "ATIVO", "SINTETICA", "DEVEDORA", "ATIVO", 1, "1"],
  ["1.1", 2, "ATIVO CIRCULANTE", "SINTETICA", "DEVEDORA", "ATIVO", 2, "1.01"],
  ["1.1.01", 3, "DISPONIBILIDADES", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.01"],
  ["1.1.01.001", 10, "Caixa Geral", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.01.01"],
  ["1.1.01.002", 20, "Banco Ita\xFA C/C", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.02.01"],
  ["1.1.01.003", 25, "Banco Bradesco C/C", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.02.02"],
  ["1.1.01.004", 30, "Aplica\xE7\xF5es de Liquidez Imediata", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.03.01"],
  ["1.1.02", 4, "CLIENTES E CONTAS A RECEBER", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.02"],
  ["1.1.02.001", 40, "Clientes Nacionais", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.02.01.01"],
  ["1.1.02.002", 45, "(-) Provis\xE3o para Devedores Duvidosos (PCLD)", "ANALITICA", "CREDORA", "ATIVO", 4, "1.01.02.01.09"],
  ["1.1.03", 5, "ESTOQUES", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.03"],
  ["1.1.03.001", 50, "Mercadorias para Revenda", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.03.01.01"],
  ["1.1.04", 6, "TRIBUTOS A RECUPERAR", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.04"],
  ["1.1.04.001", 60, "ICMS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.01"],
  ["1.1.04.002", 61, "PIS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.02"],
  ["1.1.04.003", 62, "COFINS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.03"],
  ["1.1.04.004", 63, "CBS a Recuperar (Reforma Tribut\xE1ria)", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.04"],
  ["1.1.04.005", 64, "IBS a Recuperar (Reforma Tribut\xE1ria)", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.05"],
  ["1.2", 7, "ATIVO N\xC3O CIRCULANTE", "SINTETICA", "DEVEDORA", "ATIVO", 2, "1.02"],
  ["1.2.01", 8, "IMOBILIZADO", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.02.01"],
  ["1.2.01.001", 80, "Computadores e Equipamentos", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.02.01.01.01"],
  ["1.2.01.002", 81, "M\xF3veis e Utens\xEDlios", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.02.01.01.02"],
  ["1.2.01.003", 85, "(-) Deprecia\xE7\xE3o Acumulada", "ANALITICA", "CREDORA", "ATIVO", 4, "1.02.01.01.09"],
  // 2 - PASSIVO
  ["2", 100, "PASSIVO", "SINTETICA", "CREDORA", "PASSIVO", 1, "2"],
  ["2.1", 101, "PASSIVO CIRCULANTE", "SINTETICA", "CREDORA", "PASSIVO", 2, "2.01"],
  ["2.1.01", 102, "OBRIGA\xC7\xD5ES TRABALHISTAS E PREVIDENCI\xC1RIAS", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.01"],
  ["2.1.01.001", 110, "Sal\xE1rios e Ordenados a Pagar", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.01.01"],
  ["2.1.01.002", 111, "INSS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.02.01"],
  ["2.1.01.003", 112, "FGTS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.02.02"],
  ["2.1.01.004", 115, "Provis\xE3o de F\xE9rias e 13\xBA Sal\xE1rio", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.03.01"],
  ["2.1.02", 103, "FORNECEDORES", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.02"],
  ["2.1.02.001", 120, "Fornecedores Nacionais", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.02.01.01"],
  ["2.1.03", 104, "OBRIGA\xC7\xD5ES FISCAIS / TRIBUT\xC1RIAS", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.03"],
  ["2.1.03.001", 130, "Simples Nacional a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.01"],
  ["2.1.03.002", 131, "IRPJ e CSLL a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.02"],
  ["2.1.03.003", 132, "PIS / COFINS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.03"],
  ["2.1.03.004", 133, "ISSQN a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.04"],
  ["2.1.03.005", 134, "CBS a Recolher (Reforma)", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.05"],
  ["2.1.03.006", 135, "IBS a Recolher (Reforma)", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.06"],
  // 3 - PATRIMÔNIO LÍQUIDO
  ["3", 200, "PATRIM\xD4NIO L\xCDQUIDO", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 1, "2.03"],
  ["3.1", 201, "CAPITAL SOCIAL", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 2, "2.03.01"],
  ["3.1.01.001", 210, "Capital Social Subscrito e Integralizado", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.01.01.01"],
  ["3.2", 202, "LUCROS OU PREJU\xCDZOS ACUMULADOS", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 2, "2.03.04"],
  ["3.2.01.001", 220, "Lucros Acumulados de Exerc\xEDcios Anteriores", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.04.01.01"],
  ["3.2.01.002", 225, "Resultado do Exerc\xEDcio Atual", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.04.01.02"],
  // 4 - CUSTOS E DESPESAS (RESULTADO)
  ["4", 300, "CONTAS DE RESULTADO - DESPESAS E CUSTOS", "SINTETICA", "DEVEDORA", "DESPESAS", 1, "3"],
  ["4.1", 301, "CUSTOS DOS SERVI\xC7OS E MERCADORIAS", "SINTETICA", "DEVEDORA", "CUSTOS", 2, "3.01"],
  ["4.1.01.001", 310, "Custo das Mercadorias Vendidas (CMV)", "ANALITICA", "DEVEDORA", "CUSTOS", 4, "3.01.01.01.01"],
  ["4.1.01.002", 315, "Custo dos Servi\xE7os Prestados (CSP)", "ANALITICA", "DEVEDORA", "CUSTOS", 4, "3.01.01.01.02"],
  ["4.2", 302, "DESPESAS OPERACIONAIS", "SINTETICA", "DEVEDORA", "DESPESAS", 2, "3.02"],
  ["4.2.01", 303, "DESPESAS ADMINISTRATIVAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.01"],
  ["4.2.01.001", 320, "Aluguel e Condom\xEDnio", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.01"],
  ["4.2.01.002", 321, "Energia El\xE9trica, \xC1gua e Internet", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.02"],
  ["4.2.01.003", 322, "Material de Escrit\xF3rio e Inform\xE1tica", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.03"],
  ["4.2.01.004", 323, "Honor\xE1rios Cont\xE1beis e Jur\xEDdicos", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.04"],
  ["4.2.02", 304, "DESPESAS COM PESSOAL", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.02"],
  ["4.2.02.001", 330, "Sal\xE1rios, Pr\xF3-Labore e Benef\xEDcios", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.02.01.01"],
  ["4.2.02.002", 331, "Encargos Sociais (INSS / FGTS)", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.02.01.02"],
  ["4.2.03", 305, "DESPESAS FINANCEIRAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.03"],
  ["4.2.03.001", 340, "Tarifas Banc\xE1rias e Manuten\xE7\xE3o de Conta", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.03.01.01"],
  ["4.2.03.002", 341, "Juros Passivos e Multas", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.03.01.02"],
  ["4.2.04", 306, "DESPESAS TRIBUT\xC1RIAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.04"],
  ["4.2.04.001", 350, "Simples Nacional / DAS", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.04.01.01"],
  ["4.2.04.002", 351, "IRPJ e CSLL do Exerc\xEDcio", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.04.01.02"],
  // 5 - RECEITAS (RESULTADO)
  ["5", 400, "CONTAS DE RESULTADO - RECEITAS", "SINTETICA", "CREDORA", "RECEITAS", 1, "4"],
  ["5.1", 401, "RECEITA OPERACIONAL BRUTA", "SINTETICA", "CREDORA", "RECEITAS", 2, "4.01"],
  ["5.1.01.001", 410, "Receita de Presta\xE7\xE3o de Servi\xE7os Cont\xE1beis/TI", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.01.01.01.01"],
  ["5.1.01.002", 420, "Receita de Venda de Mercadorias", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.01.01.02.01"],
  ["5.2", 402, "RECEITAS FINANCEIRAS", "SINTETICA", "CREDORA", "RECEITAS", 2, "4.02"],
  ["5.2.01.001", 430, "Rendimentos de Aplica\xE7\xF5es Financeiras", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.02.01.01.01"]
];

// server/db/database.ts
var DataStore = class {
  empresas = [];
  contas = [];
  centrosCusto = [];
  lancamentos = [];
  partidas = [];
  transacoesOFX = [];
  regrasConciliacao = [];
  initialized = false;
  constructor() {
    this.init();
  }
  init() {
    if (this.initialized) return;
    const emp = {
      id: 1,
      cnpj: "12.345.678/0001-90",
      razao_social: "AZIENDA AUDITORIA & SERVI\xC7OS CONT\xC1BEIS LTDA",
      nome_fantasia: "Azienda Contabilidade Inteligente",
      inscricao_estadual: "111.222.333.444",
      inscricao_municipal: "555.666-7",
      regime_tributario: "SIMPLES",
      cnae: "6920-6/01",
      cidade: "S\xE3o Paulo",
      uf: "SP",
      ano_exercicio: 2026,
      data_bloqueio: null,
      criado_em: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.empresas.push(emp);
    this.centrosCusto.push(
      { id: 1, empresa_id: 1, codigo: "01", nome: "Administrativo / Diretoria", ativo: true },
      { id: 2, empresa_id: 1, codigo: "02", nome: "Opera\xE7\xF5es Cont\xE1beis & Fiscais", ativo: true },
      { id: 3, empresa_id: 1, codigo: "03", nome: "Comercial & Marketing", ativo: true }
    );
    let contaIdCounter = 1;
    const contasMap = {};
    for (const [cod, codRed, desc, tipo, nat, grupo, nivel, refRfb] of PLANO_CONTAS_PADRAO) {
      const conta = {
        id: contaIdCounter++,
        empresa_id: 1,
        codigo: cod,
        codigo_reduzido: codRed,
        descricao: desc,
        tipo,
        natureza: nat,
        grupo,
        nivel,
        codigo_referencial_rfb: refRfb,
        ativa: true
      };
      this.contas.push(conta);
      contasMap[codRed] = conta.id;
    }
    this.regrasConciliacao.push(
      {
        id: 1,
        empresa_id: 1,
        padrao_texto: "TARIFA",
        conta_contrapartida_id: contasMap[340],
        centro_custo_id: 1,
        historico_padrao: "Despesa com tarifa banc\xE1ria s/ extrato",
        ativa: true
      },
      {
        id: 2,
        empresa_id: 1,
        padrao_texto: "RENDIMENTO",
        conta_contrapartida_id: contasMap[430],
        centro_custo_id: 1,
        historico_padrao: "Receita de rendimento de aplica\xE7\xE3o financeira",
        ativa: true
      }
    );
    let pId = 1;
    this.lancamentos.push({
      id: 1,
      empresa_id: 1,
      numero: 1,
      data: "2026-01-05",
      tipo: "ABERTURA",
      historico: "Integraliza\xE7\xE3o de Capital Social conforme Contrato Social registrado",
      documento: "CONTRATO-01",
      conciliado: true,
      criado_em: "2026-01-05T10:00:00Z"
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 1, conta_id: contasMap[20], tipo: "DEBITO", valor: 5e4, complemento: "Entrada em conta Banco Ita\xFA" },
      { id: pId++, lancamento_id: 1, conta_id: contasMap[210], tipo: "CREDITO", valor: 5e4, complemento: "Capital subscrito e integralizado pelos s\xF3cios" }
    );
    this.lancamentos.push({
      id: 2,
      empresa_id: 1,
      numero: 2,
      data: "2026-01-10",
      tipo: "ORDINARIO",
      historico: "Aquisi\xE7\xE3o de equipamentos de TI e mobili\xE1rio para escrit\xF3rio s/ NF 4589",
      documento: "NF-4589",
      conciliado: true,
      criado_em: "2026-01-10T14:30:00Z"
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 2, conta_id: contasMap[80], tipo: "DEBITO", valor: 8e3, centro_custo_id: 2 },
      { id: pId++, lancamento_id: 2, conta_id: contasMap[81], tipo: "DEBITO", valor: 4e3, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 2, conta_id: contasMap[20], tipo: "CREDITO", valor: 12e3 }
    );
    this.lancamentos.push({
      id: 3,
      empresa_id: 1,
      numero: 3,
      data: "2026-01-20",
      tipo: "ORDINARIO",
      historico: "Faturamento de servi\xE7os cont\xE1beis e consultoria tribut\xE1ria do m\xEAs s/ NFS-e 101",
      documento: "NFSE-101",
      conciliado: false,
      criado_em: "2026-01-20T16:00:00Z"
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 3, conta_id: contasMap[40], tipo: "DEBITO", valor: 35e3, complemento: "Clientes a Receber" },
      { id: pId++, lancamento_id: 3, conta_id: contasMap[410], tipo: "CREDITO", valor: 35e3, centro_custo_id: 2 }
    );
    this.lancamentos.push({
      id: 4,
      empresa_id: 1,
      numero: 4,
      data: "2026-01-25",
      tipo: "ORDINARIO",
      historico: "Recebimento de honor\xE1rios cont\xE1beis de clientes via PIX no Banco Ita\xFA",
      documento: "PIX-REC-01",
      conciliado: true,
      criado_em: "2026-01-25T11:00:00Z"
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 4, conta_id: contasMap[20], tipo: "DEBITO", valor: 25e3 },
      { id: pId++, lancamento_id: 4, conta_id: contasMap[40], tipo: "CREDITO", valor: 25e3 }
    );
    this.lancamentos.push({
      id: 5,
      empresa_id: 1,
      numero: 5,
      data: "2026-01-31",
      tipo: "ORDINARIO",
      historico: "Apropria\xE7\xE3o da folha de pagamento do m\xEAs de janeiro/2026",
      documento: "FOLHA-01/2026",
      conciliado: false,
      criado_em: "2026-01-31T17:00:00Z"
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 5, conta_id: contasMap[330], tipo: "DEBITO", valor: 12e3, centro_custo_id: 2 },
      { id: pId++, lancamento_id: 5, conta_id: contasMap[331], tipo: "DEBITO", valor: 3e3, centro_custo_id: 2 },
      { id: pId++, lancamento_id: 5, conta_id: contasMap[110], tipo: "CREDITO", valor: 12e3 },
      { id: pId++, lancamento_id: 5, conta_id: contasMap[111], tipo: "CREDITO", valor: 3e3 }
    );
    this.lancamentos.push({
      id: 6,
      empresa_id: 1,
      numero: 6,
      data: "2026-01-31",
      tipo: "ORDINARIO",
      historico: "Pagamento de despesas operacionais - aluguel e internet s/ recibos",
      documento: "REC-LOC-01",
      conciliado: true,
      criado_em: "2026-01-31T18:00:00Z"
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 6, conta_id: contasMap[320], tipo: "DEBITO", valor: 2800, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 6, conta_id: contasMap[321], tipo: "DEBITO", valor: 700, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 6, conta_id: contasMap[20], tipo: "CREDITO", valor: 3500 }
    );
    this.lancamentos.push({
      id: 7,
      empresa_id: 1,
      numero: 7,
      data: "2026-01-31",
      tipo: "ORDINARIO",
      historico: "Provis\xE3o para tributos do Simples Nacional compet\xEAncia 01/2026",
      documento: "DAS-01/2026",
      conciliado: false,
      criado_em: "2026-01-31T18:30:00Z"
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 7, conta_id: contasMap[350], tipo: "DEBITO", valor: 2100, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 7, conta_id: contasMap[130], tipo: "CREDITO", valor: 2100 }
    );
    this.initialized = true;
  }
};
var db = new DataStore();

// server/services/contabilidadeService.ts
var ContabilidadeService = class {
  static getProximoNumero(empresaId) {
    const numeros = db.lancamentos.filter((l) => l.empresa_id === empresaId).map((l) => l.numero);
    return (Math.max(0, ...numeros) || 0) + 1;
  }
  static criarLancamento(empresaId, input) {
    const empresa = db.empresas.find((e) => e.id === empresaId);
    if (!empresa) throw new Error("Empresa n\xE3o encontrada.");
    if (empresa.data_bloqueio && input.data <= empresa.data_bloqueio) {
      throw new Error(`Per\xEDodo cont\xE1bil at\xE9 ${empresa.data_bloqueio} bloqueado para altera\xE7\xF5es.`);
    }
    if (!input.partidas || input.partidas.length < 2) {
      throw new Error("O lan\xE7amento exige ao menos 2 partidas (1 d\xE9bito e 1 cr\xE9dito).");
    }
    const totalDeb = input.partidas.filter((p) => p.tipo === "DEBITO").reduce((acc, curr) => acc + curr.valor, 0);
    const totalCred = input.partidas.filter((p) => p.tipo === "CREDITO").reduce((acc, curr) => acc + curr.valor, 0);
    if (Math.abs(totalDeb - totalCred) > 9e-3) {
      throw new Error(`Partidas n\xE3o fecham! Total D (R$ ${totalDeb.toFixed(2)}) != Total C (R$ ${totalCred.toFixed(2)})`);
    }
    for (const p of input.partidas) {
      const conta = db.contas.find((c) => c.id === p.conta_id && c.empresa_id === empresaId);
      if (!conta) throw new Error(`Conta ID ${p.conta_id} n\xE3o encontrada.`);
      if (conta.tipo !== "ANALITICA") {
        throw new Error(`A conta ${conta.codigo} (${conta.descricao}) \xE9 SINT\xC9TICA e n\xE3o aceita lan\xE7amentos.`);
      }
      if (!conta.ativa) {
        throw new Error(`A conta ${conta.codigo} est\xE1 inativa.`);
      }
    }
    const nextId = (Math.max(0, ...db.lancamentos.map((l) => l.id)) || 0) + 1;
    const numero = this.getProximoNumero(empresaId);
    const novoLancamento = {
      id: nextId,
      empresa_id: empresaId,
      numero,
      data: input.data,
      tipo: input.tipo || "ORDINARIO",
      historico: input.historico,
      documento: input.documento || null,
      conciliado: false,
      criado_em: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.lancamentos.push(novoLancamento);
    let nextPartidaId = (Math.max(0, ...db.partidas.map((p) => p.id)) || 0) + 1;
    for (const p of input.partidas) {
      db.partidas.push({
        id: nextPartidaId++,
        lancamento_id: novoLancamento.id,
        conta_id: p.conta_id,
        tipo: p.tipo,
        valor: p.valor,
        centro_custo_id: p.centro_custo_id || null,
        complemento: p.complemento || null
      });
    }
    return novoLancamento;
  }
};

// server/services/relatoriosService.ts
var RelatoriosService = class {
  static gerarBalancete(empresaId, dataInicio, dataFim) {
    const contas = db.contas.filter((c) => c.empresa_id === empresaId && c.ativa).sort((a, b) => a.codigo.localeCompare(b.codigo, void 0, { numeric: true }));
    const lancamentos = db.lancamentos.filter((l) => l.empresa_id === empresaId);
    const partidas = db.partidas;
    let totalPeriodoDebito = 0;
    let totalPeriodoCredito = 0;
    const linhas = contas.map((c) => {
      const partidasAnt = partidas.filter((p) => {
        if (p.conta_id !== c.id) return false;
        const l = lancamentos.find((lanc) => lanc.id === p.lancamento_id);
        return l && l.data < dataInicio;
      });
      const debAnt = partidasAnt.filter((p) => p.tipo === "DEBITO").reduce((acc, p) => acc + p.valor, 0);
      const credAnt = partidasAnt.filter((p) => p.tipo === "CREDITO").reduce((acc, p) => acc + p.valor, 0);
      const partidasPer = partidas.filter((p) => {
        if (p.conta_id !== c.id) return false;
        const l = lancamentos.find((lanc) => lanc.id === p.lancamento_id);
        return l && l.data >= dataInicio && l.data <= dataFim;
      });
      const debPer = partidasPer.filter((p) => p.tipo === "DEBITO").reduce((acc, p) => acc + p.valor, 0);
      const credPer = partidasPer.filter((p) => p.tipo === "CREDITO").reduce((acc, p) => acc + p.valor, 0);
      let saldoAnt = c.natureza === "DEVEDORA" ? debAnt - credAnt : credAnt - debAnt;
      let saldoAtu = c.natureza === "DEVEDORA" ? saldoAnt + debPer - credPer : saldoAnt + credPer - debPer;
      if (c.tipo === "ANALITICA") {
        totalPeriodoDebito += debPer;
        totalPeriodoCredito += credPer;
      }
      return {
        conta_id: c.id,
        codigo: c.codigo,
        codigo_reduzido: c.codigo_reduzido,
        descricao: c.descricao,
        tipo: c.tipo,
        natureza: c.natureza,
        saldo_anterior: Number(saldoAnt.toFixed(2)),
        movimento_debito: Number(debPer.toFixed(2)),
        movimento_credito: Number(credPer.toFixed(2)),
        saldo_atual: Number(saldoAtu.toFixed(2))
      };
    });
    for (let nivel = 5; nivel >= 1; nivel--) {
      for (const linha of linhas) {
        if (linha.tipo === "SINTETICA") {
          const prefix = linha.codigo + ".";
          const filhas = linhas.filter((l) => l.codigo.startsWith(prefix) && l.tipo === "ANALITICA");
          if (filhas.length > 0) {
            linha.saldo_anterior = Number(filhas.reduce((a, b) => a + b.saldo_anterior, 0).toFixed(2));
            linha.movimento_debito = Number(filhas.reduce((a, b) => a + b.movimento_debito, 0).toFixed(2));
            linha.movimento_credito = Number(filhas.reduce((a, b) => a + b.movimento_credito, 0).toFixed(2));
            linha.saldo_atual = Number(filhas.reduce((a, b) => a + b.saldo_atual, 0).toFixed(2));
          }
        }
      }
    }
    return {
      empresa_id: empresaId,
      data_inicio: dataInicio,
      data_fim: dataFim,
      total_debito: Number(totalPeriodoDebito.toFixed(2)),
      total_credito: Number(totalPeriodoCredito.toFixed(2)),
      linhas
    };
  }
  static gerarDRE(empresaId, dataInicio, dataFim) {
    const balancete = this.gerarBalancete(empresaId, dataInicio, dataFim);
    const getVal = (prefix) => {
      return balancete.linhas.filter((l) => l.tipo === "ANALITICA" && l.codigo.startsWith(prefix)).reduce((acc, curr) => acc + curr.saldo_atual, 0);
    };
    const recBruta = getVal("5.1");
    const recFinanceira = getVal("5.2");
    const custos = getVal("4.1");
    const despAdm = getVal("4.2.01");
    const despPessoal = getVal("4.2.02");
    const despFinanceira = getVal("4.2.03");
    const despTributaria = getVal("4.2.04");
    const recLiquida = recBruta;
    const lucroBruto = recLiquida - custos;
    const totalDespOperacionais = despAdm + despPessoal + despTributaria;
    const resultadoFinanceiro = recFinanceira - despFinanceira;
    const lucroLiquido = lucroBruto - totalDespOperacionais + resultadoFinanceiro;
    const linhas = [
      { codigo: "1", descricao: "(=) RECEITA OPERACIONAL BRUTA", valor: Number(recBruta.toFixed(2)), nivel: 1, destaque: true },
      { codigo: "1.1", descricao: "    Receita de Servi\xE7os / Vendas", valor: Number(recBruta.toFixed(2)), nivel: 2 },
      { codigo: "2", descricao: "(=) RECEITA OPERACIONAL L\xCDQUIDA", valor: Number(recLiquida.toFixed(2)), nivel: 1, destaque: true },
      { codigo: "3", descricao: "(-) CUSTOS DOS SERVI\xC7OS E MERCADORIAS (CMV/CSP)", valor: Number((-custos).toFixed(2)), nivel: 1 },
      { codigo: "4", descricao: "(=) LUCRO BRUTO OPERACIONAL", valor: Number(lucroBruto.toFixed(2)), nivel: 1, destaque: true },
      { codigo: "5", descricao: "(-) DESPESAS OPERACIONAIS", valor: Number((-totalDespOperacionais).toFixed(2)), nivel: 1, destaque: true },
      { codigo: "5.1", descricao: "    Despesas Administrativas e Gerais", valor: Number((-despAdm).toFixed(2)), nivel: 2 },
      { codigo: "5.2", descricao: "    Despesas com Pessoal e Encargos", valor: Number((-despPessoal).toFixed(2)), nivel: 2 },
      { codigo: "5.3", descricao: "    Despesas Tribut\xE1rias e Impostos", valor: Number((-despTributaria).toFixed(2)), nivel: 2 },
      { codigo: "6", descricao: "(+/-) RESULTADO FINANCEIRO L\xCDQUIDO", valor: Number(resultadoFinanceiro.toFixed(2)), nivel: 1 },
      { codigo: "6.1", descricao: "    Receitas Financeiras / Rendimentos", valor: Number(recFinanceira.toFixed(2)), nivel: 2 },
      { codigo: "6.2", descricao: "    Despesas Financeiras / Tarifas", valor: Number((-despFinanceira).toFixed(2)), nivel: 2 },
      { codigo: "7", descricao: "(=) RESULTADO L\xCDQUIDO DO EXERC\xCDCIO (LUCRO / PREJU\xCDZO)", valor: Number(lucroLiquido.toFixed(2)), nivel: 1, destaque: true }
    ];
    return {
      empresa_id: empresaId,
      data_inicio: dataInicio,
      data_fim: dataFim,
      linhas,
      lucro_prejuizo_liquido: Number(lucroLiquido.toFixed(2))
    };
  }
  static gerarBalancoPatrimonial(empresaId, dataPosicao) {
    const ano = dataPosicao.slice(0, 4);
    const dataIni = `${ano}-01-01`;
    const balancete = this.gerarBalancete(empresaId, dataIni, dataPosicao);
    const dre = this.gerarDRE(empresaId, dataIni, dataPosicao);
    const linhasAtivo = [];
    const linhasPassivo = [];
    let totalAtivo = 0;
    let totalPassivoPl = 0;
    for (const l of balancete.linhas) {
      if (l.codigo.startsWith("1")) {
        linhasAtivo.push({
          codigo: l.codigo,
          descricao: l.descricao,
          valor: l.saldo_atual,
          nivel: l.codigo.split(".").length,
          destaque: l.tipo === "SINTETICA"
        });
        if (l.tipo === "ANALITICA") totalAtivo += l.saldo_atual;
      } else if (l.codigo.startsWith("2") || l.codigo.startsWith("3")) {
        linhasPassivo.push({
          codigo: l.codigo,
          descricao: l.descricao,
          valor: l.saldo_atual,
          nivel: l.codigo.split(".").length,
          destaque: l.tipo === "SINTETICA"
        });
        if (l.tipo === "ANALITICA") totalPassivoPl += l.saldo_atual;
      }
    }
    const lucro = dre.lucro_prejuizo_liquido;
    linhasPassivo.push({
      codigo: "3.2.01.999",
      descricao: "Resultado Apurado no Per\xEDodo Corrente (DRE)",
      valor: lucro,
      nivel: 4,
      destaque: true
    });
    totalPassivoPl += lucro;
    const balanceado = Math.abs(Number(totalAtivo.toFixed(2)) - Number(totalPassivoPl.toFixed(2))) < 0.01;
    return {
      empresa_id: empresaId,
      data_posicao: dataPosicao,
      ativo: linhasAtivo,
      passivo_pl: linhasPassivo,
      total_ativo: Number(totalAtivo.toFixed(2)),
      total_passivo_pl: Number(totalPassivoPl.toFixed(2)),
      balanceado
    };
  }
  static gerarIndicadores(empresaId, dataPosicao) {
    const bp = this.gerarBalancoPatrimonial(empresaId, dataPosicao);
    const ano = dataPosicao.slice(0, 4);
    const dre = this.gerarDRE(empresaId, `${ano}-01-01`, dataPosicao);
    const ativoCirc = bp.ativo.find((l) => l.codigo === "1.1")?.valor || 0;
    const estoques = bp.ativo.find((l) => l.codigo === "1.1.03")?.valor || 0;
    const passivoCirc = bp.passivo_pl.find((l) => l.codigo === "2.1")?.valor || 0;
    const totalPassivo = passivoCirc;
    const totalAtivo = bp.total_ativo;
    const lucroLiquido = dre.lucro_prejuizo_liquido;
    const recLiquida = dre.linhas.find((l) => l.codigo === "2")?.valor || 0;
    return {
      liquidez_corrente: passivoCirc > 0 ? Number((ativoCirc / passivoCirc).toFixed(2)) : 999,
      liquidez_seca: passivoCirc > 0 ? Number(((ativoCirc - estoques) / passivoCirc).toFixed(2)) : 999,
      endividamento_geral_pct: totalAtivo > 0 ? Number((totalPassivo / totalAtivo * 100).toFixed(2)) : 0,
      margem_liquida_pct: recLiquida > 0 ? Number((lucroLiquido / recLiquida * 100).toFixed(2)) : 0,
      lucro_liquido: lucroLiquido,
      faturamento_acumulado: recLiquida,
      total_ativo: bp.total_ativo,
      total_passivo_pl: bp.total_passivo_pl,
      balanceado: bp.balanceado
    };
  }
};

// server/services/ofxParserService.ts
var OFXParserService = class {
  static parseOFX(content) {
    const clean = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const trnBlocks = clean.match(/<STMTTRN>[\s\S]*?(?=(?:<STMTTRN>|<\/BANKTRANLIST>|$))/gi) || [];
    const transacoes = [];
    for (const block of trnBlocks) {
      const trntype = block.match(/<TRNTYPE>([^<\n\r]+)/i)?.[1]?.trim();
      const dtposted = block.match(/<DTPOSTED>([^<\n\r]+)/i)?.[1]?.trim();
      const trnamt = block.match(/<TRNAMT>([^<\n\r]+)/i)?.[1]?.trim();
      const fitid = block.match(/<FITID>([^<\n\r]+)/i)?.[1]?.trim();
      const memo = block.match(/<MEMO>([^<\n\r]+)/i)?.[1]?.trim();
      if (dtposted && trnamt && fitid) {
        const rawDate = dtposted.slice(0, 8);
        const y = rawDate.slice(0, 4);
        const m = rawDate.slice(4, 6);
        const d = rawDate.slice(6, 8);
        const formattedDate = `${y}-${m}-${d}`;
        const val = parseFloat(trnamt.replace(",", "."));
        transacoes.push({
          fitid,
          tipo: trntype?.toUpperCase() || (val > 0 ? "CREDIT" : "DEBIT"),
          data: formattedDate,
          valor: Math.abs(val),
          sinal: val >= 0 ? 1 : -1,
          memo: memo || "Transa\xE7\xE3o Banc\xE1ria"
        });
      }
    }
    return transacoes;
  }
  static importarEProcessar(empresaId, contaBancariaId, content) {
    const parsed = this.parseOFX(content);
    const regras = db.regrasConciliacao.filter((r) => r.empresa_id === empresaId && r.ativa);
    let importadas = 0;
    let duplicadas = 0;
    let autoConciliadas = 0;
    let nextTrnId = (Math.max(0, ...db.transacoesOFX.map((t) => t.id)) || 0) + 1;
    for (const item of parsed) {
      const existe = db.transacoesOFX.find((t) => t.empresa_id === empresaId && t.fitid === item.fitid);
      if (existe) {
        duplicadas++;
        continue;
      }
      const trn = {
        id: nextTrnId++,
        empresa_id: empresaId,
        conta_bancaria_id: contaBancariaId,
        fitid: item.fitid,
        data: item.data,
        tipo: item.sinal > 0 ? "CREDIT" : "DEBIT",
        valor: item.valor,
        memo: item.memo,
        status: "PENDENTE",
        lancamento_id: null
      };
      db.transacoesOFX.push(trn);
      importadas++;
      const memoUpper = item.memo.toUpperCase();
      for (const regra of regras) {
        if (memoUpper.includes(regra.padrao_texto.toUpperCase())) {
          const partidas = item.sinal > 0 ? [
            { conta_id: contaBancariaId, tipo: "DEBITO", valor: item.valor },
            { conta_id: regra.conta_contrapartida_id, tipo: "CREDITO", valor: item.valor, centro_custo_id: regra.centro_custo_id }
          ] : [
            { conta_id: regra.conta_contrapartida_id, tipo: "DEBITO", valor: item.valor, centro_custo_id: regra.centro_custo_id },
            { conta_id: contaBancariaId, tipo: "CREDITO", valor: item.valor }
          ];
          const lanc = ContabilidadeService.criarLancamento(empresaId, {
            data: item.data,
            tipo: "ORDINARIO",
            historico: `${regra.historico_padrao} - Ref: ${item.memo}`,
            documento: `OFX-${item.fitid.slice(0, 15)}`,
            partidas
          });
          trn.status = "CONCILIADO";
          trn.lancamento_id = lanc.id;
          autoConciliadas++;
          break;
        }
      }
    }
    return {
      total_encontradas: parsed.length,
      importadas,
      duplicadas,
      auto_conciliadas: autoConciliadas
    };
  }
};

// server/services/spedEcdService.ts
var SpedEcdService = class {
  static gerarArquivoSped(empresaId, ano) {
    const empresa = db.empresas.find((e) => e.id === empresaId);
    if (!empresa) throw new Error("Empresa n\xE3o encontrada.");
    const dataIni = `${ano}0101`;
    const dataFim = `${ano}1231`;
    const linhas = [];
    const contagem = {};
    const addReg = (reg, ...campos) => {
      const l = `|${reg}|` + campos.join("|") + "|";
      linhas.push(l);
      contagem[reg] = (contagem[reg] || 0) + 1;
    };
    const cnpjLimpo = empresa.cnpj.replace(/\D/g, "");
    addReg("0000", "LECD", dataIni, dataFim, empresa.razao_social, cnpjLimpo, empresa.uf, empresa.inscricao_estadual || "", "3550308", empresa.inscricao_municipal || "", "0", "0", "0", "", "", "N", "1", "0", "");
    addReg("0001", "0");
    addReg("0007", "00", "");
    const b0Count = Object.keys(contagem).filter((k) => k.startsWith("0")).reduce((acc, k) => acc + contagem[k], 0) + 1;
    linhas.push(`|0990|${b0Count}|`);
    contagem["0990"] = 1;
    addReg("I001", "0");
    addReg("I010", "G", "9.00");
    addReg("I030", "TERMO DE ABERTURA", "1", "LIVRO DIARIO GERAL", empresa.razao_social, cnpjLimpo, "JUCESP", "123456789", "01012026", empresa.cidade, "01012026");
    const contas = db.contas.filter((c) => c.empresa_id === empresaId && c.ativa).sort((a, b) => a.codigo.localeCompare(b.codigo, void 0, { numeric: true }));
    for (const c of contas) {
      const indCta = c.tipo === "SINTETICA" ? "S" : "A";
      const nat = { ATIVO: "01", PASSIVO: "02", PATRIMONIO_LIQUIDO: "03", RECEITAS: "04", DESPESAS: "04", CUSTOS: "04" }[c.grupo] || "09";
      const superior = c.codigo.includes(".") ? c.codigo.slice(0, c.codigo.lastIndexOf(".")) : "";
      addReg("I050", dataIni, nat, indCta, c.nivel, c.codigo, superior, c.descricao);
      if (c.codigo_referencial_rfb && c.tipo === "ANALITICA") {
        addReg("I051", "10", c.codigo_referencial_rfb);
      }
    }
    const lancamentos = db.lancamentos.filter((l) => l.empresa_id === empresaId && l.data.startsWith(String(ano)));
    for (const l of lancamentos) {
      const pL = db.partidas.filter((p) => p.lancamento_id === l.id);
      const total = pL.filter((p) => p.tipo === "DEBITO").reduce((a, b) => a + b.valor, 0);
      const dtSped = l.data.replace(/-/g, "").replace(/(\d{4})(\d{2})(\d{2})/, "$3$2$1");
      addReg("I200", String(l.numero), dtSped, total.toFixed(2).replace(".", ","), "N");
      for (const p of pL) {
        const c = contas.find((cta) => cta.id === p.conta_id);
        const tp = p.tipo === "DEBITO" ? "D" : "C";
        addReg("I250", c?.codigo || "", "", p.valor.toFixed(2).replace(".", ","), tp, "", "", l.historico + (p.complemento ? ` - ${p.complemento}` : ""), "");
      }
    }
    const bICount = Object.keys(contagem).filter((k) => k.startsWith("I")).reduce((acc, k) => acc + contagem[k], 0) + 1;
    linhas.push(`|I990|${bICount}|`);
    contagem["I990"] = 1;
    addReg("J001", "0");
    addReg("J005", dataIni, dataFim, "1", "BALAN\xC7O PATRIMONIAL E DRE");
    const bp = RelatoriosService.gerarBalancoPatrimonial(empresaId, `${ano}-12-31`);
    for (const l of bp.ativo) {
      addReg("J100", l.codigo, l.nivel, l.descricao, Math.abs(l.valor).toFixed(2).replace(".", ","), "D");
    }
    for (const l of bp.passivo_pl) {
      addReg("J100", l.codigo, l.nivel, l.descricao, Math.abs(l.valor).toFixed(2).replace(".", ","), "C");
    }
    const dre = RelatoriosService.gerarDRE(empresaId, `${ano}-01-01`, `${ano}-12-31`);
    for (const l of dre.linhas) {
      addReg("J150", l.codigo, l.nivel, l.descricao, Math.abs(l.valor).toFixed(2).replace(".", ","), l.valor < 0 ? "D" : "C");
    }
    addReg("J900", "TERMO DE ENCERRAMENTO", "1", "LIVRO DIARIO GERAL", empresa.razao_social, cnpjLimpo, "JUCESP", "123456789", "01012026", dataFim, dataFim);
    addReg("J930", "THOR CONTADOR AUDITOR", "00000000000", "CONTADOR", "900", "CRC-SP 123456/O", "contador@opencontabil.org", "11999998888", "SP", "");
    const bJCount = Object.keys(contagem).filter((k) => k.startsWith("J")).reduce((acc, k) => acc + contagem[k], 0) + 1;
    linhas.push(`|J990|${bJCount}|`);
    contagem["J990"] = 1;
    addReg("9001", "0");
    contagem["9900"] = Object.keys(contagem).length + 3;
    for (const [k, v] of Object.entries(contagem).sort()) {
      linhas.push(`|9900|${k}|${v}|`);
    }
    linhas.push(`|9900|9900|${Object.keys(contagem).length + 3}|`);
    linhas.push(`|9900|9990|1|`);
    linhas.push(`|9900|9999|1|`);
    linhas.push(`|9990|${Object.keys(contagem).length + 5}|`);
    linhas.push(`|9999|${linhas.length + 1}|`);
    return linhas.join("\r\n");
  }
  static validarConsistencia(empresaId, ano) {
    const erros = [];
    const avisos = [];
    const contas = db.contas.filter((c) => c.empresa_id === empresaId && c.tipo === "ANALITICA" && c.ativa);
    for (const c of contas) {
      if (!c.codigo_referencial_rfb) {
        avisos.push(`Conta anal\xEDtica ${c.codigo} (${c.descricao}) n\xE3o possui mapeamento no Plano Referencial da RFB.`);
      }
    }
    const bp = RelatoriosService.gerarBalancoPatrimonial(empresaId, `${ano}-12-31`);
    if (!bp.balanceado) {
      erros.push(`Balan\xE7o Patrimonial n\xE3o fecha: Ativo Total (R$ ${bp.total_ativo.toFixed(2)}) != Passivo+PL (R$ ${bp.total_passivo_pl.toFixed(2)})`);
    }
    return {
      aprovado_para_transmissao: erros.length === 0,
      total_erros: erros.length,
      total_avisos: avisos.length,
      erros,
      avisos
    };
  }
};

// server/services/reformaTributariaService.ts
var ReformaTributariaService = class {
  static simular(dados) {
    const faturamento = dados.faturamento_mensal;
    const compras = dados.compras_insumos_mensal;
    const folha = dados.folha_salarios_mensal;
    const regime = dados.regime_atual;
    let impostoAtual = 0;
    let detalheAtual = {};
    if (regime === "SIMPLES") {
      impostoAtual = faturamento * 0.115;
      detalheAtual = {
        regime: "Simples Nacional",
        aliquota_efetiva: "11.50%",
        total_mensal: Number(impostoAtual.toFixed(2))
      };
    } else if (regime === "LUCRO_PRESUMIDO") {
      const pis = faturamento * 65e-4;
      const cofins = faturamento * 0.03;
      const iss = faturamento * 0.04;
      const irpjCsll = faturamento * 0.048;
      impostoAtual = pis + cofins + iss + irpjCsll;
      detalheAtual = {
        regime: "Lucro Presumido",
        pis: Number(pis.toFixed(2)),
        cofins: Number(cofins.toFixed(2)),
        iss: Number(iss.toFixed(2)),
        irpj_csll: Number(irpjCsll.toFixed(2)),
        total_mensal: Number(impostoAtual.toFixed(2))
      };
    } else {
      const pisDeb = faturamento * 0.0165;
      const cofinsDeb = faturamento * 0.076;
      const pisCred = compras * 0.0165;
      const cofinsCred = compras * 0.076;
      const pisCofinsLiq = Math.max(0, pisDeb - pisCred + (cofinsDeb - cofinsCred));
      const iss = faturamento * 0.04;
      const irpjCsll = Math.max(0, (faturamento - compras - folha) * 0.34);
      impostoAtual = pisCofinsLiq + iss + irpjCsll;
      detalheAtual = {
        regime: "Lucro Real",
        total_mensal: Number(impostoAtual.toFixed(2))
      };
    }
    const aliqCbs = dados.aliquota_cbs / 100;
    const aliqIbs = dados.aliquota_ibs / 100;
    const aliqIs = (dados.aliquota_is || 0) / 100;
    const cbsDeb = faturamento * aliqCbs;
    const ibsDeb = faturamento * aliqIbs;
    const isDeb = faturamento * aliqIs;
    const cbsCred = compras * aliqCbs;
    const ibsCred = compras * aliqIbs;
    const cbsLiq = Math.max(0, cbsDeb - cbsCred);
    const ibsLiq = Math.max(0, ibsDeb - ibsCred);
    const irpjCsllReforma = regime !== "LUCRO_REAL" ? faturamento * 0.048 : Math.max(0, (faturamento - compras - folha) * 0.34);
    const totalNovo = cbsLiq + ibsLiq + isDeb + irpjCsllReforma;
    const detalheNovo = {
      cbs_debito: Number(cbsDeb.toFixed(2)),
      cbs_credito_insumos: Number(cbsCred.toFixed(2)),
      cbs_liquido: Number(cbsLiq.toFixed(2)),
      ibs_debito: Number(ibsDeb.toFixed(2)),
      ibs_credito_insumos: Number(ibsCred.toFixed(2)),
      ibs_liquido: Number(ibsLiq.toFixed(2)),
      imposto_seletivo: Number(isDeb.toFixed(2)),
      irpj_csll_mantido: Number(irpjCsllReforma.toFixed(2)),
      total_mensal: Number(totalNovo.toFixed(2))
    };
    const difMensal = totalNovo - impostoAtual;
    const varPct = impostoAtual > 0 ? Number((difMensal / impostoAtual * 100).toFixed(2)) : 0;
    const credTotal = cbsCred + ibsCred;
    const diagnostico = difMensal > 0 ? `A empresa ter\xE1 um acr\xE9scimo estimado de R$ ${difMensal.toFixed(2)}/m\xEAs (+${varPct}%). A recupera\xE7\xE3o de cr\xE9ditos gera R$ ${credTotal.toFixed(2)}/m\xEAs.` : `A empresa ter\xE1 uma redu\xE7\xE3o estimada de R$ ${Math.abs(difMensal).toFixed(2)}/m\xEAs (${varPct}%). A n\xE3o-cumulatividade plena sobre insumos proporciona R$ ${credTotal.toFixed(2)}/m\xEAs de cr\xE9ditos.`;
    return {
      tributacao_atual: detalheAtual,
      tributacao_nova_reforma: detalheNovo,
      diferenca_mensal: Number(difMensal.toFixed(2)),
      diferenca_anual: Number((difMensal * 12).toFixed(2)),
      variacao_percentual: varPct,
      credito_cbs_ibs_mensal: Number(credTotal.toFixed(2)),
      diagnostico
    };
  }
};

// server/app.ts
var app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const forwarded = req.headers["x-forwarded-uri"] || req.headers["x-matched-path"];
  if (forwarded && (forwarded.includes("/v1") || forwarded.includes("/empresas"))) {
    req.url = forwarded;
  }
  if (req.url.startsWith("/api/index")) {
    req.url = req.url.replace(/^\/api\/index(\.ts|\.js)?/, "/api");
  }
  next();
});
var healthHandler = (_req, res) => {
  res.json({ status: "ok", app: "Azienda Cont\xE1bil (Fullstack TypeScript)", version: "1.0.0" });
};
app.get("/health", healthHandler);
app.get("/api/health", healthHandler);
var apiRouter = express.Router();
apiRouter.get("/health", healthHandler);
apiRouter.get(["/empresas", "/empresas/"], (_req, res) => {
  res.json(db.empresas);
});
apiRouter.get("/empresas/:id", (req, res) => {
  const emp = db.empresas.find((e) => e.id === Number(req.params.id));
  if (!emp) return res.status(404).json({ detail: "Empresa n\xE3o encontrada" });
  res.json(emp);
});
apiRouter.post(["/empresas", "/empresas/"], (req, res) => {
  const { cnpj, razao_social, nome_fantasia, regime_tributario, cidade, uf } = req.body;
  if (db.empresas.some((e) => e.cnpj === cnpj)) {
    return res.status(400).json({ detail: "CNPJ j\xE1 cadastrado." });
  }
  const newId = (Math.max(0, ...db.empresas.map((e) => e.id)) || 0) + 1;
  const novaEmpresa = {
    id: newId,
    cnpj,
    razao_social,
    nome_fantasia,
    regime_tributario: regime_tributario || "SIMPLES",
    cidade: cidade || "S\xE3o Paulo",
    uf: uf || "SP",
    ano_exercicio: 2026,
    data_bloqueio: null,
    criado_em: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.empresas.push(novaEmpresa);
  let nextCtaId = (Math.max(0, ...db.contas.map((c) => c.id)) || 0) + 1;
  for (const [cod, codRed, desc, tipo, nat, grupo, nivel, refRfb] of PLANO_CONTAS_PADRAO) {
    db.contas.push({
      id: nextCtaId++,
      empresa_id: novaEmpresa.id,
      codigo: cod,
      codigo_reduzido: codRed,
      descricao: desc,
      tipo,
      natureza: nat,
      grupo,
      nivel,
      codigo_referencial_rfb: refRfb,
      ativa: true
    });
  }
  res.status(201).json(novaEmpresa);
});
apiRouter.get(["/plano-contas/:empresaId", "/plano-contas/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const tipo = req.query.tipo;
  let contas = db.contas.filter((c) => c.empresa_id === empresaId && c.ativa);
  if (tipo) {
    contas = contas.filter((c) => c.tipo === tipo);
  }
  contas.sort((a, b) => a.codigo.localeCompare(b.codigo, void 0, { numeric: true }));
  res.json(contas);
});
apiRouter.post(["/plano-contas/:empresaId", "/plano-contas/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const nextId = (Math.max(0, ...db.contas.map((c) => c.id)) || 0) + 1;
  const novaConta = { id: nextId, empresa_id: empresaId, ...req.body };
  db.contas.push(novaConta);
  res.status(201).json(novaConta);
});
apiRouter.get(["/centros-custo/:empresaId", "/centros-custo/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const ccs = db.centrosCusto.filter((cc) => cc.empresa_id === empresaId && cc.ativo);
  res.json(ccs);
});
apiRouter.get(["/lancamentos/:empresaId", "/lancamentos/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const dataInicio = req.query.data_inicio;
  const dataFim = req.query.data_fim;
  let lancs = db.lancamentos.filter((l) => l.empresa_id === empresaId);
  if (dataInicio) lancs = lancs.filter((l) => l.data >= dataInicio);
  if (dataFim) lancs = lancs.filter((l) => l.data <= dataFim);
  lancs.sort((a, b) => b.data.localeCompare(a.data) || b.numero - a.numero);
  const resList = lancs.map((l) => {
    const partidas = db.partidas.filter((p) => p.lancamento_id === l.id).map((p) => {
      const c = db.contas.find((cta) => cta.id === p.conta_id);
      return {
        ...p,
        conta_codigo: c?.codigo,
        conta_descricao: c?.descricao
      };
    });
    return { ...l, partidas };
  });
  res.json(resList);
});
apiRouter.post(["/lancamentos/:empresaId", "/lancamentos/:empresaId/"], (req, res) => {
  try {
    const empresaId = Number(req.params.empresaId);
    const lanc = ContabilidadeService.criarLancamento(empresaId, req.body);
    const partidas = db.partidas.filter((p) => p.lancamento_id === lanc.id).map((p) => {
      const c = db.contas.find((cta) => cta.id === p.conta_id);
      return { ...p, conta_codigo: c?.codigo, conta_descricao: c?.descricao };
    });
    res.status(201).json({ ...lanc, partidas });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});
apiRouter.delete("/lancamentos/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = db.lancamentos.findIndex((l) => l.id === id);
  if (idx === -1) return res.status(404).json({ detail: "Lan\xE7amento n\xE3o encontrado." });
  db.lancamentos.splice(idx, 1);
  db.partidas = db.partidas.filter((p) => p.lancamento_id !== id);
  res.json({ status: "sucesso", mensagem: "Lan\xE7amento exclu\xEDdo com sucesso." });
});
apiRouter.get(["/relatorios/balancete/:empresaId", "/relatorios/balancete/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const dataIni = req.query.data_inicio || "2026-01-01";
  const dataFim = req.query.data_fim || "2026-12-31";
  res.json(RelatoriosService.gerarBalancete(empresaId, dataIni, dataFim));
});
apiRouter.get(["/relatorios/balanco-patrimonial/:empresaId", "/relatorios/balanco-patrimonial/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const dataPosicao = req.query.data_posicao || "2026-12-31";
  res.json(RelatoriosService.gerarBalancoPatrimonial(empresaId, dataPosicao));
});
apiRouter.get(["/relatorios/dre/:empresaId", "/relatorios/dre/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const dataIni = req.query.data_inicio || "2026-01-01";
  const dataFim = req.query.data_fim || "2026-12-31";
  res.json(RelatoriosService.gerarDRE(empresaId, dataIni, dataFim));
});
apiRouter.get(["/relatorios/livro-diario/:empresaId", "/relatorios/livro-diario/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const emp = db.empresas.find((e) => e.id === empresaId);
  const dataIni = req.query.data_inicio || "2026-01-01";
  const dataFim = req.query.data_fim || "2026-12-31";
  const lancs = db.lancamentos.filter((l) => l.empresa_id === empresaId && l.data >= dataIni && l.data <= dataFim).sort((a, b) => a.data.localeCompare(b.data) || a.numero - b.numero);
  let totalMovimento = 0;
  const items = lancs.map((l) => {
    const pL = db.partidas.filter((p) => p.lancamento_id === l.id);
    const debTotal = pL.filter((p) => p.tipo === "DEBITO").reduce((a, b) => a + b.valor, 0);
    totalMovimento += debTotal;
    const partidasItens = pL.map((p) => {
      const c = db.contas.find((cta) => cta.id === p.conta_id);
      return {
        conta_codigo: c?.codigo,
        conta_descricao: c?.descricao,
        tipo: p.tipo,
        valor: p.valor,
        complemento: p.complemento
      };
    });
    return {
      numero: l.numero,
      data: l.data,
      historico: l.historico,
      documento: l.documento,
      partidas: partidasItens
    };
  });
  res.json({
    empresa: emp?.razao_social,
    cnpj: emp?.cnpj,
    periodo: `${dataIni} a ${dataFim}`,
    total_movimento: Number(totalMovimento.toFixed(2)),
    lancamentos: items
  });
});
apiRouter.get(["/relatorios/livro-razao/:empresaId", "/relatorios/livro-razao/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const contaId = req.query.conta_id ? Number(req.query.conta_id) : void 0;
  const dataIni = req.query.data_inicio || "2026-01-01";
  const dataFim = req.query.data_fim || "2026-12-31";
  let contas = db.contas.filter((c) => c.empresa_id === empresaId && c.tipo === "ANALITICA");
  if (contaId) contas = contas.filter((c) => c.id === contaId);
  const resultado = contas.map((c) => {
    const partidasAnt = db.partidas.filter((p) => {
      if (p.conta_id !== c.id) return false;
      const l = db.lancamentos.find((lanc) => lanc.id === p.lancamento_id);
      return l && l.empresa_id === empresaId && l.data < dataIni;
    });
    const debAnt = partidasAnt.filter((p) => p.tipo === "DEBITO").reduce((a, b) => a + b.valor, 0);
    const credAnt = partidasAnt.filter((p) => p.tipo === "CREDITO").reduce((a, b) => a + b.valor, 0);
    let saldoAcum = c.natureza === "DEVEDORA" ? debAnt - credAnt : credAnt - debAnt;
    const saldoInicial = saldoAcum;
    const partidasPer = db.partidas.filter((p) => {
      if (p.conta_id !== c.id) return false;
      const l = db.lancamentos.find((lanc) => lanc.id === p.lancamento_id);
      return l && l.empresa_id === empresaId && l.data >= dataIni && l.data <= dataFim;
    });
    const movimentos = partidasPer.map((p) => {
      const l = db.lancamentos.find((lanc) => lanc.id === p.lancamento_id);
      if (c.natureza === "DEVEDORA") {
        saldoAcum += p.tipo === "DEBITO" ? p.valor : -p.valor;
      } else {
        saldoAcum += p.tipo === "CREDITO" ? p.valor : -p.valor;
      }
      return {
        data: l?.data,
        lancamento_numero: l?.numero,
        historico: l?.historico,
        documento: l?.documento,
        tipo: p.tipo,
        valor: p.valor,
        saldo_resultante: Number(saldoAcum.toFixed(2))
      };
    });
    return {
      conta_id: c.id,
      codigo: c.codigo,
      descricao: c.descricao,
      natureza: c.natureza,
      saldo_anterior: Number(saldoInicial.toFixed(2)),
      saldo_final: Number(saldoAcum.toFixed(2)),
      movimentos
    };
  });
  res.json(resultado);
});
apiRouter.get(["/conciliacao/transacoes/:empresaId", "/conciliacao/transacoes/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const trns = db.transacoesOFX.filter((t) => t.empresa_id === empresaId);
  res.json(trns);
});
apiRouter.post(["/conciliacao/importar-ofx-texto/:empresaId", "/conciliacao/importar-ofx-texto/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const { conta_bancaria_id, conteudo_ofx } = req.body;
  const result = OFXParserService.importarEProcessar(empresaId, conta_bancaria_id, conteudo_ofx);
  res.json(result);
});
apiRouter.post(["/conciliacao/conciliar/:transacaoId", "/conciliacao/conciliar/:transacaoId/"], (req, res) => {
  const id = Number(req.params.transacaoId);
  const trn = db.transacoesOFX.find((t) => t.id === id);
  if (!trn) return res.status(404).json({ detail: "Transa\xE7\xE3o n\xE3o encontrada" });
  const { conta_contrapartida_id, historico, centro_custo_id } = req.body;
  const partidas = trn.tipo === "CREDIT" ? [
    { conta_id: trn.conta_bancaria_id, tipo: "DEBITO", valor: trn.valor },
    { conta_id: conta_contrapartida_id, tipo: "CREDITO", valor: trn.valor, centro_custo_id }
  ] : [
    { conta_id: conta_contrapartida_id, tipo: "DEBITO", valor: trn.valor, centro_custo_id },
    { conta_id: trn.conta_bancaria_id, tipo: "CREDITO", valor: trn.valor }
  ];
  const lanc = ContabilidadeService.criarLancamento(trn.empresa_id, {
    data: trn.data,
    tipo: "ORDINARIO",
    historico: `${historico} - Extrato OFX: ${trn.memo}`,
    documento: `OFX-${trn.fitid.slice(0, 15)}`,
    partidas
  });
  trn.status = "CONCILIADO";
  trn.lancamento_id = lanc.id;
  res.json({ status: "sucesso", lancamento_id: lanc.id, numero: lanc.numero });
});
apiRouter.get(["/fiscal-sped/exportar-ecd/:empresaId", "/fiscal-sped/exportar-ecd/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const ano = req.query.ano ? Number(req.query.ano) : 2026;
  const txt = SpedEcdService.gerarArquivoSped(empresaId, ano);
  res.setHeader("Content-Type", "text/plain; charset=iso-8859-1");
  res.setHeader("Content-Disposition", `attachment; filename=SPED_ECD_${empresaId}_${ano}.txt`);
  res.send(txt);
});
apiRouter.get(["/fiscal-sped/validar-ecd/:empresaId", "/fiscal-sped/validar-ecd/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const ano = req.query.ano ? Number(req.query.ano) : 2026;
  res.json(SpedEcdService.validarConsistencia(empresaId, ano));
});
apiRouter.post(["/fiscal-sped/simular-reforma", "/fiscal-sped/simular-reforma/"], (req, res) => {
  res.json(ReformaTributariaService.simular(req.body));
});
apiRouter.get(["/dashboard/:empresaId", "/dashboard/:empresaId/"], (req, res) => {
  const empresaId = Number(req.params.empresaId);
  const emp = db.empresas.find((e) => e.id === empresaId);
  if (!emp) return res.status(404).json({ detail: "Empresa n\xE3o encontrada" });
  const hoje = "2026-12-31";
  const ind = RelatoriosService.gerarIndicadores(empresaId, hoje);
  const totalLanc = db.lancamentos.filter((l) => l.empresa_id === empresaId).length;
  const ofxPend = db.transacoesOFX.filter((t) => t.empresa_id === empresaId && t.status === "PENDENTE").length;
  const ultimos = db.lancamentos.filter((l) => l.empresa_id === empresaId).sort((a, b) => b.data.localeCompare(a.data) || b.numero - a.numero).slice(0, 5).map((l) => {
    const pL = db.partidas.filter((p) => p.lancamento_id === l.id);
    const val = pL.filter((p) => p.tipo === "DEBITO").reduce((a, b) => a + b.valor, 0);
    return {
      id: l.id,
      numero: l.numero,
      data: l.data,
      historico: l.historico,
      valor: val,
      tipo: l.tipo
    };
  });
  const evolucao = [
    { mes: "Jan/26", receitas: ind.faturamento_acumulado, despesas: ind.faturamento_acumulado - ind.lucro_liquido, lucro: ind.lucro_liquido },
    { mes: "Fev/26", receitas: ind.faturamento_acumulado * 0.9, despesas: (ind.faturamento_acumulado - ind.lucro_liquido) * 0.95, lucro: ind.lucro_liquido * 0.85 },
    { mes: "Mar/26", receitas: ind.faturamento_acumulado * 1.1, despesas: (ind.faturamento_acumulado - ind.lucro_liquido) * 0.98, lucro: ind.lucro_liquido * 1.25 }
  ];
  res.json({
    empresa: {
      id: emp.id,
      razao_social: emp.razao_social,
      cnpj: emp.cnpj,
      regime_tributario: emp.regime_tributario,
      ano_exercicio: emp.ano_exercicio
    },
    resumo: {
      total_empresas: db.empresas.length,
      total_lancamentos: totalLanc,
      ofx_pendentes: ofxPend,
      faturamento_acumulado: ind.faturamento_acumulado,
      lucro_liquido: ind.lucro_liquido,
      total_ativo: ind.total_ativo,
      total_passivo_pl: ind.total_passivo_pl,
      balanceado: ind.balanceado
    },
    indicadores: {
      liquidez_corrente: ind.liquidez_corrente,
      liquidez_seca: ind.liquidez_seca,
      endividamento_geral_pct: ind.endividamento_geral_pct,
      margem_liquida_pct: ind.margem_liquida_pct
    },
    evolucao_mensal: evolucao,
    ultimos_lancamentos: ultimos
  });
});
app.use("/api/v1", apiRouter);
app.use("/v1", apiRouter);
app.use("/api", apiRouter);
app.use("/", apiRouter);
var app_default = app;
export {
  apiRouter,
  app,
  app_default as default
};
