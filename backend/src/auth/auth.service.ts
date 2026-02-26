import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private audit: AuditService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return null
    }

    const { passwordHash, mfaSecret, ...result } = user
    return result
  }

  async login(user: any, ipAddress?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    })

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Audit log
    await this.audit.log({
      userId: user.id,
      action: 'LOGIN',
      resource: 'auth',
      ipAddress,
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        avatar: user.avatar,
        mfaEnabled: user.mfaEnabled,
      },
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      })

      const user = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      })

      if (!user) {
        throw new UnauthorizedException()
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.name,
      }

      return {
        access_token: this.jwtService.sign(newPayload),
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(userId: string, ipAddress?: string) {
    // Audit log
    await this.audit.log({
      userId,
      action: 'LOGOUT',
      resource: 'auth',
      ipAddress,
    })

    // Em produção, invalidaria o token (blacklist Redis)
    return { message: 'Logged out successfully' }
  }

  async getMe(userId: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        mfaEnabled: true,
        lastLogin: true,
        role: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
}








