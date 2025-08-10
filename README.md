# Itinerary Sorting API

This project is a solution to the "Kevin McCallister is Lost in Europe" challenge. It's a Nest.js-based REST API that takes a list of unsorted travel tickets, sorts them into a coherent itinerary, and provides endpoints to retrieve the result.

## Features

-   Sorts a list of travel tickets into a continuous itinerary.
-   Handles invalid itineraries (e.g., broken chains, cycles).
-   Persists sorted itineraries in memory.
-   Provides endpoints to retrieve sorted itineraries in JSON or human-readable format.
-   Includes interactive API documentation via Swagger.

---

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
-   [pnpm](https://pnpm.io/) package manager

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd genty
    ```
3.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Running the Application

```bash
# Start the development server with hot-reloading
pnpm run start:dev
```

The application will be running on `http://localhost:3000`.

---

## Running Tests

This project uses Jest for end-to-end (e2e) testing.

To run the tests, execute the following command:

```bash
pnpm run test:e2e
```

---

## API Documentation

Once the application is running, you can access the interactive API documentation (Swagger UI) by navigating to:

[http://localhost:3000/api](http://localhost:3000/api)

The documentation provides detailed information about the available endpoints, their parameters, and response schemas. You can also use it to send requests to the API directly.

---

## Example Usage

Here is an example of how to sort an itinerary using `curl`.

```bash
curl -X POST 'http://localhost:3000/itineraries' \
--header 'Content-Type: application/json' \
--data-raw '{
  "tickets": [
    {
      "origin": "Innsbruck Airport",
      "destination": "Venice Airport",
      "transport_type": "flight",
      "details": {
        "vehicle_id": "AA904",
        "seat": "18B",
        "gate": "10",
        "notes": "Self-check-in luggage at counter."
      }
    },
    {
      "origin": "St. Anton am Arlberg Bahnhof",
      "destination": "Innsbruck Airport",
      "transport_type": "train",
      "details": {
        "vehicle_id": "RJX 765",
        "seat": "17C"
      }
    },
    {
      "origin": "Venice Airport",
      "destination": "Home",
      "transport_type": "taxi",
      "details": {
        "notes": "The final ride home."
      }
    }
  ]
}'
```

---

## Design Choices & Assumptions

### Input Format

The problem description did not specify a strict input format for the tickets. I have defined a flexible JSON structure that includes:
-   `origin` (string, required)
-   `destination` (string, required)
-   `transport_type` (string, required)
-   `details` (object, optional) containing any other relevant information (`seat`, `gate`, `vehicle_id`, etc.).

This structure is enforced by DTOs and `class-validator`.

### Persistence

For this challenge, the sorted itineraries are stored in an in-memory map. In a production environment, this would be replaced with a persistent database like PostgreSQL, MongoDB, or Redis.

### Extensibility: Adding New Transit Types

The current design makes it easy to add new types of transit. The `transport_type` is a simple string, and the `details` object can accommodate any new fields without requiring changes to the core sorting logic.

For example, to add a "boat" transit type with a "cabin_number", you would simply include a ticket in the request like this:

```json
{
  "origin": "Port A",
  "destination": "Port B",
  "transport_type": "boat",
  "details": {
    "vehicle_id": "The Salty Seahorse",
    "cabin_number": "C-12"
  }
}
```

The `generateHumanReadable` function in `ItineraryService` could be updated to recognize the "boat" type and include the `cabin_number` in its output, but the sorting algorithm itself requires no changes.