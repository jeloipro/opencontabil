import React, { useEffect, useState } from "react";
import { api, BalancoData } from "../services/api";
import { BookOpen, CheckCircle2, AlertTriangle, RefreshCw, Printer } from "lucide-react";

interface Props {
  empresaId: number;
}

export const BalancoPatrimonialPage: React.FC<Props> = ({ empresaId }) => {
  const [data, setData] = useState<BalancoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataPosicao, setDataPosicao] = useState<string>("2026-12-31");

  useEffect(() => {
    loadBalanco();
  }, [empresaId]);

  const loadBalanco = async () => {
    setLoading(true);
    try {
      const res = await api.getBalanco(empresaId, dataPosicao);
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
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Balanço Patrimonial (NBC TG 26 / Lei 6.404/76)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Posição estática do patrimônio: Bens e Direitos (Ativo) vs Obrigações e Capital Próprio (Passivo e PL)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Data Base:</span>
            <input
              type="date"
              value={dataPosicao}
              onChange={(e) => setDataPosicao(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <button
            onClick={loadBalanco}
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
        <>
          {/* Status Alert */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              data.balanceado
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {data.balanceado ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Equação Patrimonial Perfeita: Total do Ativo = Total do Passivo + Patrimônio Líquido</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Divergência Patrimonial: Total Ativo diferente de Total Passivo + PL</span>
                </>
              )}
            </div>
            <div className="font-mono text-sm font-bold">
              Ativo: R$ {data.total_ativo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} | Passivo+PL: R${" "}
              {data.total_passivo_pl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Dual Column Layout (Ativo vs Passivo) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ATIVO */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-blue-600 text-white px-4 py-3 font-bold text-sm uppercase tracking-wide flex justify-between">
                  <span>ATIVO (Aplicações de Recursos)</span>
                  <span className="font-mono">R$ {data.total_ativo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-4 divide-y divide-slate-100 text-xs">
                  {data.ativo.map((item, idx) => (
                    <div
                      key={idx}
                      className={`py-2 flex justify-between items-center ${
                        item.destaque ? "font-bold text-slate-900 bg-slate-50/50 px-2 rounded" : "text-slate-600"
                      }`}
                    >
                      <span style={{ paddingLeft: `${(item.nivel - 1) * 14}px` }}>
                        {item.codigo} {item.descricao}
                      </span>
                      <span className="font-mono font-semibold">
                        R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>TOTAL DO ATIVO</span>
                <span className="font-mono text-blue-700">
                  R$ {data.total_ativo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* PASSIVO E PATRIMÔNIO LÍQUIDO */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-slate-800 text-white px-4 py-3 font-bold text-sm uppercase tracking-wide flex justify-between">
                  <span>PASSIVO E PATRIMÔNIO LÍQUIDO</span>
                  <span className="font-mono">
                    R$ {data.total_passivo_pl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 divide-y divide-slate-100 text-xs">
                  {data.passivo_pl.map((item, idx) => (
                    <div
                      key={idx}
                      className={`py-2 flex justify-between items-center ${
                        item.destaque ? "font-bold text-slate-900 bg-slate-50/50 px-2 rounded" : "text-slate-600"
                      }`}
                    >
                      <span style={{ paddingLeft: `${(item.nivel - 1) * 14}px` }}>
                        {item.codigo} {item.descricao}
                      </span>
                      <span className="font-mono font-semibold">
                        R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>TOTAL DO PASSIVO + PL</span>
                <span className="font-mono text-emerald-700">
                  R$ {data.total_passivo_pl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

