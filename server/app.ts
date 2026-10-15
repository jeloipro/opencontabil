import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./db/database";
import { ContabilidadeService } from "./services/contabilidadeService";
import { RelatoriosService } from "./services/relatoriosService";
import { OFXParserService } from "./services/ofxParserService";
import { SpedEcdService } from "./services/spedEcdService";
import { ReformaTributariaService } from "./services/reformaTributariaService";
import { PLANO_CONTAS_PADRAO } from "./services/seedData";

export const app = express();

app.use(cors());
app.use(express.json());

// Health
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", app: "OpenContabil Phoenix (Fullstack TypeScript)", version: "1.0.0" });
});

// --- Empresas ---
app.get("/api/v1/empresas", (req: Request, res: Response) => {
  res.json(db.empresas);
});

app.get("/api/v1/empresas/:id", (req: Request, res: Response) => {
  const emp = db.empresas.find((e) => e.id === Number(req.params.id));
  if (!emp) return res.status(404).json({ detail: "Empresa não encontrada" });
  res.json(emp);
});

app.post("/api/v1/empresas", (req: Request, res: Response) => {
  const { cnpj, razao_social, nome_fantasia, regime_tributario, cidade, uf } = req.body;
  if (db.empresas.some((e) => e.cnpj === cnpj)) {
    return res.status(400).json({ detail: "CNPJ já cadastrado." });
  }

  const newId = (Math.max(0, ...db.empresas.map((e) => e.id)) || 0) + 1;
  const novaEmpresa = {
    id: newId,
    cnpj,
    razao_social,
    nome_fantasia,
    regime_tributario: regime_tributario || "SIMPLES",
    cidade: cidade || "São Paulo",
    uf: uf || "SP",
    ano_exercicio: 2026,
    data_bloqueio: null,
    criado_em: new Date().toISOString(),
  };
  db.empresas.push(novaEmpresa);

  // Auto clonar plano de contas padrão
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
      ativa: true,
    });
  }

  res.status(201).json(novaEmpresa);
});

// --- Plano de Contas ---
app.get("/api/v1/plano-contas/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const tipo = req.query.tipo as string;
  let contas = db.contas.filter((c) => c.empresa_id === empresaId && c.ativa);
  if (tipo) {
    contas = contas.filter((c) => c.tipo === tipo);
  }
  contas.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));
  res.json(contas);
});

app.post("/api/v1/plano-contas/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const nextId = (Math.max(0, ...db.contas.map((c) => c.id)) || 0) + 1;
  const novaConta = { id: nextId, empresa_id: empresaId, ...req.body };
  db.contas.push(novaConta);
  res.status(201).json(novaConta);
});

// --- Centros de Custo ---
app.get("/api/v1/centros-custo/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const ccs = db.centrosCusto.filter((cc) => cc.empresa_id === empresaId && cc.ativo);
  res.json(ccs);
});

// --- Lançamentos ---
app.get("/api/v1/lancamentos/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const dataInicio = req.query.data_inicio as string;
  const dataFim = req.query.data_fim as string;

  let lancs = db.lancamentos.filter((l) => l.empresa_id === empresaId);
  if (dataInicio) lancs = lancs.filter((l) => l.data >= dataInicio);
  if (dataFim) lancs = lancs.filter((l) => l.data <= dataFim);

  lancs.sort((a, b) => b.data.localeCompare(a.data) || b.numero - a.numero);

  const resList = lancs.map((l) => {
    const partidas = db.partidas
      .filter((p) => p.lancamento_id === l.id)
      .map((p) => {
        const c = db.contas.find((cta) => cta.id === p.conta_id);
        return {
          ...p,
          conta_codigo: c?.codigo,
          conta_descricao: c?.descricao,
        };
      });
    return { ...l, partidas };
  });

  res.json(resList);
});

app.post("/api/v1/lancamentos/:empresaId", (req: Request, res: Response) => {
  try {
    const empresaId = Number(req.params.empresaId);
    const lanc = ContabilidadeService.criarLancamento(empresaId, req.body);
    const partidas = db.partidas
      .filter((p) => p.lancamento_id === lanc.id)
      .map((p) => {
        const c = db.contas.find((cta) => cta.id === p.conta_id);
        return { ...p, conta_codigo: c?.codigo, conta_descricao: c?.descricao };
      });
    res.status(201).json({ ...lanc, partidas });
  } catch (err: any) {
    res.status(400).json({ detail: err.message });
  }
});

app.delete("/api/v1/lancamentos/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = db.lancamentos.findIndex((l) => l.id === id);
  if (idx === -1) return res.status(404).json({ detail: "Lançamento não encontrado." });

  db.lancamentos.splice(idx, 1);
  db.partidas = db.partidas.filter((p) => p.lancamento_id !== id);
  res.json({ status: "sucesso", mensagem: "Lançamento excluído com sucesso." });
});

// --- Relatórios ---
app.get("/api/v1/relatorios/balancete/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const dataIni = (req.query.data_inicio as string) || "2026-01-01";
  const dataFim = (req.query.data_fim as string) || "2026-12-31";
  res.json(RelatoriosService.gerarBalancete(empresaId, dataIni, dataFim));
});

app.get("/api/v1/relatorios/balanco-patrimonial/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const dataPosicao = (req.query.data_posicao as string) || "2026-12-31";
  res.json(RelatoriosService.gerarBalancoPatrimonial(empresaId, dataPosicao));
});

app.get("/api/v1/relatorios/dre/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const dataIni = (req.query.data_inicio as string) || "2026-01-01";
  const dataFim = (req.query.data_fim as string) || "2026-12-31";
  res.json(RelatoriosService.gerarDRE(empresaId, dataIni, dataFim));
});

app.get("/api/v1/relatorios/livro-diario/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const emp = db.empresas.find((e) => e.id === empresaId);
  const dataIni = (req.query.data_inicio as string) || "2026-01-01";
  const dataFim = (req.query.data_fim as string) || "2026-12-31";

  const lancs = db.lancamentos
    .filter((l) => l.empresa_id === empresaId && l.data >= dataIni && l.data <= dataFim)
    .sort((a, b) => a.data.localeCompare(b.data) || a.numero - b.numero);

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
        complemento: p.complemento,
      };
    });
    return {
      numero: l.numero,
      data: l.data,
      historico: l.historico,
      documento: l.documento,
      partidas: partidasItens,
    };
  });

  res.json({
    empresa: emp?.razao_social,
    cnpj: emp?.cnpj,
    periodo: `${dataIni} a ${dataFim}`,
    total_movimento: Number(totalMovimento.toFixed(2)),
    lancamentos: items,
  });
});

app.get("/api/v1/relatorios/livro-razao/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const contaId = req.query.conta_id ? Number(req.query.conta_id) : undefined;
  const dataIni = (req.query.data_inicio as string) || "2026-01-01";
  const dataFim = (req.query.data_fim as string) || "2026-12-31";

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
        saldo_resultante: Number(saldoAcum.toFixed(2)),
      };
    });

    return {
      conta_id: c.id,
      codigo: c.codigo,
      descricao: c.descricao,
      natureza: c.natureza,
      saldo_anterior: Number(saldoInicial.toFixed(2)),
      saldo_final: Number(saldoAcum.toFixed(2)),
      movimentos,
    };
  });

  res.json(resultado);
});

// --- Conciliação OFX ---
app.get("/api/v1/conciliacao/transacoes/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const trns = db.transacoesOFX.filter((t) => t.empresa_id === empresaId);
  res.json(trns);
});

app.post("/api/v1/conciliacao/importar-ofx-texto/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const { conta_bancaria_id, conteudo_ofx } = req.body;
  const result = OFXParserService.importarEProcessar(empresaId, conta_bancaria_id, conteudo_ofx);
  res.json(result);
});

app.post("/api/v1/conciliacao/conciliar/:transacaoId", (req: Request, res: Response) => {
  const id = Number(req.params.transacaoId);
  const trn = db.transacoesOFX.find((t) => t.id === id);
  if (!trn) return res.status(404).json({ detail: "Transação não encontrada" });

  const { conta_contrapartida_id, historico, centro_custo_id } = req.body;
  const partidas =
    trn.tipo === "CREDIT"
      ? [
          { conta_id: trn.conta_bancaria_id, tipo: "DEBITO" as const, valor: trn.valor },
          { conta_id: conta_contrapartida_id, tipo: "CREDITO" as const, valor: trn.valor, centro_custo_id },
        ]
      : [
          { conta_id: conta_contrapartida_id, tipo: "DEBITO" as const, valor: trn.valor, centro_custo_id },
          { conta_id: trn.conta_bancaria_id, tipo: "CREDITO" as const, valor: trn.valor },
        ];

  const lanc = ContabilidadeService.criarLancamento(trn.empresa_id, {
    data: trn.data,
    tipo: "ORDINARIO",
    historico: `${historico} - Extrato OFX: ${trn.memo}`,
    documento: `OFX-${trn.fitid.slice(0, 15)}`,
    partidas,
  });

  trn.status = "CONCILIADO";
  trn.lancamento_id = lanc.id;

  res.json({ status: "sucesso", lancamento_id: lanc.id, numero: lanc.numero });
});

// --- Fiscal / SPED ---
app.get("/api/v1/fiscal-sped/exportar-ecd/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const ano = req.query.ano ? Number(req.query.ano) : 2026;
  const txt = SpedEcdService.gerarArquivoSped(empresaId, ano);

  res.setHeader("Content-Type", "text/plain; charset=iso-8859-1");
  res.setHeader("Content-Disposition", `attachment; filename=SPED_ECD_${empresaId}_${ano}.txt`);
  res.send(txt);
});

app.get("/api/v1/fiscal-sped/validar-ecd/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const ano = req.query.ano ? Number(req.query.ano) : 2026;
  res.json(SpedEcdService.validarConsistencia(empresaId, ano));
});

app.post("/api/v1/fiscal-sped/simular-reforma", (req: Request, res: Response) => {
  res.json(ReformaTributariaService.simular(req.body));
});

// --- Dashboard ---
app.get("/api/v1/dashboard/:empresaId", (req: Request, res: Response) => {
  const empresaId = Number(req.params.empresaId);
  const emp = db.empresas.find((e) => e.id === empresaId);
  if (!emp) return res.status(404).json({ detail: "Empresa não encontrada" });

  const hoje = "2026-12-31";
  const ind = RelatoriosService.gerarIndicadores(empresaId, hoje);
  const totalLanc = db.lancamentos.filter((l) => l.empresa_id === empresaId).length;
  const ofxPend = db.transacoesOFX.filter((t) => t.empresa_id === empresaId && t.status === "PENDENTE").length;

  const ultimos = db.lancamentos
    .filter((l) => l.empresa_id === empresaId)
    .sort((a, b) => b.data.localeCompare(a.data) || b.numero - a.numero)
    .slice(0, 5)
    .map((l) => {
      const pL = db.partidas.filter((p) => p.lancamento_id === l.id);
      const val = pL.filter((p) => p.tipo === "DEBITO").reduce((a, b) => a + b.valor, 0);
      return {
        id: l.id,
        numero: l.numero,
        data: l.data,
        historico: l.historico,
        valor: val,
        tipo: l.tipo,
      };
    });

  const evolucao = [
    { mes: "Jan/26", receitas: ind.faturamento_acumulado, despesas: ind.faturamento_acumulado - ind.lucro_liquido, lucro: ind.lucro_liquido },
    { mes: "Fev/26", receitas: ind.faturamento_acumulado * 0.9, despesas: (ind.faturamento_acumulado - ind.lucro_liquido) * 0.95, lucro: ind.lucro_liquido * 0.85 },
    { mes: "Mar/26", receitas: ind.faturamento_acumulado * 1.1, despesas: (ind.faturamento_acumulado - ind.lucro_liquido) * 0.98, lucro: ind.lucro_liquido * 1.25 },
  ];

  res.json({
    empresa: {
      id: emp.id,
      razao_social: emp.razao_social,
      cnpj: emp.cnpj,
      regime_tributario: emp.regime_tributario,
      ano_exercicio: emp.ano_exercicio,
    },
    resumo: {
      total_empresas: db.empresas.length,
      total_lancamentos: totalLanc,
      ofx_pendentes: ofxPend,
      faturamento_acumulado: ind.faturamento_acumulado,
      lucro_liquido: ind.lucro_liquido,
      total_ativo: ind.total_ativo,
      total_passivo_pl: ind.total_passivo_pl,
      balanceado: ind.balanceado,
    },
    indicadores: {
      liquidez_corrente: ind.liquidez_corrente,
      liquidez_seca: ind.liquidez_seca,
      endividamento_geral_pct: ind.endividamento_geral_pct,
      margem_liquida_pct: ind.margem_liquida_pct,
    },
    evolucao_mensal: evolucao,
    ultimos_lancamentos: ultimos,
  });
});

export default app;
