import { db } from "../db/database";
import { LancamentoModel, PartidaModel } from "./seedData";

export interface PartidaInput {
  conta_id: number;
  tipo: "DEBITO" | "CREDITO";
  valor: number;
  centro_custo_id?: number | null;
  complemento?: string | null;
}

export interface LancamentoInput {
  data: string;
  tipo?: string;
  historico: string;
  documento?: string | null;
  partidas: PartidaInput[];
}

export class ContabilidadeService {
  static getProximoNumero(empresaId: number): number {
    const numeros = db.lancamentos
      .filter((l) => l.empresa_id === empresaId)
      .map((l) => l.numero);
    return (Math.max(0, ...numeros) || 0) + 1;
  }

  static criarLancamento(empresaId: number, input: LancamentoInput): LancamentoModel {
    const empresa = db.empresas.find((e) => e.id === empresaId);
    if (!empresa) throw new Error("Empresa não encontrada.");

    if (empresa.data_bloqueio && input.data <= empresa.data_bloqueio) {
      throw new Error(`Período contábil até ${empresa.data_bloqueio} bloqueado para alterações.`);
    }

    if (!input.partidas || input.partidas.length < 2) {
      throw new Error("O lançamento exige ao menos 2 partidas (1 débito e 1 crédito).");
    }

    const totalDeb = input.partidas
      .filter((p) => p.tipo === "DEBITO")
      .reduce((acc, curr) => acc + curr.valor, 0);

    const totalCred = input.partidas
      .filter((p) => p.tipo === "CREDITO")
      .reduce((acc, curr) => acc + curr.valor, 0);

    if (Math.abs(totalDeb - totalCred) > 0.009) {
      throw new Error(`Partidas não fecham! Total D (R$ ${totalDeb.toFixed(2)}) != Total C (R$ ${totalCred.toFixed(2)})`);
    }

    for (const p of input.partidas) {
      const conta = db.contas.find((c) => c.id === p.conta_id && c.empresa_id === empresaId);
      if (!conta) throw new Error(`Conta ID ${p.conta_id} não encontrada.`);
      if (conta.tipo !== "ANALITICA") {
        throw new Error(`A conta ${conta.codigo} (${conta.descricao}) é SINTÉTICA e não aceita lançamentos.`);
      }
      if (!conta.ativa) {
        throw new Error(`A conta ${conta.codigo} está inativa.`);
      }
    }

    const nextId = (Math.max(0, ...db.lancamentos.map((l) => l.id)) || 0) + 1;
    const numero = this.getProximoNumero(empresaId);

    const novoLancamento: LancamentoModel = {
      id: nextId,
      empresa_id: empresaId,
      numero,
      data: input.data,
      tipo: input.tipo || "ORDINARIO",
      historico: input.historico,
      documento: input.documento || null,
      conciliado: false,
      criado_em: new Date().toISOString(),
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
        complemento: p.complemento || null,
      });
    }

    return novoLancamento;
  }
}
