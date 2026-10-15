import React, { useEffect, useState } from "react";
import { api, BalanceteData } from "../services/api";
import { Scale, Calendar, RefreshCw, Printer } from "lucide-react";

interface Props {
  empresaId: number;
}

export const BalancetePage: React.FC<Props> = ({ empresaId }) => {
  const [data, setData] = useState<BalanceteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataInicio, setDataInicio] = useState<string>("2026-01-01");
  const [dataFim, setDataFim] = useState<string>("2026-12-31");

  useEffect(() => {
    loadBalancete();
  }, [empresaId]);

  const loadBalancete = async () => {
    setLoading(true);
    try {
      const res = await api.getBalancete(empresaId, dataInicio, dataFim);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span>Balancete de Verificação (4 Colunas)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Conferência analítica e sintética de saldos acumulados e movimentação periódica
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Período:</span>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-xs text-slate-400">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <button
            onClick={loadBalancete}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading || !data ? (
          <div className="p-12 flex justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Conta</th>
                  <th className="py-3 px-2">Red.</th>
                  <th className="py-3 px-4 font-sans">Descrição da Conta</th>
                  <th className="py-3 px-2 text-center">Tipo</th>
                  <th className="py-3 px-2 text-center">Nat.</th>
                  <th className="py-3 px-3 text-right">Saldo Anterior</th>
                  <th className="py-3 px-3 text-right">Débito Período</th>
                  <th className="py-3 px-3 text-right">Crédito Período</th>
                  <th className="py-3 px-3 text-right">Saldo Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.linhas.map((l) => {
                  const isSintetica = l.tipo === "SINTETICA";
                  const indent = (l.codigo.split(".").length - 1) * 12;

                  return (
                    <tr
                      key={l.conta_id}
                      className={
                        isSintetica
                          ? "bg-slate-50/80 font-bold text-slate-900"
                          : "hover:bg-blue-50/40 text-slate-700"
                      }
                    >
                      <td className="py-2 px-3">{l.codigo}</td>
                      <td className="py-2 px-2 text-blue-600 font-bold">
                        {!isSintetica ? l.codigo_reduzido : ""}
                      </td>
                      <td className="py-2 px-4 font-sans">
                        <span style={{ paddingLeft: `${indent}px` }}>{l.descricao}</span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`text-[10px] px-1 py-0.5 rounded ${isSintetica ? "bg-purple-100 text-purple-700" : "text-slate-400"}`}>
                          {isSintetica ? "S" : "A"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-bold">
                        <span className={l.natureza === "DEVEDORA" ? "text-blue-600" : "text-emerald-600"}>
                          {l.natureza[0]}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {l.saldo_anterior !== 0
                          ? l.saldo_anterior.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                          : "0,00"}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-700 font-semibold">
                        {l.movimento_debito !== 0
                          ? l.movimento_debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                          : "0,00"}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-700 font-semibold">
                        {l.movimento_credito !== 0
                          ? l.movimento_credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                          : "0,00"}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {l.saldo_atual !== 0
                          ? l.saldo_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                          : "0,00"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-xs">
                <tr>
                  <td colSpan={6} className="py-3 px-4 font-sans uppercase">
                    Totais de Movimentação no Período (Partidas Dobradas)
                  </td>
                  <td className="py-3 px-3 text-right text-blue-400">
                    R$ {data.total_debito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400">
                    R$ {data.total_credito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-white">
                    {Math.abs(data.total_debito - data.total_credito) < 0.01 ? "✓ FECHADO" : "DIVERGÊNCIA"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

