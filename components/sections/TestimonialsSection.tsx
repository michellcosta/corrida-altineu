import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Maria Silva',
    category: 'Prova 10K Geral',
    year: '2025',
    text: 'Melhor corrida que já participei! Organização perfeita, percurso incrível e um clima de festa que só a Corrida do Macuco proporciona.',
    rating: 5,
    image: '👩‍🦰'
  },
  {
    name: 'João Santos',
    category: 'Morador 10K',
    year: '2024',
    text: 'Como morador, é motivo de orgulho ver nossa cidade promovendo um evento desse nível. Já é tradição na minha família!',
    rating: 5,
    image: '👨'
  },
  {
    name: 'Ana Costa',
    category: '60+ 10K',
    year: '2025',
    text: 'Aos 65 anos, completei minha primeira prova de 10K. A equipe foi super atenciosa e o apoio durante o percurso foi excepcional!',
    rating: 5,
    image: '👵'
  },
  {
    name: 'Pedro Oliveira',
    category: 'Prova Kids',
    year: '2025',
    text: 'Meu filho de 8 anos participou pela primeira vez e já está contando os dias para a próxima edição. Parabéns pela iniciativa!',
    rating: 5,
    image: '👨‍👦'
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title">
            O Que Dizem Nossos <span className="text-gradient">Atletas</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Depoimentos reais de quem viveu a experiência Corrida do Macuco
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-8 hover:border-primary-300 transition-all duration-300 hover:shadow-xl"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={64} className="text-primary-500" />
              </div>

              <div className="relative">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  &quot;{testimonial.text}&quot;
                </p>

                {/* Author info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.category} • {testimonial.year}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Seja você o próximo a fazer parte dessa história!
          </p>
          <a
            href="/inscricao"
            className="btn-primary inline-flex items-center justify-center"
          >
            Quero Participar
          </a>
        </div>
      </div>
    </section>
  )
}


