import { db } from "../db/database";

export class RelatoriosService {
  static gerarBalancete(empresaId: number, dataInicio: string, dataFim: string) {
    const contas = db.contas
      .filter((c) => c.empresa_id === empresaId && c.ativa)
      .sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));

    const lancamentos = db.lancamentos.filter((l) => l.empresa_id === empresaId);
    const partidas = db.partidas;

    let totalPeriodoDebito = 0;
    let totalPeriodoCredito = 0;

    const linhas = contas.map((c) => {
      // Saldo anterior
      const partidasAnt = partidas.filter((p) => {
        if (p.conta_id !== c.id) return false;
        const l = lancamentos.find((lanc) => lanc.id === p.lancamento_id);
        return l && l.data < dataInicio;
      });

      const debAnt = partidasAnt.filter((p) => p.tipo === "DEBITO").reduce((acc, p) => acc + p.valor, 0);
      const credAnt = partidasAnt.filter((p) => p.tipo === "CREDITO").reduce((acc, p) => acc + p.valor, 0);

      // No período
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
        saldo_atual: Number(saldoAtu.toFixed(2)),
      };
    });

    // Propagar saldos para contas sintéticas
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
      linhas,
    };
  }

  static gerarDRE(empresaId: number, dataInicio: string, dataFim: string) {
    const balancete = this.gerarBalancete(empresaId, dataInicio, dataFim);

    const getVal = (prefix: string) => {
      return balancete.linhas
        .filter((l) => l.tipo === "ANALITICA" && l.codigo.startsWith(prefix))
        .reduce((acc, curr) => acc + curr.saldo_atual, 0);
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
      { codigo: "1.1", descricao: "    Receita de Serviços / Vendas", valor: Number(recBruta.toFixed(2)), nivel: 2 },
      { codigo: "2", descricao: "(=) RECEITA OPERACIONAL LÍQUIDA", valor: Number(recLiquida.toFixed(2)), nivel: 1, destaque: true },
      { codigo: "3", descricao: "(-) CUSTOS DOS SERVIÇOS E MERCADORIAS (CMV/CSP)", valor: Number((-custos).toFixed(2)), nivel: 1 },
      { codigo: "4", descricao: "(=) LUCRO BRUTO OPERACIONAL", valor: Number(lucroBruto.toFixed(2)), nivel: 1, destaque: true },
      { codigo: "5", descricao: "(-) DESPESAS OPERACIONAIS", valor: Number((-totalDespOperacionais).toFixed(2)), nivel: 1, destaque: true },
      { codigo: "5.1", descricao: "    Despesas Administrativas e Gerais", valor: Number((-despAdm).toFixed(2)), nivel: 2 },
      { codigo: "5.2", descricao: "    Despesas com Pessoal e Encargos", valor: Number((-despPessoal).toFixed(2)), nivel: 2 },
      { codigo: "5.3", descricao: "    Despesas Tributárias e Impostos", valor: Number((-despTributaria).toFixed(2)), nivel: 2 },
      { codigo: "6", descricao: "(+/-) RESULTADO FINANCEIRO LÍQUIDO", valor: Number(resultadoFinanceiro.toFixed(2)), nivel: 1 },
      { codigo: "6.1", descricao: "    Receitas Financeiras / Rendimentos", valor: Number(recFinanceira.toFixed(2)), nivel: 2 },
      { codigo: "6.2", descricao: "    Despesas Financeiras / Tarifas", valor: Number((-despFinanceira).toFixed(2)), nivel: 2 },
      { codigo: "7", descricao: "(=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO / PREJUÍZO)", valor: Number(lucroLiquido.toFixed(2)), nivel: 1, destaque: true },
    ];

    return {
      empresa_id: empresaId,
      data_inicio: dataInicio,
      data_fim: dataFim,
      linhas,
      lucro_prejuizo_liquido: Number(lucroLiquido.toFixed(2)),
    };
  }

  static gerarBalancoPatrimonial(empresaId: number, dataPosicao: string) {
    const ano = dataPosicao.slice(0, 4);
    const dataIni = `${ano}-01-01`;
    const balancete = this.gerarBalancete(empresaId, dataIni, dataPosicao);
    const dre = this.gerarDRE(empresaId, dataIni, dataPosicao);

    const linhasAtivo: any[] = [];
    const linhasPassivo: any[] = [];
    let totalAtivo = 0;
    let totalPassivoPl = 0;

    for (const l of balancete.linhas) {
      if (l.codigo.startsWith("1")) {
        linhasAtivo.push({
          codigo: l.codigo,
          descricao: l.descricao,
          valor: l.saldo_atual,
          nivel: l.codigo.split(".").length,
          destaque: l.tipo === "SINTETICA",
        });
        if (l.tipo === "ANALITICA") totalAtivo += l.saldo_atual;
      } else if (l.codigo.startsWith("2") || l.codigo.startsWith("3")) {
        linhasPassivo.push({
          codigo: l.codigo,
          descricao: l.descricao,
          valor: l.saldo_atual,
          nivel: l.codigo.split(".").length,
          destaque: l.tipo === "SINTETICA",
        });
        if (l.tipo === "ANALITICA") totalPassivoPl += l.saldo_atual;
      }
    }

    // Lucro do período incorporado ao PL
    const lucro = dre.lucro_prejuizo_liquido;
    linhasPassivo.push({
      codigo: "3.2.01.999",
      descricao: "Resultado Apurado no Período Corrente (DRE)",
      valor: lucro,
      nivel: 4,
      destaque: true,
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
      balanceado,
    };
  }

  static gerarIndicadores(empresaId: number, dataPosicao: string) {
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
      liquidez_corrente: passivoCirc > 0 ? Number((ativoCirc / passivoCirc).toFixed(2)) : 999.0,
      liquidez_seca: passivoCirc > 0 ? Number(((ativoCirc - estoques) / passivoCirc).toFixed(2)) : 999.0,
      endividamento_geral_pct: totalAtivo > 0 ? Number(((totalPassivo / totalAtivo) * 100).toFixed(2)) : 0.0,
      margem_liquida_pct: recLiquida > 0 ? Number(((lucroLiquido / recLiquida) * 100).toFixed(2)) : 0.0,
      lucro_liquido: lucroLiquido,
      faturamento_acumulado: recLiquida,
      total_ativo: bp.total_ativo,
      total_passivo_pl: bp.total_passivo_pl,
      balanceado: bp.balanceado,
    };
  }
}

