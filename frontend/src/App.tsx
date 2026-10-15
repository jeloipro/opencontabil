import React, { useState, useEffect } from "react";
import { Sidebar, TabType } from "./components/Sidebar";
import { Header } from "./components/Header";
import { NovoLancamentoModal } from "./components/NovoLancamentoModal";
import { api, Empresa } from "./services/api";

// Pages
import { DashboardPage } from "./pages/DashboardPage";
import { LancamentosPage } from "./pages/LancamentosPage";
import { PlanoContasPage } from "./pages/PlanoContasPage";
import { ConciliacaoPage } from "./pages/ConciliacaoPage";
import { BalancetePage } from "./pages/BalancetePage";
import { BalancoPatrimonialPage } from "./pages/BalancoPatrimonialPage";
import { DREPage } from "./pages/DREPage";
import { LivrosPage } from "./pages/LivrosPage";
import { SpedPage } from "./pages/SpedPage";
import { ReformaTributariaPage } from "./pages/ReformaTributariaPage";
import { EmpresasPage } from "./pages/EmpresasPage";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number>(1);
  const [modalLancamentoOpen, setModalLancamentoOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isBalanceado, setIsBalanceado] = useState<boolean>(true);

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    if (selectedEmpresaId) {
      checkBalance();
    }
  }, [selectedEmpresaId, refreshKey]);

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(data);
      if (data.length > 0) {
        setSelectedEmpresaId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkBalance = async () => {
    try {
      const res = await api.getBalanco(selectedEmpresaId);
      setIsBalanceado(res.balanceado);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLancamentoSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          empresas={empresas}
          selectedEmpresaId={selectedEmpresaId}
          onSelectEmpresa={setSelectedEmpresaId}
          onOpenNovoLancamento={() => setModalLancamentoOpen(true)}
          isBalanceado={isBalanceado}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 min-w-0">
          <div className="max-w-7xl mx-auto">
            {currentTab === "dashboard" && (
              <DashboardPage
                key={`dash-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
                onNavigate={setCurrentTab}
              />
            )}
            {currentTab === "lancamentos" && (
              <LancamentosPage
                key={`lanc-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
                onOpenNovoLancamento={() => setModalLancamentoOpen(true)}
              />
            )}
            {currentTab === "plano_contas" && (
              <PlanoContasPage
                key={`plano-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "conciliacao" && (
              <ConciliacaoPage
                key={`conc-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "balancete" && (
              <BalancetePage
                key={`balancete-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "balanco" && (
              <BalancoPatrimonialPage
                key={`balanco-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "dre" && (
              <DREPage
                key={`dre-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "livros" && (
              <LivrosPage
                key={`livros-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "sped" && (
              <SpedPage
                key={`sped-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "reforma" && (
              <ReformaTributariaPage
                key={`reforma-${refreshKey}-${selectedEmpresaId}`}
                empresaId={selectedEmpresaId}
              />
            )}
            {currentTab === "empresas" && (
              <EmpresasPage
                selectedEmpresaId={selectedEmpresaId}
                onSelectEmpresa={setSelectedEmpresaId}
                onEmpresasUpdated={loadEmpresas}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modal Lançamento Rápido */}
      <NovoLancamentoModal
        empresaId={selectedEmpresaId}
        isOpen={modalLancamentoOpen}
        onClose={() => setModalLancamentoOpen(false)}
        onSuccess={handleLancamentoSuccess}
      />
    </div>
  );
};

export default App;
