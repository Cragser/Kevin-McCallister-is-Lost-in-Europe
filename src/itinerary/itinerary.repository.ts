import { ItineraryResponseDto } from '../dto/itinerary-response.dto';

export interface ItineraryRepository {
  findById(id: string): ItineraryResponseDto | undefined;
  save(itinerary: ItineraryResponseDto): void;
}

export const ITINERARY_REPOSITORY = Symbol('ItineraryRepository');

export class InMemoryItineraryRepository implements ItineraryRepository {
  private readonly idToItinerary = new Map<string, ItineraryResponseDto>();

  findById(id: string): ItineraryResponseDto | undefined {
    return this.idToItinerary.get(id);
  }

  save(itinerary: ItineraryResponseDto): void {
    this.idToItinerary.set(itinerary.id, itinerary);
  }
}


