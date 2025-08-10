import { UnprocessableEntityException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TicketDto } from '../dto/create-itinerary.dto';

export class Itinerary {
  readonly id: string;
  readonly sortedTickets: TicketDto[];
  readonly humanReadable: string;

  private constructor(
    id: string,
    sortedTickets: TicketDto[],
    humanReadable: string,
  ) {
    this.id = id;
    this.sortedTickets = sortedTickets;
    this.humanReadable = humanReadable;
  }

  static fromUnsortedTickets(tickets: TicketDto[]): Itinerary {
    if (!tickets || tickets.length === 0) {
      throw new UnprocessableEntityException(
        'Invalid itinerary: no tickets provided.',
      );
    }

    const originToTicket = new Map<string, TicketDto>();
    const destinationSet = new Set<string>();

    for (const ticket of tickets) {
      if (originToTicket.has(ticket.origin)) {
        throw new UnprocessableEntityException(
          `Invalid itinerary: duplicate origin detected for "${ticket.origin}".`,
        );
      }
      originToTicket.set(ticket.origin, ticket);
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
    const visitedOrigins = new Set<string>();
    let current: TicketDto | undefined | null = startTicket;

    while (current) {
      if (visitedOrigins.has(current.origin)) {
        throw new UnprocessableEntityException(
          'Invalid itinerary: circular reference detected.',
        );
      }
      visitedOrigins.add(current.origin);
      sortedTickets.push(current);
      current = originToTicket.get(current.destination) ?? null;
    }

    if (sortedTickets.length !== tickets.length) {
      throw new UnprocessableEntityException(
        'Invalid itinerary: broken chain.',
      );
    }

    const id = uuidv4();
    const humanReadable = Itinerary.generateHumanReadable(sortedTickets);
    return new Itinerary(id, sortedTickets, humanReadable);
  }

  private static generateHumanReadable(tickets: TicketDto[]): string {
    if (!tickets || tickets.length === 0) {
      return 'No itinerary provided.';
    }
    const steps = tickets.map((ticket, index) => {
      let step = `${index + 1}. Board ${ticket.transport_type}`;
      if (ticket.details?.vehicle_id) step += ` ${ticket.details.vehicle_id}`;
      step += ` from ${ticket.origin} to ${ticket.destination}.`;
      if (ticket.details?.seat) step += ` Seat number ${ticket.details.seat}.`;
      if (ticket.details?.gate) step += ` Gate ${ticket.details.gate}.`;
      if (ticket.details?.platform)
        step += ` Platform ${ticket.details.platform}.`;
      if (ticket.details?.notes) step += ` ${ticket.details.notes}`;
      return step.trim();
    });
    return [
      '0. Start.',
      ...steps,
      `${tickets.length + 1}. Last destination reached.`,
    ].join('\n');
  }
}
