import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TicketDetailsDto {
  @IsString()
  @IsOptional()
  vehicle_id?: string;

  @IsString()
  @IsOptional()
  seat?: string;

  @IsString()
  @IsOptional()
  gate?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class TicketDto {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  transport_type: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => TicketDetailsDto)
  details?: TicketDetailsDto;
}

export class CreateItineraryRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}
