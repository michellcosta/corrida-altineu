export default function SponsorsSection() {
  const sponsors = {
    platinum: [
      { name: 'Patrocinador 1', logo: 'P1' },
      { name: 'Patrocinador 2', logo: 'P2' },
    ],
    gold: [
      { name: 'Patrocinador 3', logo: 'G1' },
      { name: 'Patrocinador 4', logo: 'G2' },
      { name: 'Patrocinador 5', logo: 'G3' },
    ],
    support: [
      { name: 'Apoio 1', logo: 'A1' },
      { name: 'Apoio 2', logo: 'A2' },
      { name: 'Apoio 3', logo: 'A3' },
      { name: 'Apoio 4', logo: 'A4' },
      { name: 'Apoio 5', logo: 'A5' },
      { name: 'Apoio 6', logo: 'A6' },
    ],
  }

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">
            Nossos <span className="text-gradient">Patrocinadores</span>
          </h2>
          <p className="section-subtitle">
            Empresas que tornam esse evento possível
          </p>
        </div>

        {/* Platinum */}
        <div className="mb-12">
          <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Patrocinadores Platinum
          </h3>
          <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
            {sponsors.platinum.map((sponsor) => (
              <div
                key={sponsor.name}
                className="flex items-center justify-center h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-colors group"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                    {sponsor.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gold */}
        <div className="mb-12">
          <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Patrocinadores Gold
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {sponsors.gold.map((sponsor) => (
              <div
                key={sponsor.name}
                className="flex items-center justify-center h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white group-hover:scale-110 transition-transform">
                    {sponsor.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Apoio
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {sponsors.support.map((sponsor) => (
              <div
                key={sponsor.name}
                className="flex items-center justify-center h-20 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white group-hover:scale-110 transition-transform">
                    {sponsor.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA para patrocinadores */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Quer fazer parte dessa história?
          </p>
          <a
            href="/patrocinio"
            className="inline-block text-primary-600 hover:text-primary-700 font-semibold border-2 border-primary-600 hover:bg-primary-50 py-2 px-6 rounded-lg transition-colors"
          >
            Seja um Patrocinador
          </a>
        </div>
      </div>
    </section>
  )
}








