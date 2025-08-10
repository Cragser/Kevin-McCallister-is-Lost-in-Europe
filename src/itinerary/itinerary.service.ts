import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { TicketDto } from '../dto/create-itinerary.dto';
import { ItineraryResponseDto } from '../dto/itinerary-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ItineraryService {
  // In a real application, this would be a database.
  private readonly itineraries = new Map<string, ItineraryResponseDto>();

  findById(id: string): ItineraryResponseDto {
    const itinerary = this.itineraries.get(id);
    if (!itinerary) {
      throw new NotFoundException(`Itinerary with ID "${id}" not found.`);
    }
    return itinerary;
  }

  findHumanReadableById(id: string): string {
    const itinerary = this.findById(id);
    return itinerary.humanReadable;
  }

  sortItinerary(tickets: TicketDto[]): ItineraryResponseDto {
    if (!tickets || tickets.length === 0) {
      const id = uuidv4();
      const response: ItineraryResponseDto = {
        id,
        sortedTickets: [],
        humanReadable: 'No itinerary provided.',
      };
      this.itineraries.set(id, response);
      return response;
    }

    const originMap = new Map<string, TicketDto>();
    const destinationSet = new Set<string>();

    for (const ticket of tickets) {
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

    const sortedTickets: TicketDto[] = [];
    let currentTicket = startTicket;
    const visitedOrigins = new Set<string>();

    while (currentTicket) {
      if (visitedOrigins.has(currentTicket.origin)) {
        throw new UnprocessableEntityException(
          'Invalid itinerary: circular reference detected.',
        );
      }
      visitedOrigins.add(currentTicket.origin);
      sortedTickets.push(currentTicket);
      const nextOrigin = currentTicket.destination;
      currentTicket = originMap.get(nextOrigin);
    }

    if (sortedTickets.length !== tickets.length) {
      throw new UnprocessableEntityException(
        'Invalid itinerary: broken chain.',
      );
    }

    const id = uuidv4();
    const response: ItineraryResponseDto = {
      id,
      sortedTickets,
      humanReadable: this.generateHumanReadable(sortedTickets),
    };

    this.itineraries.set(id, response); // "Persist" the result

    return response;
  }

  private generateHumanReadable(tickets: TicketDto[]): string {
    if (!tickets || tickets.length === 0) {
      return 'No itinerary provided.';
    }

    const steps = tickets.map((ticket, index) => {
      let step = `${index + 1}. Board ${ticket.transport_type}`;
      if (ticket.details?.vehicle_id) {
        step += ` ${ticket.details.vehicle_id}`;
      }
      step += ` from ${ticket.origin} to ${ticket.destination}.`;
      if (ticket.details?.seat) {
        step += ` Seat number ${ticket.details.seat}.`;
      }
      if (ticket.details?.gate) {
        step += ` Gate ${ticket.details.gate}.`;
      }
      if (ticket.details?.platform) {
        step += ` Platform ${ticket.details.platform}.`;
      }
      if (ticket.details?.notes) {
        step += ` ${ticket.details.notes}`;
      }
      return step.trim();
    });

    return [
      '0. Start.',
      ...steps,
      `${tickets.length + 1}. Last destination reached.`,
    ].join('\n');
  }
}
