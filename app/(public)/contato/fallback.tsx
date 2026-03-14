'use client'

import { Mail, Phone, MapPin, MessageCircle, Clock, Loader2 } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'geral',
    mensagem: '',
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Erro ao enviar. Tente novamente ou use o WhatsApp.')
        return
      }
      toast.success('Mensagem enviada com sucesso! Retornaremos em breve.')
      setFormData({ nome: '', email: '', telefone: '', assunto: 'geral', mensagem: '' })
    } catch {
      toast.error('Erro de conexão. Tente novamente ou use o WhatsApp.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl">
            <MessageCircle className="mb-6" size={64} />
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Contato
            </h1>
            <p className="text-xl text-teal-100 leading-relaxed">
              Estamos aqui para ajudar! Entre em contato conosco por qualquer um dos canais abaixo.
            </p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Informações de Contato */}
            <div>
              <h2 className="font-display font-bold text-3xl mb-8">
                Fale Conosco
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {CONTACT_EMAIL}
                    </a>

                  </div>
                </div>



                {/* WhatsApp Section */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="text-emerald-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-emerald-100 rounded-lg p-3 bg-emerald-50/50">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Organização</p>
                          <p className="font-bold text-gray-900">Thiago - Organização</p>
                          <a href="https://wa.me/5521983821217" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            (21) 98382-1217
                          </a>
                        </div>
                        <div className="border border-emerald-100 rounded-lg p-3 bg-emerald-50/50">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Organização</p>
                          <p className="font-bold text-gray-900">Felipe - Organização</p>
                          <a href="https://wa.me/5521988862910" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            (21) 98886-2910
                          </a>
                        </div>
                        <div className="border border-blue-100 rounded-lg p-3 bg-blue-50/50">
                          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Cronometragem / Chip</p>
                          <p className="font-bold text-gray-900">Mário - Cronometragem</p>
                          <a href="https://wa.me/5521982267030" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            (21) 98226-7030
                          </a>
                        </div>
                        <div className="border border-purple-100 rounded-lg p-3 bg-purple-50/50">
                          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Suporte Site</p>
                          <p className="font-bold text-gray-900">Michell - Site</p>
                          <a href="https://wa.me/5521968686880" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            (21) 96868-6880
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Endereço</h3>
                    <p className="text-gray-700">
                      Praça da Cooperativa
                      <br />
                      R. Dr. Mario Freire Martins, 194 - Centro
                      <br />
                      Macuco - RJ, CEP 28545-000
                    </p>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Horário de Atendimento</h3>
                    <p className="text-gray-700">
                      Segunda a Sexta: 9h às 18h
                      <br />
                      Sábado: Fechado
                      <br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Nossa Rede Social</h3>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/corridademacuco/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div>
              <div className="card">
                <h2 className="font-display font-bold text-3xl mb-6">
                  Envie uma Mensagem
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assunto *
                    </label>
                    <select
                      required
                      value={formData.assunto}
                      onChange={(e) =>
                        setFormData({ ...formData, assunto: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="geral">Informações Gerais</option>
                      <option value="inscricao">Inscrição</option>
                      <option value="pagamento">Pagamento</option>
                      <option value="kit">Retirada de Kit</option>
                      <option value="percurso">Percurso</option>
                      <option value="resultado">Resultados</option>
                      <option value="patrocinio">Patrocínio</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.mensagem}
                      onChange={(e) =>
                        setFormData({ ...formData, mensagem: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Escreva sua mensagem aqui..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Mensagem'
                    )}
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    * Campos obrigatórios
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="mt-16">
            <h2 className="section-title text-center mb-12">
              Nossa <span className="text-gradient">Localização</span>
            </h2>
            <div className="max-w-5xl mx-auto">
              <div className="card overflow-hidden p-0 shadow-lg border border-gray-100">
                <div className="aspect-square md:aspect-video w-full relative">
                  <iframe
                    src="https://www.google.com/maps?q=Praça+Central+de+Macuco+Praca+da+Cooperativa+R.+Dr.+Mario+Freire+Martins+194+Centro+Macuco+RJ&z=17&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa da Praça da Cooperativa - Macuco RJ"
                  ></iframe>
                </div>
              </div>

              {/* Botões de Navegação */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=R.+Dr.+Mario+Freire+Martins+194+Centro+Macuco+RJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                >
                  <MapPin size={20} />
                  Abrir no Google Maps
                </a>
                <a
                  href="https://waze.com/ul?q=R.+Dr.+Mario+Freire+Martins+194+Centro+Macuco+RJ&navigate=yes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#33ccff] hover:bg-[#2bb8e6] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.333 13.667c1.334 0 2.667 1.333 2.667 2.666 0 1.334-1.333 2.667-2.667 2.667-1.333 0-2.666-1.333-2.666-2.667 0-1.333 1.332-2.666 2.666-2.666zm-14.666 0c1.333 0 2.666 1.333 2.666 2.666 0 1.334-1.333 2.667-2.666 2.666-1.334 0-2.667-1.333-2.667-2.667 0-1.333 1.333-2.666 2.667-2.666zm14.666 1.333a1.334 1.334 0 00-1.333 1.334c0 .736.597 1.333 1.333 1.333.737 0 1.334-.597 1.334-1.333 0-.737-.597-1.334-1.334-1.334zm-14.666 0a1.334 1.334 0 00-1.333 1.334c0 .736.597 1.333 1.333 1.333.736 0 1.333-.597 1.333-1.333a1.334 1.334 0 00-1.333-1.334zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18.667c-4.787 0-8.667-3.88-8.667-8.667S7.213 3.333 12 3.333s8.667 3.88 8.667 8.667-3.88 8.667-8.667 8.667zM12 5.333c-3.682 0-6.667 2.985-6.667 6.667 0 3.682 2.985 6.667 6.667 6.667 3.682 0 6.667-2.985 6.667-6.667 0-3.682-2.985-6.667-6.667-6.667zm0 1.334a5.333 5.333 0 110 10.666 5.333 5.333 0 010-10.666zm0 1.333a4 4 0 100 8A4 4 0 0012 8z" />
                  </svg>
                  Abrir no Waze
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

