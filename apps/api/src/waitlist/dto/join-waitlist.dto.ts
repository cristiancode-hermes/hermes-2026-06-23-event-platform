import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinWaitlistDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  eventId: number;
}
