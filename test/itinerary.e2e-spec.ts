import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateItineraryRequestDto } from '../src/dto/create-itinerary.dto';

describe('ItineraryController (e2e)', () => {
  let app: INestApplication;
  let createdItineraryId: string;
  const validPayload: CreateItineraryRequestDto = {
    tickets: [
      { origin: 'Innsbruck', destination: 'Venice', transport_type: 'flight' },
      {
        origin: 'St. Anton',
        destination: 'Innsbruck',
        transport_type: 'train',
      },
      { origin: 'Venice', destination: 'Bologna', transport_type: 'bus' },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/itineraries (POST)', () => {
    it('should return a 400 Bad Request if the request body is invalid', () => {
      return request(app.getHttpServer())
        .post('/itineraries')
        .send({ tickets: [{ origin: 'A' }] }) // Missing destination and transport_type
        .expect(400);
    });

    it('should return a 422 Unprocessable Entity if the itinerary is broken', () => {
      const payload: CreateItineraryRequestDto = {
        tickets: [
          { origin: 'A', destination: 'B', transport_type: 'train' },
          { origin: 'C', destination: 'D', transport_type: 'train' }, // Broken chain
        ],
      };

      return request(app.getHttpServer())
        .post('/itineraries')
        .send(payload)
        .expect(422);
    });

    it('should sort the tickets and return a 201 Created', async () => {
      const response = await request(app.getHttpServer())
        .post('/itineraries')
        .send(validPayload)
        .expect(201);

      expect(response.body.id).toBeDefined();
      createdItineraryId = response.body.id; // Save for GET tests

      expect(response.body.sortedTickets).toBeDefined();
      expect(response.body.sortedTickets.length).toBe(3);
      expect(response.body.sortedTickets[0].origin).toBe('St. Anton');
      expect(response.body.sortedTickets[1].origin).toBe('Innsbruck');
      expect(response.body.sortedTickets[2].origin).toBe('Venice');
    });
  });

  describe('/itineraries/:id (GET)', () => {
    it('should return a 404 Not Found for a non-existent id', () => {
      return request(app.getHttpServer())
        .get('/itineraries/b1b7a9b7-9f9b-4b9b-8b9b-9b9b9b9b9b9b') // Random UUID
        .expect(404);
    });

    it('should return the sorted itinerary for a valid id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/itineraries/${createdItineraryId}`)
        .expect(200);

      expect(response.body.id).toBe(createdItineraryId);
      expect(response.body.sortedTickets[0].origin).toBe('St. Anton');
    });
  });

  describe('/itineraries/:id/human (GET)', () => {
    it('should return a 404 Not Found for a non-existent id', () => {
      return request(app.getHttpServer())
        .get('/itineraries/b1b7a9b7-9f9b-4b9b-8b9b-9b9b9b9b9b9b/human') // Random UUID
        .expect(404);
    });

    it('should return the human-readable itinerary for a valid id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/itineraries/${createdItineraryId}/human`)
        .expect(200);

      expect(response.text).toContain('0. Start.');
      expect(response.text).toContain('from St. Anton to Innsbruck');
      expect(response.text).toContain('Last destination reached.');
    });
  });
});
