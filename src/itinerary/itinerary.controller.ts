import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { CreateItineraryRequestDto } from '../dto/create-itinerary.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ItineraryResponseDto } from '../dto/itinerary-response.dto';

@ApiTags('itineraries')
@Controller({ path: 'itineraries', version: '1' })
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sort an itinerary',
    description:
      'Accepts an array of unsorted tickets, sorts them, and returns the complete itinerary.',
  })
  @ApiBody({ type: CreateItineraryRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Itinerary sorted and created successfully.',
    type: ItineraryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The input data is invalid.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Unprocessable Entity. The itinerary is incomplete, contains cycles, or has invalid structure.',
  })
  @ApiResponse({
    status: 422,
    description:
      'Unprocessable Entity. The itinerary is incomplete or contains cycles.',
  })
  create(
    @Body() createItineraryDto: CreateItineraryRequestDto,
  ): ItineraryResponseDto {
    return this.itineraryService.sortItinerary(createItineraryDto.tickets);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a sorted itinerary by ID',
    description:
      'Retrieves a previously sorted itinerary object by its unique ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'The sorted itinerary.',
    type: ItineraryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found. The itinerary with the specified ID does not exist.',
  })
  @ApiNotFoundResponse({ description: 'Itinerary not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): ItineraryResponseDto {
    return this.itineraryService.findById(id);
  }

  @Get(':id/human')
  @ApiOperation({
    summary: 'Get a human-readable itinerary by ID',
    description:
      'Retrieves a previously sorted itinerary in a human-readable text format.',
  })
  @ApiResponse({
    status: 200,
    description: 'The human-readable itinerary.',
    type: String,
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found. The itinerary with the specified ID does not exist.',
  })
  findOneHuman(@Param('id', ParseUUIDPipe) id: string): string {
    return this.itineraryService.findHumanReadableById(id);
  }
}
