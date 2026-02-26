import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'error', 'warn'],
    })
  }

  async onModuleInit() {
    await this.$connect()
    console.log('✅ Database connected')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async cleanDatabase() {
    // Para testes - limpa todas as tabelas
    const models = Object.keys(this).filter(key => !key.startsWith('_'))
    
    return Promise.all(
      models.map(model => {
        if (this[model] && typeof this[model].deleteMany === 'function') {
          return this[model].deleteMany()
        }
      })
    )
  }
}








