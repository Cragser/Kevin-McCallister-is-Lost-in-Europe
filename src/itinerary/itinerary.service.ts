import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { TicketDto } from '../dto/create-itinerary.dto';
import { ItineraryResponseDto } from '../dto/itinerary-response.dto';
import { Itinerary } from './itinerary.entity';
import {
  ITINERARY_REPOSITORY,
  ItineraryRepository,
} from './itinerary.repository';

@Injectable()
export class ItineraryService {
  constructor(
    @Inject(ITINERARY_REPOSITORY)
    private readonly itineraryRepository: ItineraryRepository,
  ) {}

  findById(id: string): ItineraryResponseDto {
    const itinerary = this.itineraryRepository.findById(id);
    if (!itinerary) {
      throw new NotFoundException(`Itinerary with ID "${id}" not found.`);
    }
    return {
      id: itinerary.id,
      sortedTickets: itinerary.sortedTickets,
      humanReadable: itinerary.humanReadable,
    };
  }

  findHumanReadableById(id: string): string {
    const itinerary = this.findById(id);
    return itinerary.humanReadable;
  }

  sortItinerary(tickets: TicketDto[]): ItineraryResponseDto {
    const itinerary: Itinerary = Itinerary.fromUnsortedTickets(tickets);
    this.itineraryRepository.save(itinerary);
    return {
      id: itinerary.id,
      sortedTickets: itinerary.sortedTickets,
      humanReadable: itinerary.humanReadable,
    };
  }
}
