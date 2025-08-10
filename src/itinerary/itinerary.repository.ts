import { Itinerary } from './itinerary.entity';

export interface ItineraryRepository {
  findById(id: string): Itinerary | undefined;
  save(itinerary: Itinerary): void;
}

export const ITINERARY_REPOSITORY = Symbol('ItineraryRepository');

export class InMemoryItineraryRepository implements ItineraryRepository {
  private readonly idToItinerary = new Map<string, Itinerary>();

  findById(id: string): Itinerary | undefined {
    return this.idToItinerary.get(id);
  }

  save(itinerary: Itinerary): void {
    this.idToItinerary.set(itinerary.id, itinerary);
  }
}
