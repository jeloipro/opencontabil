import React, { useEffect, useState } from "react";
import { api, ContaContabil } from "../services/api";
import { ScrollText, RefreshCw, Printer, BookOpen } from "lucide-react";

interface Props {
  empresaId: number;
}

export const LivrosPage: React.FC<Props> = ({ empresaId }) => {
  const [abaLivro, setAbaLivro] = useState<"DIARIO" | "RAZAO">("DIARIO");
  const [dataInicio, setDataInicio] = useState<string>("2026-01-01");
  const [dataFim, setDataFim] = useState<string>("2026-12-31");
  const [diarioData, setDiarioData] = useState<any>(null);
  const [razaoData, setRazaoData] = useState<any[]>([]);
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [selectedContaId, setSelectedContaId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDependencies();
  }, [empresaId]);

  useEffect(() => {
    if (abaLivro === "DIARIO") {
      loadDiario();
    } else {
      loadRazao();
    }
  }, [empresaId, abaLivro, selectedContaId]);

  const loadDependencies = async () => {
    try {
      const cList = await api.getPlanoContas(empresaId, "ANALITICA");
      setContas(cList);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDiario = async () => {
    setLoading(true);
    try {
      const res = await api.getLivroDiario(empresaId, dataInicio, dataFim);
      setDiarioData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRazao = async () => {
    setLoading(true);
    try {
      const res = await api.getLivroRazao(empresaId, selectedContaId, dataInicio, dataFim);
      setRazaoData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Tab switch */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setAbaLivro("DIARIO")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                abaLivro === "DIARIO"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Livro Diário Geral
            </button>
            <button
              onClick={() => setAbaLivro("RAZAO")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                abaLivro === "RAZAO"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Livro Razão por Conta
            </button>
          </div>

          {abaLivro === "RAZAO" && (
            <select
              value={selectedContaId || ""}
              onChange={(e) => setSelectedContaId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            >
              <option value="">Todas as Contas Analíticas</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo_reduzido} - {c.codigo} | {c.descricao}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Livro Oficial</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : abaLivro === "DIARIO" && diarioData ? (
        /* LIVRO DIÁRIO GERAL */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold uppercase text-slate-700">LIVRO DIÁRIO GERAL - Nº 01</span>
              <p className="text-slate-500">{diarioData.empresa} (CNPJ: {diarioData.cnpj})</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Movimentação Total</span>
              <span className="font-mono font-bold text-sm text-blue-700">
                R$ {diarioData.total_movimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {diarioData.lancamentos.map((l: any) => (
              <div key={l.numero} className="border border-slate-200 rounded-lg p-3 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                  <span className="font-bold text-slate-800">
                    Lançamento Nº {l.numero} — Data: {l.data}
                  </span>
                  <span className="text-slate-500">{l.documento ? `Doc: ${l.documento}` : ""}</span>
                </div>
                <p className="font-sans text-slate-800 italic px-2">{l.historico}</p>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] border-b border-slate-100">
                      <th className="py-1">Conta</th>
                      <th className="py-1">Descrição</th>
                      <th className="py-1 text-right">Débito</th>
                      <th className="py-1 text-right">Crédito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {l.partidas.map((p: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50">
                        <td className="py-1 text-slate-500">{p.conta_codigo}</td>
                        <td className="py-1 font-sans font-medium text-slate-800">{p.conta_descricao}</td>
                        <td className="py-1 text-right text-blue-600 font-bold">
                          {p.tipo === "DEBITO"
                            ? `R$ ${p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                            : "—"}
                        </td>
                        <td className="py-1 text-right text-emerald-600 font-bold">
                          {p.tipo === "CREDITO"
                            ? `R$ ${p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* LIVRO RAZÃO */
        <div className="space-y-4">
          {razaoData.map((contaItem) => (
            <div
              key={contaItem.conta_id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
            >
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {contaItem.codigo} - {contaItem.descricao}
                  </span>
                  <span className="ml-2 text-slate-500">Natureza: {contaItem.natureza}</span>
                </div>
                <div className="flex gap-4 font-mono font-bold text-xs">
                  <span>
                    Saldo Anterior: R${" "}
                    {contaItem.saldo_anterior.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-blue-800">
                    Saldo Final: R${" "}
                    {contaItem.saldo_final.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-3 overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="text-slate-500 uppercase border-b border-slate-200 pb-1">
                      <th className="py-1.5 px-2">Data</th>
                      <th className="py-1.5 px-2">Nº Lçto</th>
                      <th className="py-1.5 px-3 font-sans">Histórico</th>
                      <th className="py-1.5 px-2 text-right">Débito</th>
                      <th className="py-1.5 px-2 text-right">Crédito</th>
                      <th className="py-1.5 px-2 text-right">Saldo Resultante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contaItem.movimentos.map((m: any, mIdx: number) => (
                      <tr key={mIdx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2 text-slate-600">{m.data}</td>
                        <td className="py-1.5 px-2 font-bold text-slate-700">#{m.lancamento_numero}</td>
                        <td className="py-1.5 px-3 font-sans text-slate-800">{m.historico}</td>
                        <td className="py-1.5 px-2 text-right text-blue-600 font-bold">
                          {m.tipo === "DEBITO"
                            ? m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                            : "—"}
                        </td>
                        <td className="py-1.5 px-2 text-right text-emerald-600 font-bold">
                          {m.tipo === "CREDITO"
                            ? m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                            : "—"}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-slate-900">
                          R$ {m.saldo_resultante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
