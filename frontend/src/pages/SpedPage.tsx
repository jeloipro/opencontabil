import React, { useState } from "react";
import { api } from "../services/api";
import { ShieldCheck, Download, CheckCircle, AlertTriangle, RefreshCw, FileText } from "lucide-react";

interface Props {
  empresaId: number;
}

export const SpedPage: React.FC<Props> = ({ empresaId }) => {
  const [ano, setAno] = useState<number>(2026);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAudit = async () => {
    setLoading(true);
    try {
      const res = await api.validarSpedECD(empresaId, ano);
      setAuditResult(res);
    } catch (err: any) {
      alert("Erro ao validar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadUrl = api.getSpedEcdUrl(empresaId, ano);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span>Receita Federal do Brasil (SPED Contábil)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Escrituração Contábil Digital - SPED ECD (Blocos 0, I, J e 9)
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Geração de arquivo magnético oficial formatado com delimitador pipe (|), plano referencial RFB,
              demonstrações contábeis e amarração de signatários (Contador e Administrador).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Exercício:</span>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono font-bold"
              />
            </div>

            <button
              onClick={handleAudit}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Executar Pré-Auditoria</span>
            </button>

            <a
              href={downloadUrl}
              download={`SPED_ECD_${empresaId}_${ano}.txt`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo .TXT</span>
            </a>
          </div>
        </div>
      </div>

      {/* Audit Panel */}
      {auditResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div
            className={`p-5 border-b flex items-center justify-between ${
              auditResult.aprovado_para_transmissao
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {auditResult.aprovado_para_transmissao ? (
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-red-600" />
              )}
              <div>
                <h3 className="font-bold text-base">
                  {auditResult.aprovado_para_transmissao
                    ? "Estrutura Aprovada com Sucesso para Transmissão"
                    : "Foram identificadas inconsistências que devem ser corrigidas"}
                </h3>
                <p className="text-xs opacity-90">
                  {auditResult.total_erros} erro(s) impeditivo(s) e {auditResult.total_avisos} aviso(s)
                  detectados na pré-validação antes do PVA.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {auditResult.erros.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                  Erros Críticos (Impedem a validação no PVA):
                </span>
                <div className="space-y-1.5">
                  {auditResult.erros.map((err: string, i: number) => (
                    <div
                      key={i}
                      className="bg-red-50/60 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg font-mono flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {auditResult.avisos.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                  Avisos e Recomendações:
                </span>
                <div className="space-y-1.5">
                  {auditResult.avisos.map((aviso: string, i: number) => (
                    <div
                      key={i}
                      className="bg-amber-50/60 border border-amber-200 text-amber-800 text-xs p-2.5 rounded-lg flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{aviso}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">
              0
            </span>
            <span>Bloco 0 - Abertura e Cadastros</span>
          </div>
          <p className="text-xs text-slate-500">
            Registros 0000 (identificação do CNPJ e signatários), 0001, 0007 e 0990 de encerramento do bloco.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-mono">
              I
            </span>
            <span>Bloco I - Lançamentos Contábeis</span>
          </div>
          <p className="text-xs text-slate-500">
            Registros I010 (Diário Geral), I030 (Termo de Abertura), I050/I051 (Plano de Contas Referencial RFB) e I200/I250 (Partidas Dobradas).
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-mono">
              J
            </span>
            <span>Bloco J - Demonstrações Contábeis</span>
          </div>
          <p className="text-xs text-slate-500">
            Registros J005, J100 (Balanço Patrimonial analítico), J150 (DRE estruturada), J900 (Encerramento) e J930 (CRC Contador).
          </p>
        </div>
      </div>
    </div>
  );
};

