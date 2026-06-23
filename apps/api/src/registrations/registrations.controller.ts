import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Req() req: Request, @Body() dto: CreateRegistrationDto) {
    return this.registrationsService.create((req.user as any).id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my')
  findMy(@Req() req: Request) {
    return this.registrationsService.findMyRegistrations((req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.findOne(id, (req.user as any).id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  cancel(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.registrationsService.cancel((req.user as any).id, id);
  }
}
