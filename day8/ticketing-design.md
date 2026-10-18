#TicketHub system Design Document

# TicketHub System Design Document

## 1. Requirements

### Functional Requirements

- **To Browse Events:**so the Users can view a list of upcoming concerts and events.
- **Interactive Seat Map:** Users can have a visual map of available, reserved, and sold seats for a specific event.
- **Seat Reservation:** Users can select seats and reserve them while they complete checkout.
- **Checkout & Purchase:** Users can securely pay for their reserved tickets.
- **Order History:** Users can view their past purchases and download their tickets.

### Non-Functional Requirements

- **High Availability:** The system must remain online and responsive during massive traffic spikes (when a highly waited for concert goes on sale).
- **Data Consistency:** The system must guarantee zero/no double-bookings (it must be physically impossible for two users to purchase the exact same seat).
- **Low Latency:** The interactive seat map and checkout processes must load and respond in under 200ms.
- **Scalability:** The backend architecture must scale horizontally to handle sudden surges in read/write traffic without degrading performance.

---

## 2. Traffic Estimates

### Normal Day Traffic

- **Total Registered Users:** 2,000,000
- **Daily Active Visitors:** 50,000 users
- **Read Traffic:** 50,000 users × 10 pages viewed = 500,000 page views/day. Assuming traffic is concentrated in a 10-hour window, this equals roughly **14 Requests Per Second (RPS)**.
- **Write Traffic (Sales):** 5,000 tickets sold/day. Spread over 10 hours, this is roughly **0.14 writes per second**.

### Popular Concert Traffic (First 10 Minutes)

- **Concurrent Users:** 200,000 users attempting to buy 20,000 seats within 600 seconds (10 minutes).
- **Read Traffic:** Assuming each user makes 5 API calls (login, view map, select seat, checkout, confirm) = 1,000,000 requests / 600 seconds = **~1,666 RPS**.
- **Write Traffic (Sales):** 20,000 tickets sold in 600 seconds = **~33 writes per second**.
- _Note:_ While 33 writes/sec is low for a database, the 1,666 RPS and the intense competition for the exact same database rows require robust locking and caching strategies.

---

## 3. API Design (Express.js)

1.  `GET /api/events`
    - Fetches a paginated list of upcoming events.
2.  `GET /api/events/:id/seats`
    - Fetches the seat map and current availability status for an event (served via Redis cache for speed).
3.  `POST /api/cart/reserve`
    - Accepts an array of `seat_ids` and a `user_id`. Attempts to lock and reserve the seats for 10 minutes.
4.  `POST /api/checkout`
    - Processes payment for reserved seats, finalizes the order, and marks seats as sold.
5.  `GET /api/users/:id/orders`
    - Fetches the purchase history and ticket details for a specific user.

---

## 4. Data Model (MySQL)

### Tables

1.  **Users** (`id`, `name`, `email`, `password_hash`)
2.  **Events** (`id`, `name`, `date`, `venue_id`, `total_seats`)
3.  **Seats** (`id`, `event_id`, `row_label`, `seat_number`, `status` [available/reserved/sold], `reserved_by_user_id`, `reserved_until`)
4.  **Orders** (`id`, `user_id`, `event_id`, `total_price`, `status` [pending/completed], `created_at`)

### Relationships

- **Users 1:N Orders:** A user can have many orders.
- **Events 1:N Seats:** An event has many seats.
- **Events 1:N Orders:** An event has many orders.
- **Seats N:1 Orders:** A seat is ultimately tied to one completed order (via `order_id` added upon checkout).

---

## 5. Architecture & Concurrency

### Architecture Diagram

```text
[ React.js Frontend ]
       │
       ▼
[ Load Balancer (Nginx) ]
       │
       ├──> [ Express API Server 1 ] ──┐
       ├──> [ Express API Server 2 ] ──┼──> [ Redis Cluster ] (Caching & Distributed Locks)
       └──> [ Express API Server N ] ──┘          │
                                                  ▼
                                          [ MySQL Database ] (Primary + Read Replicas)
```
