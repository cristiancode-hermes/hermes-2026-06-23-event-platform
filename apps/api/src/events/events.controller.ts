import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from './dto';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my')
  findMy(@Req() req: Request) {
    return this.eventsService.findMyEvents((req.user as any).id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Req() req: Request, @Body() dto: CreateEventDto) {
    return this.eventsService.create((req.user as any).id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update((req.user as any).id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  delete(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove((req.user as any).id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/attendees')
  getAttendees(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getAttendees((req.user as any).id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/waitlist')
  getWaitlist(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getWaitlist((req.user as any).id, id);
  }
}
