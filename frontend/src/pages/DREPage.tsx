import React, { useEffect, useState } from "react";
import { api, DREData } from "../services/api";
import { PieChart, RefreshCw, Printer, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  empresaId: number;
}

export const DREPage: React.FC<Props> = ({ empresaId }) => {
  const [data, setData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataInicio, setDataInicio] = useState<string>("2026-01-01");
  const [dataFim, setDataFim] = useState<string>("2026-12-31");

  useEffect(() => {
    loadDRE();
  }, [empresaId]);

  const loadDRE = async () => {
    setLoading(true);
    try {
      const res = await api.getDRE(empresaId, dataInicio, dataFim);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <span>Demonstração do Resultado do Exercício (DRE)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Estrutura legal da Lei 6.404/76: Apuração da Receita Líquida, Margem Bruta e Resultado do Período
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
            onClick={loadDRE}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="p-12 flex justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 flex justify-between items-center">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Resultado Apurado</span>
              <h3 className="text-2xl font-bold mt-1">
                {data.lucro_prejuizo_liquido >= 0 ? "LUCRO LÍQUIDO DO PERÍODO" : "PREJUÍZO DO PERÍODO"}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black font-mono">
                R$ {data.lucro_prejuizo_liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* DRE Structured Rows */}
          <div className="p-6 divide-y divide-slate-100 text-sm">
            {data.linhas.map((linha, idx) => {
              const isPositive = linha.valor >= 0;
              const isTotal = linha.destaque;

              return (
                <div
                  key={idx}
                  className={`py-3 flex justify-between items-center ${
                    isTotal ? "font-bold text-slate-900 bg-slate-50/70 px-3 rounded-lg" : "text-slate-600"
                  }`}
                >
                  <span className={isTotal ? "font-bold tracking-tight" : "pl-4 text-xs font-medium"}>
                    {linha.descricao}
                  </span>
                  <span
                    className={`font-mono font-semibold text-sm ${
                      linha.valor < 0
                        ? "text-red-600"
                        : isTotal
                        ? "text-blue-700 font-bold"
                        : "text-slate-800"
                    }`}
                  >
                    R$ {linha.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
