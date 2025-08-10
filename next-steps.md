## Next steps and improvements

This document outlines potential improvements, why they’re valuable, and why they’re not included right now. Items marked as DONE are already implemented.

### Typing and validation

- **Mode-specific validation in `TicketDetailsDto`** (e.g., `gate` only for flights, `platform` only for trains)
  - **Benefit**: Tighter input validation; clearer error feedback to clients.
  - **Why not now**: Requires per-mode schemas and additional test coverage; current scope focused on core sorting logic.

### Errors and developer experience

<!-- Removed: RFC7807 global formatter and specific 422 messages already implemented and covered by e2e tests -->

### Design and extensibility

<!-- Implemented: Itinerary entity and in-memory repository abstraction -->

### Documentation

<!-- Removed pending item: richer Swagger examples -->

### Observability and robustness

- **Structured logging (pino) and request-id correlation**
  - **Benefit**: Easier troubleshooting across requests; production-grade logs.
  - **Why not now**: Adds operational overhead; defer until deployed environments are in place.

- **Performance metrics (e.g., sorting time, input size) and circuit breakers for external dependencies**
  - **Benefit**: Visibility into performance; protects the service when dependencies degrade.
  - **Why not now**: No external dependencies yet; metrics can be added with minimal code later.

### Testing

- **Unit tests for service error branches** (multiple starts, cycles, breaks, duplicates, empty input)
  - **Benefit**: Confidence in edge cases; prevents regressions.
  - **Why not now**: e2e coverage exists; unit granularity to be added next to improve signal.

- **Property-based testing for the sorting algorithm**
  - **Benefit**: High assurance across generative inputs; surfaces edge cases early.
  - **Why not now**: Requires test harness and generators; planned once core API stabilizes.

### Performance

- **Benchmarks with large inputs; avoid unnecessary copies; validate memory bounds**
  - **Benefit**: Predictable performance under load; guides optimization priorities.
  - **Why not now**: Premature optimization for current scale; will profile with real-world sizes.

### API

- **`DELETE /itineraries/:id` and `GET /itineraries` (listing/pagination)**
  - **Benefit**: Completes CRUD and supports clients that need browsing.
  - **Why not now**: Not required for the initial use case; will add when persistence is introduced.

- **Support `Accept: text/plain` for `GET /itineraries/:id` (content negotiation)**
  - **Benefit**: Human-friendly format for quick reads and sharing.
  - **Why not now**: Extra representation and tests; JSON covers current consumers.


