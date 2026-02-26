import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface AuditLogData {
  userId: string
  action: string
  resource: string
  resourceId?: string
  payload?: any
  ipAddress?: string
  userAgent?: string
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          payload: data.payload,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Não quebrar a aplicação se falhar o audit log
    }
  }

  async getLogs(filters: any = {}) {
    return this.prisma.auditLog.findMany({
      where: filters,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    })
  }
}








