import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  join(@Req() req: Request, @Body() dto: JoinWaitlistDto) {
    return this.waitlistService.join((req.user as any).id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  leave(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.waitlistService.leave((req.user as any).id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my')
  myWaitlist(@Req() req: Request) {
    return this.waitlistService.myWaitlist((req.user as any).id);
  }
}
