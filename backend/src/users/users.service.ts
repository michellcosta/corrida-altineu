import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto, UpdateUserDto } from './dto/user.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adminUser.findMany({
      include: {
        role: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mfaEnabled: true,
        lastLogin: true,
        createdAt: true,
      },
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    const { passwordHash, mfaSecret, ...result } = user
    return result
  }

  async create(dto: CreateUserDto) {
    // Verificar se email já existe
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    })

    if (existing) {
      throw new ConflictException('Email já cadastrado')
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.adminUser.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        roleId: dto.roleId,
        avatar: dto.avatar,
      },
      include: {
        role: true,
      },
    })

    const { passwordHash: _, mfaSecret, ...result } = user
    return result
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id)

    const updateData: any = {
      name: dto.name,
      avatar: dto.avatar,
      roleId: dto.roleId,
    }

    // Se mudou senha
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10)
    }

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data: updateData,
      include: { role: true },
    })

    const { passwordHash, mfaSecret, ...result } = updated
    return result
  }

  async delete(id: string) {
    await this.findOne(id) // Verifica se existe

    await this.prisma.adminUser.delete({
      where: { id },
    })

    return { message: 'Usuário excluído com sucesso' }
  }

  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    })
  }
}








