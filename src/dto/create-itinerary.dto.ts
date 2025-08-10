import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TransportType {
  Train = 'train',
  Flight = 'flight',
  Bus = 'bus',
  Tram = 'tram',
  Boat = 'boat',
  Taxi = 'taxi',
}

export class TicketDto {
  @ApiProperty({
    example: 'St. Anton am Arlberg Bahnhof',
    description: 'The origin of the journey segment.',
  })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({
    example: 'Innsbruck Hbf',
    description: 'The destination of the journey segment.',
  })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({
    description: 'The type of transportation.',
    enum: TransportType,
  })
  @IsEnum(TransportType)
  transport_type: TransportType;

  @ApiProperty({
    description:
      'Optional, free-form details specific to the transport type. Accepts any key/value pairs.',
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;
}

export class CreateItineraryRequestDto {
  @ApiProperty({
    type: [TicketDto],
    description: 'An array of tickets representing the unsorted itinerary.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}
