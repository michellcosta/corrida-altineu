'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { useState, useEffect } from 'react'
import { Save, Calendar, MapPin, Clock, Users, DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useEventSettings } from '@/hooks/useAdmin'

export default function EventSettingsPage() {
  const { settings, loading, saving, saveSettings } = useEventSettings()
  const [config, setConfig] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setConfig(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!config) return
    
    setErrorMessage(null)
    const result = await saveSettings(config)
    
    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      setErrorMessage(result.message)
    }
  }

  if (loading || !config) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Calcula data de corte automaticamente
  const dataCorteIdade = `31/12/${config.anoProva}`

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up">
            <CheckCircle size={24} />
            <div>
              <p className="font-semibold">Sucesso!</p>
              <p className="text-sm">Configurações salvas com sucesso</p>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {errorMessage && (
          <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up">
            <AlertCircle size={24} />
            <div>
              <p className="font-semibold">Erro!</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Configurações do Evento
            </h1>
            <p className="text-gray-600">
              Configure as informações principais da {config.edicao}ª edição
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-button-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>

        {/* Informações Gerais */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-primary-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Informações Gerais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ano da Prova *
              </label>
              <input
                type="number"
                value={config.anoProva}
                onChange={(e) => setConfig({ ...config, anoProva: parseInt(e.target.value) })}
                className="admin-input"
                min="2024"
                max="2030"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Data de corte de idade: {dataCorteIdade}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Edição *
              </label>
              <input
                type="number"
                value={config.edicao}
                onChange={(e) => setConfig({ ...config, edicao: parseInt(e.target.value) })}
                className="admin-input"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data da Prova *
              </label>
              <input
                type="date"
                value={config.dataProva}
                onChange={(e) => setConfig({ ...config, dataProva: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Largada 10K
              </label>
              <input
                type="time"
                value={config.horaLargada10K}
                onChange={(e) => setConfig({ ...config, horaLargada10K: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Largada 2.5K (Infantil)
              </label>
              <input
                type="time"
                value={config.horaLargada2K}
                onChange={(e) => setConfig({ ...config, horaLargada2K: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Premiação Total (R$)
              </label>
              <input
                type="number"
                value={config.premiacaoTotal}
                onChange={(e) => setConfig({ ...config, premiacaoTotal: parseFloat(e.target.value) })}
                className="admin-input"
                step="100"
              />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Localização</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Local de Largada
              </label>
              <input
                type="text"
                value={config.localLargada}
                onChange={(e) => setConfig({ ...config, localLargada: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cidade
              </label>
              <input
                type="text"
                value={config.cidade}
                onChange={(e) => setConfig({ ...config, cidade: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={config.estado}
                onChange={(e) => setConfig({ ...config, estado: e.target.value })}
                className="admin-input"
              >
                <option value="RJ">Rio de Janeiro</option>
                <option value="SP">São Paulo</option>
                <option value="MG">Minas Gerais</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vagas por Categoria */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Vagas por Categoria</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Geral 10K
              </label>
              <input
                type="number"
                value={config.vagasGeral}
                onChange={(e) => setConfig({ ...config, vagasGeral: parseInt(e.target.value) })}
                className="admin-input"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">R$ {config.valorGeral.toFixed(2)} por inscrição</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Morador 10K
              </label>
              <input
                type="number"
                value={config.vagasMorador}
                onChange={(e) => setConfig({ ...config, vagasMorador: parseInt(e.target.value) })}
                className="admin-input"
                min="0"
              />
              <p className="text-xs text-green-600 mt-1 font-semibold">Gratuito</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                60+ 10K
              </label>
              <input
                type="number"
                value={config.vagasSessenta}
                onChange={(e) => setConfig({ ...config, vagasSessenta: parseInt(e.target.value) })}
                className="admin-input"
                min="0"
              />
              <p className="text-xs text-green-600 mt-1 font-semibold">Gratuito</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Infantil 2.5K
              </label>
              <input
                type="number"
                value={config.vagasInfantil}
                onChange={(e) => setConfig({ ...config, vagasInfantil: parseInt(e.target.value) })}
                className="admin-input"
                min="0"
              />
              <p className="text-xs text-green-600 mt-1 font-semibold">Gratuito</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Total de Vagas</p>
            <p className="text-3xl font-bold text-primary-600">
              {config.vagasGeral + config.vagasMorador + config.vagasSessenta + config.vagasInfantil}
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Valores e Inscrições</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Geral 10K (R$)
              </label>
              <input
                type="number"
                value={config.valorGeral}
                onChange={(e) => setConfig({ ...config, valorGeral: parseFloat(e.target.value) })}
                className="admin-input"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data de Abertura
              </label>
              <input
                type="date"
                value={config.dataAberturaInscricoes}
                onChange={(e) => setConfig({ ...config, dataAberturaInscricoes: e.target.value })}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data de Encerramento
              </label>
              <input
                type="date"
                value={config.dataEncerramentoInscricoes}
                onChange={(e) => setConfig({ ...config, dataEncerramentoInscricoes: e.target.value })}
                className="admin-input"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.inscricoesAbertas}
                onChange={(e) => setConfig({ ...config, inscricoesAbertas: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Inscrições abertas ao público
              </span>
            </label>
          </div>
        </div>

        {/* Regras de Idade (Calculadas Automaticamente) */}
        <div className="admin-card bg-gradient-to-br from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            📅 Regras de Idade (Calculadas Automaticamente)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">Geral 10K</h3>
              <p className="text-sm text-gray-700 mb-2">
                ✅ Quem completa <strong>15 anos até {dataCorteIdade}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Ano de nascimento ≤ {config.anoProva - 15}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">Morador 10K</h3>
              <p className="text-sm text-gray-700 mb-2">
                ✅ Mesma regra do Geral 10K
              </p>
              <p className="text-xs text-gray-500">
                + Comprovante de residência obrigatório
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3">60+ 10K</h3>
              <p className="text-sm text-gray-700 mb-2">
                ✅ <strong>60 anos ou mais</strong> até {dataCorteIdade}
              </p>
              <p className="text-xs text-gray-500">
                Ano de nascimento ≤ {config.anoProva - 60}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-3">Infantil 2.5K</h3>
              <p className="text-sm text-gray-700 mb-2">
                ✅ Até <strong>14 anos completos</strong> em {config.anoProva}
              </p>
              <p className="text-xs text-red-600 font-semibold">
                ⚠️ BLOQUEADO: Quem faz 15 em {config.anoProva} (ano {config.anoProva - 15})
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-300">
            <p className="text-sm text-gray-700">
              <strong>ℹ️ Importante:</strong> As regras de idade são calculadas automaticamente com base no <strong>último dia do ano da prova ({dataCorteIdade})</strong>, não na data específica da corrida. Ao alterar o &quot;Ano da Prova&quot; acima, todas as validações serão atualizadas automaticamente.
            </p>
          </div>
        </div>

        {/* Preview das Mudanças */}
        <div className="admin-card bg-yellow-50 border border-yellow-200">
          <h3 className="font-bold text-gray-900 mb-4">🔍 Preview das Configurações</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Edição</p>
              <p className="font-bold text-lg text-gray-900">{config.edicao}ª</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Ano</p>
              <p className="font-bold text-lg text-gray-900">{config.anoProva}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Total de Vagas</p>
              <p className="font-bold text-lg text-gray-900">
                {config.vagasGeral + config.vagasMorador + config.vagasSessenta + config.vagasInfantil}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Status</p>
              <p className={`font-bold text-lg ${config.inscricoesAbertas ? 'text-green-600' : 'text-red-600'}`}>
                {config.inscricoesAbertas ? 'Abertas' : 'Fechadas'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => window.location.reload()}
            className="admin-button-secondary flex items-center gap-2 text-lg py-3 px-8"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-button-primary flex items-center gap-2 text-lg py-3 px-8 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={24} />
                Salvar Todas as Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

