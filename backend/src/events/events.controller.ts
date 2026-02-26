import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { EventsService } from './events.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionsGuard } from '../common/guards/permissions.guard'
import { RequirePermission } from '../common/decorators/permissions.decorator'
import { UpdateEventDto } from './dto/event.dto'

@Controller()
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // Public endpoint
  @Get('events/current')
  async getCurrentEvent() {
    return this.eventsService.getCurrentEvent()
  }

  @Get('events/:year')
  async getByYear(@Query('year') year: string) {
    return this.eventsService.getByYear(parseInt(year))
  }

  // Admin endpoints
  @Get('admin/site/settings/event')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission({ resource: 'settings', action: 'read' })
  async getSettings(@Query('year') year?: string) {
    return this.eventsService.getEventSettings(year ? parseInt(year) : 2026)
  }

  @Put('admin/site/settings/event')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission({ resource: 'settings', action: 'write' })
  async updateSettings(@Body() dto: UpdateEventDto, @Request() req) {
    // Busca o evento por ano
    const event = await this.eventsService.getByYear(dto.year || 2026)
    return this.eventsService.update(event.id, dto, req.user.userId)
  }
}








