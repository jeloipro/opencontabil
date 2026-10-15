import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  Landmark,
  FileCheck,
  Scale,
  Calculator,
  PieChart,
  Building2,
  ScrollText,
  ShieldCheck,
  Layers
} from "lucide-react";

export type TabType =
  | "dashboard"
  | "lancamentos"
  | "plano_contas"
  | "conciliacao"
  | "balancete"
  | "balanco"
  | "dre"
  | "livros"
  | "sped"
  | "reforma"
  | "empresas";

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard Executivo", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "lancamentos", label: "Lançamentos Contábeis", icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: "plano_contas", label: "Plano de Contas", icon: <Layers className="w-5 h-5" /> },
    { id: "conciliacao", label: "Conciliação OFX", icon: <Landmark className="w-5 h-5" />, badge: "Smart" },
    { id: "balancete", label: "Balancete de Verificação", icon: <Scale className="w-5 h-5" /> },
    { id: "balanco", label: "Balanço Patrimonial", icon: <BookOpen className="w-5 h-5" /> },
    { id: "dre", label: "DRE - Demonstração", icon: <PieChart className="w-5 h-5" /> },
    { id: "livros", label: "Livro Diário & Razão", icon: <ScrollText className="w-5 h-5" /> },
    { id: "sped", label: "SPED ECD (Oficial)", icon: <ShieldCheck className="w-5 h-5" />, badge: "RFB" },
    { id: "reforma", label: "Reforma Tributária", icon: <Calculator className="w-5 h-5" />, badge: "2026" },
    { id: "empresas", label: "Empresas & Clientes", icon: <Building2 className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md">
          Φ
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
            OpenContábil
            <span className="text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">
              Phoenix
            </span>
          </h1>
          <p className="text-xs text-slate-400">Sistema Contábil Aberto</p>
        </div>
      </div>

      {/* Menu Navigation */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Módulos Operacionais
        </div>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-white text-blue-600"
                      : "bg-slate-800 text-blue-400 border border-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span>Versão</span>
          <span className="font-mono text-slate-300">v1.0.0-oss</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Padrão</span>
          <span className="text-blue-400 font-semibold">CFC / SPED</span>
        </div>
      </div>
    </aside>
  );
};
