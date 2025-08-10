import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
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
    if (!tickets || tickets.length === 0) {
      throw new UnprocessableEntityException(
        'Invalid itinerary: no tickets provided.',
      );
    }

    const originMap = new Map<string, TicketDto>();
    const destinationSet = new Set<string>();

    for (const ticket of tickets) {
      if (originMap.has(ticket.origin)) {
        throw new UnprocessableEntityException(
          `Invalid itinerary: duplicate origin detected for "${ticket.origin}".`,
        );
      }
      originMap.set(ticket.origin, ticket);
      destinationSet.add(ticket.destination);
    }

    let startTicket: TicketDto | null = null;
    for (const ticket of tickets) {
      if (!destinationSet.has(ticket.origin)) {
        if (startTicket !== null) {
          throw new UnprocessableEntityException(
            'Invalid itinerary: multiple starting points.',
          );
        }
        startTicket = ticket;
      }
    }

    if (!startTicket) {
      throw new UnprocessableEntityException(
        'Invalid itinerary: no starting point or circular itinerary.',
      );
    }

    const itinerary: Itinerary = Itinerary.fromUnsortedTickets(tickets);
    this.itineraryRepository.save(itinerary);
    return {
      id: itinerary.id,
      sortedTickets: itinerary.sortedTickets,
      humanReadable: itinerary.humanReadable,
    };
  }
}
