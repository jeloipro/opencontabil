import React from "react";
import { Empresa } from "../services/api";
import { Building2, Calendar, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";

interface HeaderProps {
  empresas: Empresa[];
  selectedEmpresaId: number;
  onSelectEmpresa: (id: number) => void;
  onOpenNovoLancamento: () => void;
  isBalanceado?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
  onOpenNovoLancamento,
  isBalanceado = true,
}) => {
  const currentEmpresa = empresas.find((e) => e.id === selectedEmpresaId);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
      {/* Empresa Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Empresa:
          </span>
          <select
            value={selectedEmpresaId}
            onChange={(e) => onSelectEmpresa(Number(e.target.value))}
            className="bg-transparent font-medium text-slate-800 text-sm focus:outline-none cursor-pointer"
          >
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.razao_social} ({emp.cnpj})
              </option>
            ))}
          </select>
        </div>

        {currentEmpresa && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-mono">
              Regime: <strong className="text-slate-700">{currentEmpresa.regime_tributario}</strong>
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Exercício: <strong className="text-slate-700">{currentEmpresa.ano_exercicio}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-4">
        {/* Balance Status indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isBalanceado
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {isBalanceado ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contabilidade Balanceada</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Diferença nos Saldos</span>
            </>
          )}
        </div>

        {/* Novo Lançamento Rápido */}
        <button
          onClick={onOpenNovoLancamento}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>
    </header>
  );
};

