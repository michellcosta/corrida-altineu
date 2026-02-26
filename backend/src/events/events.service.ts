import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { UpdateEventDto } from './dto/event.dto'

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getByYear(year: number) {
    const event = await this.prisma.event.findUnique({
      where: { year },
      include: {
        categories: true,
        batches: true,
      },
    })

    if (!event) {
      throw new NotFoundException(`Evento ${year} não encontrado`)
    }

    return event
  }

  async getCurrentEvent() {
    const currentYear = new Date().getFullYear()
    
    // Tenta ano atual ou próximo
    let event = await this.prisma.event.findFirst({
      where: {
        OR: [
          { year: currentYear },
          { year: currentYear + 1 },
        ],
      },
      include: {
        categories: true,
      },
      orderBy: {
        year: 'desc',
      },
    })

    if (!event) {
      throw new NotFoundException('Nenhum evento ativo encontrado')
    }

    return event
  }

  async update(id: string, dto: UpdateEventDto, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } })

    if (!event) {
      throw new NotFoundException('Evento não encontrado')
    }

    // Calcula data de corte automaticamente
    const ageCutoffDate = new Date(`${dto.year || event.year}-12-31T23:59:59`)

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        year: dto.year,
        edition: dto.edition,
        raceDate: dto.raceDate ? new Date(dto.raceDate) : undefined,
        ageCutoffDate,
        location: dto.location,
        city: dto.city,
        state: dto.state,
        startTime10K: dto.startTime10K,
        startTime2K: dto.startTime2K,
        totalPrize: dto.totalPrize,
        registrationsOpen: dto.registrationsOpen,
        openDate: dto.openDate ? new Date(dto.openDate) : undefined,
        closeDate: dto.closeDate ? new Date(dto.closeDate) : undefined,
      },
      include: {
        categories: true,
      },
    })

    // Atualizar vagas nas categorias se fornecido
    if (dto.categorySlots) {
      for (const [slug, slots] of Object.entries(dto.categorySlots)) {
        await this.prisma.category.updateMany({
          where: {
            eventId: id,
            slug,
          },
          data: {
            totalSlots: slots as number,
          },
        })
      }
    }

    // Audit log
    await this.audit.log({
      userId,
      action: 'UPDATE',
      resource: 'events',
      resourceId: id,
      payload: dto,
    })

    return updated
  }

  async getEventSettings(year: number = 2026) {
    const event = await this.getByYear(year)
    const categories = await this.prisma.category.findMany({
      where: { eventId: event.id },
    })

    // Formata para o formato esperado pelo frontend
    const categorySlots: any = {}
    categories.forEach(cat => {
      const key = cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)
      categorySlots[`vagas${key}`] = cat.totalSlots
    })

    return {
      anoProva: event.year,
      edicao: event.edition,
      dataProva: event.raceDate.toISOString().split('T')[0],
      horaLargada10K: event.startTime10K,
      horaLargada2K: event.startTime2K,
      localLargada: event.location,
      cidade: event.city,
      estado: event.state,
      vagasGeral: categories.find(c => c.slug === 'geral')?.totalSlots || 0,
      vagasMorador: categories.find(c => c.slug === 'morador')?.totalSlots || 0,
      vagasSessenta: categories.find(c => c.slug === 'sessenta')?.totalSlots || 0,
      vagasInfantil: categories.find(c => c.slug === 'infantil')?.totalSlots || 0,
      valorGeral: categories.find(c => c.slug === 'geral')?.price || 0,
      inscricoesAbertas: event.registrationsOpen,
      dataAberturaInscricoes: event.openDate?.toISOString().split('T')[0],
      dataEncerramentoInscricoes: event.closeDate?.toISOString().split('T')[0],
      premiacaoTotal: event.totalPrize,
    }
  }
}








