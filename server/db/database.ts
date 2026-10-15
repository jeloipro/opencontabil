import {
  EmpresaModel,
  ContaModel,
  CentroCustoModel,
  LancamentoModel,
  PartidaModel,
  TransacaoOFXModel,
  RegraConciliacaoModel,
  PLANO_CONTAS_PADRAO,
} from "../services/seedData";

class DataStore {
  empresas: EmpresaModel[] = [];
  contas: ContaModel[] = [];
  centrosCusto: CentroCustoModel[] = [];
  lancamentos: LancamentoModel[] = [];
  partidas: PartidaModel[] = [];
  transacoesOFX: TransacaoOFXModel[] = [];
  regrasConciliacao: RegraConciliacaoModel[] = [];

  private initialized = false;

  constructor() {
    this.init();
  }

  init() {
    if (this.initialized) return;

    // 1. Empresa Modelo
    const emp: EmpresaModel = {
      id: 1,
      cnpj: "12.345.678/0001-90",
      razao_social: "PHOENIX CONSULTORIA & SERVIÇOS CONTÁBEIS LTDA",
      nome_fantasia: "Phoenix Soluções Contábeis",
      inscricao_estadual: "111.222.333.444",
      inscricao_municipal: "555.666-7",
      regime_tributario: "SIMPLES",
      cnae: "6920-6/01",
      cidade: "São Paulo",
      uf: "SP",
      ano_exercicio: 2026,
      data_bloqueio: null,
      criado_em: new Date().toISOString(),
    };
    this.empresas.push(emp);

    // 2. Centros de Custo
    this.centrosCusto.push(
      { id: 1, empresa_id: 1, codigo: "01", nome: "Administrativo / Diretoria", ativo: true },
      { id: 2, empresa_id: 1, codigo: "02", nome: "Operações Contábeis & Fiscais", ativo: true },
      { id: 3, empresa_id: 1, codigo: "03", nome: "Comercial & Marketing", ativo: true }
    );

    // 3. Plano de Contas
    let contaIdCounter = 1;
    const contasMap: Record<number, number> = {};

    for (const [cod, codRed, desc, tipo, nat, grupo, nivel, refRfb] of PLANO_CONTAS_PADRAO) {
      const conta: ContaModel = {
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
        ativa: true,
      };
      this.contas.push(conta);
      contasMap[codRed] = conta.id;
    }

    // 4. Regras de Conciliação
    this.regrasConciliacao.push(
      {
        id: 1,
        empresa_id: 1,
        padrao_texto: "TARIFA",
        conta_contrapartida_id: contasMap[340],
        centro_custo_id: 1,
        historico_padrao: "Despesa com tarifa bancária s/ extrato",
        ativa: true,
      },
      {
        id: 2,
        empresa_id: 1,
        padrao_texto: "RENDIMENTO",
        conta_contrapartida_id: contasMap[430],
        centro_custo_id: 1,
        historico_padrao: "Receita de rendimento de aplicação financeira",
        ativa: true,
      }
    );

    // 5. Lançamentos Iniciais
    let pId = 1;

    // L1: Capital Social
    this.lancamentos.push({
      id: 1,
      empresa_id: 1,
      numero: 1,
      data: "2026-01-05",
      tipo: "ABERTURA",
      historico: "Integralização de Capital Social conforme Contrato Social registrado",
      documento: "CONTRATO-01",
      conciliado: true,
      criado_em: "2026-01-05T10:00:00Z",
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 1, conta_id: contasMap[20], tipo: "DEBITO", valor: 50000.0, complemento: "Entrada em conta Banco Itaú" },
      { id: pId++, lancamento_id: 1, conta_id: contasMap[210], tipo: "CREDITO", valor: 50000.0, complemento: "Capital subscrito e integralizado pelos sócios" }
    );

    // L2: Computadores e Móveis
    this.lancamentos.push({
      id: 2,
      empresa_id: 1,
      numero: 2,
      data: "2026-01-10",
      tipo: "ORDINARIO",
      historico: "Aquisição de equipamentos de TI e mobiliário para escritório s/ NF 4589",
      documento: "NF-4589",
      conciliado: true,
      criado_em: "2026-01-10T14:30:00Z",
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 2, conta_id: contasMap[80], tipo: "DEBITO", valor: 8000.0, centro_custo_id: 2 },
      { id: pId++, lancamento_id: 2, conta_id: contasMap[81], tipo: "DEBITO", valor: 4000.0, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 2, conta_id: contasMap[20], tipo: "CREDITO", valor: 12000.0 }
    );

    // L3: Prestação de Serviços
    this.lancamentos.push({
      id: 3,
      empresa_id: 1,
      numero: 3,
      data: "2026-01-20",
      tipo: "ORDINARIO",
      historico: "Faturamento de serviços contábeis e consultoria tributária do mês s/ NFS-e 101",
      documento: "NFSE-101",
      conciliado: false,
      criado_em: "2026-01-20T16:00:00Z",
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 3, conta_id: contasMap[40], tipo: "DEBITO", valor: 35000.0, complemento: "Clientes a Receber" },
      { id: pId++, lancamento_id: 3, conta_id: contasMap[410], tipo: "CREDITO", valor: 35000.0, centro_custo_id: 2 }
    );

    // L4: Recebimento clientes
    this.lancamentos.push({
      id: 4,
      empresa_id: 1,
      numero: 4,
      data: "2026-01-25",
      tipo: "ORDINARIO",
      historico: "Recebimento de honorários contábeis de clientes via PIX no Banco Itaú",
      documento: "PIX-REC-01",
      conciliado: true,
      criado_em: "2026-01-25T11:00:00Z",
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 4, conta_id: contasMap[20], tipo: "DEBITO", valor: 25000.0 },
      { id: pId++, lancamento_id: 4, conta_id: contasMap[40], tipo: "CREDITO", valor: 25000.0 }
    );

    // L5: Folha de Pagamento
    this.lancamentos.push({
      id: 5,
      empresa_id: 1,
      numero: 5,
      data: "2026-01-31",
      tipo: "ORDINARIO",
      historico: "Apropriação da folha de pagamento do mês de janeiro/2026",
      documento: "FOLHA-01/2026",
      conciliado: false,
      criado_em: "2026-01-31T17:00:00Z",
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 5, conta_id: contasMap[330], tipo: "DEBITO", valor: 12000.0, centro_custo_id: 2 },
      { id: pId++, lancamento_id: 5, conta_id: contasMap[331], tipo: "DEBITO", valor: 3000.0, centro_custo_id: 2 },
      { id: pId++, lancamento_id: 5, conta_id: contasMap[110], tipo: "CREDITO", valor: 12000.0 },
      { id: pId++, lancamento_id: 5, conta_id: contasMap[111], tipo: "CREDITO", valor: 3000.0 }
    );

    // L6: Aluguel e Internet
    this.lancamentos.push({
      id: 6,
      empresa_id: 1,
      numero: 6,
      data: "2026-01-31",
      tipo: "ORDINARIO",
      historico: "Pagamento de despesas operacionais - aluguel e internet s/ recibos",
      documento: "REC-LOC-01",
      conciliado: true,
      criado_em: "2026-01-31T18:00:00Z",
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 6, conta_id: contasMap[320], tipo: "DEBITO", valor: 2800.0, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 6, conta_id: contasMap[321], tipo: "DEBITO", valor: 700.0, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 6, conta_id: contasMap[20], tipo: "CREDITO", valor: 3500.0 }
    );

    // L7: Simples Nacional
    this.lancamentos.push({
      id: 7,
      empresa_id: 1,
      numero: 7,
      data: "2026-01-31",
      tipo: "ORDINARIO",
      historico: "Provisão para tributos do Simples Nacional competência 01/2026",
      documento: "DAS-01/2026",
      conciliado: false,
      criado_em: "2026-01-31T18:30:00Z",
    });
    this.partidas.push(
      { id: pId++, lancamento_id: 7, conta_id: contasMap[350], tipo: "DEBITO", valor: 2100.0, centro_custo_id: 1 },
      { id: pId++, lancamento_id: 7, conta_id: contasMap[130], tipo: "CREDITO", valor: 2100.0 }
    );

    this.initialized = true;
  }
}

export const db = new DataStore();

