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

## API Documentation & Testing

### Swagger UI

Once the application is running, you can access the interactive API documentation (Swagger UI) by navigating to:

[http://localhost:3000/api](http://localhost:3000/api)

The documentation provides detailed information about the available endpoints and their schemas. You can also use it to send requests to the API directly.

### Testing with REST Client

For a more integrated testing experience, this project includes a `http-requests` directory. These files allow you to send requests to the API directly from your code editor.

To use them, install the [**REST Client**](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension for Visual Studio Code.

With the extension installed and the application running, you can open any file in the `http-requests` folder (e.g., `POST_itineraries.http`) and click the "Send Request" link that appears above each request definition.

> **A Note on File Structure:** You will notice that the `GET` request files (e.g., `GET_itinerary_by_id.http`) also contain a `POST` request at the top. This is intentional. The REST Client extension scopes variables (like the itinerary ID needed for a `GET` request) to a single file. To make each file runnable on its own, the creation step is duplicated, ensuring you can test the `GET` endpoints independently without first running a request from another file.

---

## Design Choices & Assumptions

### Input Format

The problem description did not specify a strict input format for the tickets. I have defined a flexible JSON structure that includes:
-   `origin` (string, required)
-   `destination` (string, required)
-   `transport_type` (string, required)
-   `details` (object, optional) containing any other relevant information (`seat`, `gate`, `vehicle_id`, etc.).

This structure is enforced by DTOs and `class-validator`.

### Persistence Strategy (In-Memory)

For the purpose of this challenge, the API uses a simple **in-memory storage** strategy. A `Map` object within the `ItineraryService` holds all the sorted itineraries created during a single session.

**What this means for you:**
-   **No database setup required:** You don't need to install, configure, or seed a database to run the application. It works out of the box.
-   **Data is volatile:** All data, including any sorted itineraries you create, will be **erased** every time the application stops or restarts. This is intentional for simplicity in this project.

In a production environment, this in-memory map would be replaced with a persistent database like PostgreSQL or MongoDB.

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
