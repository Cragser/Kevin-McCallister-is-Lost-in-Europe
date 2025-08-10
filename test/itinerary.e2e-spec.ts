import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  CreateItineraryRequestDto,
  TransportType,
} from '../src/dto/create-itinerary.dto';
import { ProblemDetailsFilter } from '../src/common/filters/problem-details.filter';

describe('ItineraryController (e2e)', () => {
  let app: INestApplication;
  let createdItineraryId: string;
  const API_PREFIX = '/v1';
  const validPayload: CreateItineraryRequestDto = {
    tickets: [
      {
        origin: 'Innsbruck',
        destination: 'Venice',
        transport_type: TransportType.Flight,
      },
      {
        origin: 'St. Anton',
        destination: 'Innsbruck',
        transport_type: TransportType.Train,
      },
      {
        origin: 'Venice',
        destination: 'Bologna',
        transport_type: TransportType.Bus,
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new ProblemDetailsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/itineraries (POST)', () => {
    it('should return a 400 Bad Request (problem+json) if the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/itineraries`)
        .send({ tickets: [{ origin: 'A' }] }) // Missing destination and transport_type
        .expect(400)
        .expect('Content-Type', /application\/problem\+json/);

      expect(res.body.status).toBe(400);
      expect(typeof res.body.title).toBe('string');
      expect(typeof res.body.instance).toBe('string');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should return a 422 Unprocessable Entity (problem+json) if the itinerary is broken', async () => {
      const payload: CreateItineraryRequestDto = {
        tickets: [
          {
            origin: 'A',
            destination: 'B',
            transport_type: TransportType.Train,
          },
          {
            origin: 'C',
            destination: 'D',
            transport_type: TransportType.Train,
          }, // Broken chain
        ],
      };

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/itineraries`)
        .send(payload)
        .expect(422)
        .expect('Content-Type', /application\/problem\+json/);
      expect(res.body.status).toBe(422);
      expect(res.body.title).toBe('Unprocessable Entity');
      expect(typeof res.body.detail).toBe('string');
    });

    it('should sort the tickets and return a 201 Created', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/itineraries`)
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

    it('should return 422 Unprocessable Entity when no tickets are provided', () => {
      const payload: CreateItineraryRequestDto = { tickets: [] } as any;
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/itineraries`)
        .send(payload)
        .expect(422);
    });

    it('should return 422 Unprocessable Entity when duplicate origins exist', () => {
      const payload: CreateItineraryRequestDto = {
        tickets: [
          {
            origin: 'A',
            destination: 'B',
            transport_type: TransportType.Train,
          },
          {
            origin: 'A',
            destination: 'C',
            transport_type: TransportType.Bus,
          },
        ],
      };
      return request(app.getHttpServer())
        .post('/v1/itineraries')
        .send(payload)
        .expect(422);
    });
  });

  describe('/v1/itineraries/:id (GET)', () => {
    it('should return a 404 Not Found (problem+json) for a non-existent id', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/itineraries/b1b7a9b7-9f9b-4b9b-8b9b-9b9b9b9b9b9b`)
        .expect(404)
        .expect('Content-Type', /application\/problem\+json/);
      expect(res.body.status).toBe(404);
      expect(res.body.title).toBe('Not Found');
      expect(typeof res.body.detail).toBe('string');
    });

    it('should return a 400 Bad Request (problem+json) for an invalid UUID', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API_PREFIX}/itineraries/not-a-valid-uuid`)
        .expect(400)
        .expect('Content-Type', /application\/problem\+json/);
      expect(res.body.status).toBe(400);
      expect(res.body.title).toBe('Bad Request');
    });

    it('should return the sorted itinerary for a valid id', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/itineraries/${createdItineraryId}`)
        .expect(200);

      expect(response.body.id).toBe(createdItineraryId);
      expect(response.body.sortedTickets[0].origin).toBe('St. Anton');
    });
  });

  describe('/v1/itineraries/:id/human (GET)', () => {
    it('should return a 404 Not Found for a non-existent id', () => {
      return request(app.getHttpServer())
        .get(
          `${API_PREFIX}/itineraries/b1b7a9b7-9f9b-4b9b-8b9b-9b9b9b9b9b9b/human`,
        ) // Random UUID
        .expect(404);
    });

    it('should return the human-readable itinerary for a valid id', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/itineraries/${createdItineraryId}/human`)
        .expect(200);

      expect(response.text).toContain('0. Start.');
      expect(response.text).toContain('from St. Anton to Innsbruck');
      expect(response.text).toContain('Last destination reached.');
    });
  });
});
