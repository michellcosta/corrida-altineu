import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ========================================
  // 1. CRIAR ROLES E PERMISSÕES
  // ========================================

  console.log('Creating roles...')

  const siteAdminRole = await prisma.role.upsert({
    where: { name: 'SITE_ADMIN' },
    update: {},
    create: {
      name: 'SITE_ADMIN',
      description: 'Administrador total do sistema - acesso completo',
      permissions: {
        create: [
          { resource: '*', action: '*' },
        ],
      },
    },
  })

  const chipAdminRole = await prisma.role.upsert({
    where: { name: 'CHIP_ADMIN' },
    update: {},
    create: {
      name: 'CHIP_ADMIN',
      description: 'Administrador de cronometragem - gestão de inscritos e resultados',
      permissions: {
        create: [
          { resource: 'registrations', action: 'read' },
          { resource: 'registrations', action: 'write' },
          { resource: 'results', action: '*' },
          { resource: 'exports', action: '*' },
          { resource: 'check-in', action: '*' },
          { resource: 'numbering', action: '*' },
          { resource: 'documents', action: 'read' },
        ],
      },
    },
  })

  const orgAdminRole = await prisma.role.upsert({
    where: { name: 'ORG_ADMIN' },
    update: {},
    create: {
      name: 'ORG_ADMIN',
      description: 'Administrador organizacional - somente visualização',
      permissions: {
        create: [
          { resource: 'insights', action: 'read' },
          { resource: 'reports', action: 'read' },
          { resource: 'notifications', action: 'read' },
          { resource: 'registrations', action: 'read' },
        ],
      },
    },
  })

  console.log('✅ Roles created')

  // ========================================
  // 2. CRIAR USUÁRIOS ADMIN
  // ========================================

  console.log('Creating admin users...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.adminUser.upsert({
    where: { email: 'admin@corridamacuco.com.br' },
    update: {},
    create: {
      name: 'Admin do Site',
      email: 'admin@corridamacuco.com.br',
      passwordHash: hashedPassword,
      roleId: siteAdminRole.id,
      mfaEnabled: false,
    },
  })

  await prisma.adminUser.upsert({
    where: { email: 'chip@corridamacuco.com.br' },
    update: {},
    create: {
      name: 'João Cronometrista',
      email: 'chip@corridamacuco.com.br',
      passwordHash: hashedPassword,
      roleId: chipAdminRole.id,
      mfaEnabled: true,
    },
  })

  await prisma.adminUser.upsert({
    where: { email: 'org@corridamacuco.com.br' },
    update: {},
    create: {
      name: 'Maria Organizadora',
      email: 'org@corridamacuco.com.br',
      passwordHash: hashedPassword,
      roleId: orgAdminRole.id,
      mfaEnabled: false,
    },
  })

  console.log('✅ Admin users created')

  // ========================================
  // 3. CRIAR EVENTO 2026
  // ========================================

  console.log('Creating event 2026...')

  const event2026 = await prisma.event.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      edition: 51,
      raceDate: new Date('2026-06-24T07:00:00'),
      ageCutoffDate: new Date('2026-12-31T23:59:59'),
      location: 'Praça da Matriz, Centro',
      city: 'Macuco',
      state: 'RJ',
      startTime10K: '07:00',
      startTime2K: '08:30',
      totalPrize: 15000,
      registrationsOpen: true,
      openDate: new Date('2025-12-01'),
      closeDate: new Date('2026-06-20'),
    },
  })

  console.log('✅ Event 2026 created')

  // ========================================
  // 4. CRIAR CATEGORIAS
  // ========================================

  console.log('Creating categories...')

  await prisma.category.upsert({
    where: { eventId_slug: { eventId: event2026.id, slug: 'geral' } },
    update: {},
    create: {
      eventId: event2026.id,
      slug: 'geral',
      name: 'Geral 10K',
      distance: '10km',
      price: 20,
      isFree: false,
      minAge: 15,
      totalSlots: 500,
      ageRule: 'Quem completa 15 anos até 31/12/2026',
      color: 'from-blue-600 to-cyan-600',
      icon: '🏃',
      description: 'Categoria principal para atletas a partir de 15 anos',
    },
  })

  await prisma.category.upsert({
    where: { eventId_slug: { eventId: event2026.id, slug: 'morador' } },
    update: {},
    create: {
      eventId: event2026.id,
      slug: 'morador',
      name: 'Morador de Macuco 10K',
      distance: '10km',
      price: 0,
      isFree: true,
      minAge: 15,
      totalSlots: 200,
      ageRule: 'Quem completa 15 anos até 31/12/2026',
      requiresProof: true,
      color: 'from-green-600 to-emerald-600',
      icon: '🏘️',
      description: 'Categoria GRATUITA para moradores de Macuco',
    },
  })

  await prisma.category.upsert({
    where: { eventId_slug: { eventId: event2026.id, slug: 'sessenta' } },
    update: {},
    create: {
      eventId: event2026.id,
      slug: 'sessenta',
      name: '60+ 10K',
      distance: '10km',
      price: 0,
      isFree: true,
      minAge: 60,
      totalSlots: 100,
      ageRule: '60 anos ou mais até 31/12/2026',
      color: 'from-purple-600 to-pink-600',
      icon: '👴',
      description: 'Categoria GRATUITA para atletas 60+',
    },
  })

  await prisma.category.upsert({
    where: { eventId_slug: { eventId: event2026.id, slug: 'infantil' } },
    update: {},
    create: {
      eventId: event2026.id,
      slug: 'infantil',
      name: 'Infantil 2.5K',
      distance: '2.5km',
      price: 0,
      isFree: true,
      minAge: 5,
      maxAge: 14,
      totalSlots: 300,
      ageRule: 'Até 14 anos completos em 2026',
      requiresGuardian: true,
      color: 'from-yellow-500 to-orange-500',
      icon: '👶',
      description: 'Categoria GRATUITA para crianças de 5 a 14 anos',
    },
  })

  console.log('✅ Categories created')

  // ========================================
  // 5. CONFIGURAÇÕES GLOBAIS
  // ========================================

  console.log('Creating global configs...')

  await prisma.siteConfig.upsert({
    where: { key: 'site_info' },
    update: {},
    create: {
      key: 'site_info',
      value: {
        siteName: 'Corrida Rústica de Macuco',
        siteTagline: 'Tradição desde 1974',
        contactEmail: 'contato@corridamacuco.com.br',
        contactPhone: '(22) 3267-8000',
        contactWhatsApp: '(22) 99999-9999',
      },
      description: 'Informações gerais do site',
    },
  })

  console.log('✅ Global configs created')

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📝 Credenciais de teste:')
  console.log('   Site Admin:  admin@corridamacuco.com.br / admin123')
  console.log('   Chip Admin:  chip@corridamacuco.com.br / admin123')
  console.log('   Org Admin:   org@corridamacuco.com.br / admin123\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })








