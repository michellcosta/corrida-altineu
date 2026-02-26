import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import { RequirePermission } from '../common/decorators/permissions.decorator'
import { CreateUserDto, UpdateUserDto } from './dto/user.dto'

@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermission({ resource: 'users', action: 'read' })
  async findAll() {
    return this.usersService.findAll()
  }

  @Get('roles')
  @RequirePermission({ resource: 'users', action: 'read' })
  async getRoles() {
    return this.usersService.getRoles()
  }

  @Get(':id')
  @RequirePermission({ resource: 'users', action: 'read' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  @RequirePermission({ resource: 'users', action: 'write' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id')
  @RequirePermission({ resource: 'users', action: 'write' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermission({ resource: 'users', action: 'delete' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id)
  }
}








