import { db } from "../db/database";
import { RelatoriosService } from "./relatoriosService";

export class SpedEcdService {
  static gerarArquivoSped(empresaId: number, ano: number): string {
    const empresa = db.empresas.find((e) => e.id === empresaId);
    if (!empresa) throw new Error("Empresa não encontrada.");

    const dataIni = `${ano}0101`;
    const dataFim = `${ano}1231`;

    const linhas: string[] = [];
    const contagem: Record<string, number> = {};

    const addReg = (reg: string, ...campos: any[]) => {
      const l = `|${reg}|` + campos.join("|") + "|";
      linhas.push(l);
      contagem[reg] = (contagem[reg] || 0) + 1;
    };

    const cnpjLimpo = empresa.cnpj.replace(/\D/g, "");

    // Bloco 0
    addReg("0000", "LECD", dataIni, dataFim, empresa.razao_social, cnpjLimpo, empresa.uf, empresa.inscricao_estadual || "", "3550308", empresa.inscricao_municipal || "", "0", "0", "0", "", "", "N", "1", "0", "");
    addReg("0001", "0");
    addReg("0007", "00", "");

    const b0Count = Object.keys(contagem).filter((k) => k.startsWith("0")).reduce((acc, k) => acc + contagem[k], 0) + 1;
    linhas.push(`|0990|${b0Count}|`);
    contagem["0990"] = 1;

    // Bloco I
    addReg("I001", "0");
    addReg("I010", "G", "9.00");
    addReg("I030", "TERMO DE ABERTURA", "1", "LIVRO DIARIO GERAL", empresa.razao_social, cnpjLimpo, "JUCESP", "123456789", "01012026", empresa.cidade, "01012026");

    const contas = db.contas.filter((c) => c.empresa_id === empresaId && c.ativa).sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));

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

    // Bloco J
    addReg("J001", "0");
    addReg("J005", dataIni, dataFim, "1", "BALANÇO PATRIMONIAL E DRE");

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

    // Bloco 9
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

  static validarConsistencia(empresaId: number, ano: number) {
    const erros: string[] = [];
    const avisos: string[] = [];

    const contas = db.contas.filter((c) => c.empresa_id === empresaId && c.tipo === "ANALITICA" && c.ativa);
    for (const c of contas) {
      if (!c.codigo_referencial_rfb) {
        avisos.push(`Conta analítica ${c.codigo} (${c.descricao}) não possui mapeamento no Plano Referencial da RFB.`);
      }
    }

    const bp = RelatoriosService.gerarBalancoPatrimonial(empresaId, `${ano}-12-31`);
    if (!bp.balanceado) {
      erros.push(`Balanço Patrimonial não fecha: Ativo Total (R$ ${bp.total_ativo.toFixed(2)}) != Passivo+PL (R$ ${bp.total_passivo_pl.toFixed(2)})`);
    }

    return {
      aprovado_para_transmissao: erros.length === 0,
      total_erros: erros.length,
      total_avisos: avisos.length,
      erros,
      avisos,
    };
  }
}
