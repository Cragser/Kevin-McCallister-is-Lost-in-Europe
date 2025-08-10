import { Module } from '@nestjs/common';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import {
  ITINERARY_REPOSITORY,
  InMemoryItineraryRepository,
} from './itinerary.repository';

@Module({
  controllers: [ItineraryController],
  providers: [
    ItineraryService,
    { provide: ITINERARY_REPOSITORY, useClass: InMemoryItineraryRepository },
  ],
})
export class ItineraryModule {}
