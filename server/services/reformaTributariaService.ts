export interface SimuladorRequest {
  faturamento_mensal: number;
  compras_insumos_mensal: number;
  folha_salarios_mensal: number;
  regime_atual: "SIMPLES" | "LUCRO_PRESUMIDO" | "LUCRO_REAL";
  aliquota_cbs: number;
  aliquota_ibs: number;
  aliquota_is?: number;
}

export class ReformaTributariaService {
  static simular(dados: SimuladorRequest) {
    const faturamento = dados.faturamento_mensal;
    const compras = dados.compras_insumos_mensal;
    const folha = dados.folha_salarios_mensal;
    const regime = dados.regime_atual;

    let impostoAtual = 0;
    let detalheAtual: any = {};

    if (regime === "SIMPLES") {
      impostoAtual = faturamento * 0.115;
      detalheAtual = {
        regime: "Simples Nacional",
        aliquota_efetiva: "11.50%",
        total_mensal: Number(impostoAtual.toFixed(2)),
      };
    } else if (regime === "LUCRO_PRESUMIDO") {
      const pis = faturamento * 0.0065;
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
        total_mensal: Number(impostoAtual.toFixed(2)),
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
        total_mensal: Number(impostoAtual.toFixed(2)),
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
      total_mensal: Number(totalNovo.toFixed(2)),
    };

    const difMensal = totalNovo - impostoAtual;
    const varPct = impostoAtual > 0 ? Number(((difMensal / impostoAtual) * 100).toFixed(2)) : 0;
    const credTotal = cbsCred + ibsCred;

    const diagnostico =
      difMensal > 0
        ? `A empresa terá um acréscimo estimado de R$ ${difMensal.toFixed(2)}/mês (+${varPct}%). A recuperação de créditos gera R$ ${credTotal.toFixed(2)}/mês.`
        : `A empresa terá uma redução estimada de R$ ${Math.abs(difMensal).toFixed(2)}/mês (${varPct}%). A não-cumulatividade plena sobre insumos proporciona R$ ${credTotal.toFixed(2)}/mês de créditos.`;

    return {
      tributacao_atual: detalheAtual,
      tributacao_nova_reforma: detalheNovo,
      diferenca_mensal: Number(difMensal.toFixed(2)),
      diferenca_anual: Number((difMensal * 12).toFixed(2)),
      variacao_percentual: varPct,
      credito_cbs_ibs_mensal: Number(credTotal.toFixed(2)),
      diagnostico,
    };
  }
}
