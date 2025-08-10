import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TicketDetailsDto {
  @ApiProperty({
    example: 'RJX 765',
    description:
      'The identifier of the vehicle (e.g., flight number, train number).',
    required: false,
  })
  @IsString()
  @IsOptional()
  vehicle_id?: string;

  @ApiProperty({
    example: '17C',
    description: 'The assigned seat number.',
    required: false,
  })
  @IsString()
  @IsOptional()
  seat?: string;

  @ApiProperty({
    example: '10',
    description: 'The gate number for boarding.',
    required: false,
  })
  @IsString()
  @IsOptional()
  gate?: string;

  @ApiProperty({
    example: '3',
    description: 'The platform number for boarding.',
    required: false,
  })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiProperty({
    example: 'Self-check-in luggage at counter.',
    description: 'Any relevant notes about the ticket.',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

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
    description: 'Optional details specific to the transport type.',
    type: TicketDetailsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TicketDetailsDto)
  details?: TicketDetailsDto;
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
