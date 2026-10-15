import { db } from "../db/database";
import { ContabilidadeService } from "./contabilidadeService";

export class OFXParserService {
  static parseOFX(content: string) {
    const clean = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const trnBlocks = clean.match(/<STMTTRN>[\s\S]*?(?=(?:<STMTTRN>|<\/BANKTRANLIST>|$))/gi) || [];
    const transacoes: any[] = [];

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
          memo: memo || "Transação Bancária",
        });
      }
    }
    return transacoes;
  }

  static importarEProcessar(empresaId: number, contaBancariaId: number, content: string) {
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
        status: "PENDENTE" as const,
        lancamento_id: null as number | null,
      };
      db.transacoesOFX.push(trn);
      importadas++;

      const memoUpper = item.memo.toUpperCase();
      for (const regra of regras) {
        if (memoUpper.includes(regra.padrao_texto.toUpperCase())) {
          const partidas =
            item.sinal > 0
              ? [
                  { conta_id: contaBancariaId, tipo: "DEBITO" as const, valor: item.valor },
                  { conta_id: regra.conta_contrapartida_id, tipo: "CREDITO" as const, valor: item.valor, centro_custo_id: regra.centro_custo_id },
                ]
              : [
                  { conta_id: regra.conta_contrapartida_id, tipo: "DEBITO" as const, valor: item.valor, centro_custo_id: regra.centro_custo_id },
                  { conta_id: contaBancariaId, tipo: "CREDITO" as const, valor: item.valor },
                ];

          const lanc = ContabilidadeService.criarLancamento(empresaId, {
            data: item.data,
            tipo: "ORDINARIO",
            historico: `${regra.historico_padrao} - Ref: ${item.memo}`,
            documento: `OFX-${item.fitid.slice(0, 15)}`,
            partidas,
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
      auto_conciliadas: autoConciliadas,
    };
  }
}
