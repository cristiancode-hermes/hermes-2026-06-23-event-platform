import { IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  ticketTypeId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateRegistrationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  eventId: number;

  @ApiProperty({ type: [CreateRegistrationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegistrationItemDto)
  items: CreateRegistrationItemDto[];
}
