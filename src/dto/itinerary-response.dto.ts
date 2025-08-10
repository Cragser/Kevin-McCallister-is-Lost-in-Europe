import { ApiProperty } from '@nestjs/swagger';
import { TicketDto } from './create-itinerary.dto';

export class ItineraryResponseDto {
  @ApiProperty({
    example: 'b1b7a9b7-9f9b-4b9b-8b9b-9b9b9b9b9b9b',
    description: 'The unique identifier for the itinerary.',
  })
  id: string;

  @ApiProperty({
    type: [TicketDto],
    description: 'The sorted array of tickets.',
  })
  sortedTickets: TicketDto[];

  @ApiProperty({
    example: '0. Start.\n1. Board train...\n2. Last destination reached.',
    description: 'A human-readable version of the itinerary.',
  })
  humanReadable: string;
}
