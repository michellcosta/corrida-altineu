'use client'

import { Search, Download, Filter, Trophy } from 'lucide-react'
import { useState } from 'react'

export default function ResultadosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todos')
  const [filterGender, setFilterGender] = useState('todos')

  // Dados mockados - seriam vindos da API
  const resultados = [
    {
      pos: 1,
      nome: 'João Silva',
      numero: 1001,
      categoria: '10K',
      sexo: 'M',
      idade: 32,
      faixa: '30-39',
      cidade: 'Macuco',
      tempo: '00:35:42',
      pace: '03:34',
    },
    {
      pos: 2,
      nome: 'Carlos Santos',
      numero: 1023,
      categoria: '10K',
      sexo: 'M',
      idade: 28,
      faixa: '20-29',
      cidade: 'Rio de Janeiro',
      tempo: '00:36:15',
      pace: '03:37',
    },
    {
      pos: 1,
      nome: 'Maria Oliveira',
      numero: 2034,
      categoria: '10K',
      sexo: 'F',
      idade: 25,
      faixa: '20-29',
      cidade: 'Cantagalo',
      tempo: '00:40:23',
      pace: '04:02',
    },
  ]

  const filteredResults = resultados.filter((r) => {
    const matchesSearch =
      r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.numero.toString().includes(searchTerm)
    const matchesCategory =
      filterCategory === 'todos' || r.categoria === filterCategory
    const matchesGender = filterGender === 'todos' || r.sexo === filterGender
    return matchesSearch && matchesCategory && matchesGender
  })

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl">
            <Trophy className="mb-6" size={64} />
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Resultados
            </h1>
            <p className="text-xl text-indigo-100 leading-relaxed">
              Confira os resultados oficiais da 51ª Corrida Rústica de Macuco. Busque por nome ou número de peito.
            </p>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          {/* Edições Anteriores */}
          <div className="mb-12">
            <h2 className="section-title text-center mb-8">
              Selecione a <span className="text-gradient">Edição</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['2025 (51ª)', '2024 (50ª)', '2023 (49ª)', '2022 (48ª)', '2021 (47ª)'].map(
                (edicao) => (
                  <button
                    key={edicao}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      edicao.includes('2025')
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {edicao}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Busca */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar Atleta
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Nome ou número de peito..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="todos">Todas</option>
                    <option value="10K">10K</option>
                    <option value="2K">2K</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sexo
                  </label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <Download size={18} />
                  Baixar Resultados (PDF)
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download size={18} />
                  Exportar (Excel)
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Filter size={18} />
                  Filtros Avançados
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Resultados */}
          <div className="max-w-6xl mx-auto">
            <div className="card overflow-x-auto">
              <h3 className="font-display font-bold text-2xl mb-6">
                Resultados Gerais - 10K Masculino
              </h3>

              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Pos
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Nº
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Cidade
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Idade
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Faixa
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Tempo
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">
                      Pace
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length > 0 ? (
                    filteredResults.map((resultado) => (
                      <tr
                        key={resultado.numero}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-2">
                          <span
                            className={`font-bold ${
                              resultado.pos === 1
                                ? 'text-yellow-600'
                                : resultado.pos === 2
                                ? 'text-gray-500'
                                : resultado.pos === 3
                                ? 'text-orange-600'
                                : 'text-gray-700'
                            }`}
                          >
                            {resultado.pos === 1
                              ? '🥇'
                              : resultado.pos === 2
                              ? '🥈'
                              : resultado.pos === 3
                              ? '🥉'
                              : resultado.pos}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-gray-600">{resultado.numero}</td>
                        <td className="py-4 px-4 font-semibold">{resultado.nome}</td>
                        <td className="py-4 px-2 text-gray-600">{resultado.cidade}</td>
                        <td className="py-4 px-2 text-gray-600">{resultado.idade}</td>
                        <td className="py-4 px-2 text-gray-600">{resultado.faixa}</td>
                        <td className="py-4 px-4 text-right font-bold text-primary-600">
                          {resultado.tempo}
                        </td>
                        <td className="py-4 px-2 text-right text-gray-600">
                          {resultado.pace}
                        </td>
                        <td className="py-4 px-2 text-center">
                          <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                            Certificado
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">
                        <Search className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="font-semibold">Nenhum resultado encontrado</p>
                        <p className="text-sm">
                          Tente ajustar seus filtros de busca
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="card text-center">
              <p className="text-4xl font-bold text-primary-600 mb-2">3.847</p>
              <p className="text-gray-600">Atletas Total</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">35:42</p>
              <p className="text-gray-600">Melhor Tempo M</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-pink-600 mb-2">40:23</p>
              <p className="text-gray-600">Melhor Tempo F</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-orange-600 mb-2">98.7%</p>
              <p className="text-gray-600">Taxa Conclusão</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

