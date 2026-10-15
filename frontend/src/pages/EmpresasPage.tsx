import React, { useState, useEffect } from "react";
import { api, Empresa } from "../services/api";
import { Building2, Plus, CheckCircle, RefreshCw, Lock, Unlock } from "lucide-react";

interface Props {
  selectedEmpresaId: number;
  onSelectEmpresa: (id: number) => void;
  onEmpresasUpdated: () => void;
}

export const EmpresasPage: React.FC<Props> = ({
  selectedEmpresaId,
  onSelectEmpresa,
  onEmpresasUpdated,
}) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Form state
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [regime, setRegime] = useState("SIMPLES");
  const [cidade, setCidade] = useState("São Paulo");
  const [uf, setUf] = useState("SP");

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const data = await api.getEmpresas();
      setEmpresas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nova = await api.createEmpresa({
        cnpj,
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia || undefined,
        regime_tributario: regime,
        cidade,
        uf,
        ano_exercicio: 2026,
      });
      setModalOpen(false);
      loadEmpresas();
      onEmpresasUpdated();
      onSelectEmpresa(nova.id);
    } catch (err: any) {
      alert("Erro ao cadastrar empresa: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Gestão Multi-Empresa & Escritório Contábil</span>
          </h2>
          <p className="text-xs text-slate-500">
            Cadastre e gerencie múltiplos clientes contábeis, filiais e empresas do grupo econômico
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Empresa</span>
        </button>
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {empresas.map((emp) => {
          const isSelected = emp.id === selectedEmpresaId;

          return (
            <div
              key={emp.id}
              onClick={() => onSelectEmpresa(emp.id)}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                  : "border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {emp.razao_social.slice(0, 2).toUpperCase()}
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Ativa
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-slate-900 text-sm truncate" title={emp.razao_social}>
                  {emp.razao_social}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">CNPJ: {emp.cnpj}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-semibold text-slate-700">
                  {emp.regime_tributario}
                </span>
                <span>{emp.cidade} - {emp.uf}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Empresa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Cadastrar Nova Empresa / Cliente</h3>
            <p className="text-xs text-slate-500">
              O plano de contas padrão referencial da Receita Federal será clonado automaticamente para a nova empresa.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CNPJ</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Empresa Modelo de Serviços Ltda"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Fantasia (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Modelo Tech"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Regime Tributário</label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="SIMPLES">Simples Nacional</option>
                    <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                    <option value="LUCRO_REAL">Lucro Real</option>
                    <option value="MEI">MEI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">UF / Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border rounded-lg text-sm uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Cadastrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

