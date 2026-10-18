# SnapShare Scaling Plan

## Assumptions and estimates

- There are 10 million registered users, and 10% are active each day.
- Daily activity is spread evenly across 24 hours for average rates; peak feed traffic is five times the average.
- Each daily active user uploads one photo and views 50 feed pages per day.
- Every uploaded photo is retained for a year, gets one 50 KB thumbnail, and averages 2 MB; estimates use decimal units (1 MB = 1,000,000 bytes) and exclude database data, replication, backups, and storage overhead.
- A year has 365 days.

Daily active users (DAU):

`10,000,000 registered users × 10% active = 1,000,000 DAU`

| Measure                          | Calculation                 |   Estimate |
| -------------------------------- | --------------------------- | ---------: |
| Uploads per day                  | 1,000,000 DAU × 1 photo     |  1,000,000 |
| Average uploads per second       | 1,000,000 ÷ 86,400 seconds  |       11.6 |
| Feed views per day               | 1,000,000 DAU × 50 pages    | 50,000,000 |
| Average feed views per second    | 50,000,000 ÷ 86,400 seconds |        579 |
| Peak feed views per second       | 579 × 5                     |      2,895 |
| Original photo storage per year  | 1,000,000 × 365 × 2 MB      |     730 TB |
| Thumbnail storage per year       | 1,000,000 × 365 × 0.05 MB   |   18.25 TB |
| Total new photo storage per year | 730 TB + 18.25 TB           |  748.25 TB |

The estimates describe new storage for one year's uploads, without replication, backups, or overhead. Since retained photos accumulate, total storage grows by roughly 748.25 TB per year under these assumptions.

## Read/write profile and photo storage

SnapShare is read-heavy: each daily active user makes 50 feed-page views for every photo upload. The design should scale feed reads independently, use caching and a CDN to serve frequently requested content, and keep photo uploads from competing with feed requests for application resources.

Photo files belong in object storage, not in database rows. Object storage is designed for large binary files and scales more economically, while the database can stay focused on user, follow, photo metadata, and feed-index records; the CDN can cache and deliver photo objects close to viewers.

## Architecture

```text
                              +----------------------+
                              |         CDN          |
                              | cached photos/thumbs |
                              +----------+-----------+
                                         |
Users -- feed/photo requests ---------->|
  |                                      |
  +-- API requests --> [Load balancer] --+--> [App servers] <----> [Cache]
                                                |    |  ^            |
                                                |    |  |            |
                                                |    |  +------------+
                                                |    |
                                                |    +----> [Database (primary)]
                                                |                     |
                                                |                     +--> [Read replica]
                                                |
                                                +---- upload original ----> [Object storage]
                                                |                              |
                                                +--> [Thumbnail queue]         +--> CDN origin
                                                        |
                                                        v
                                                  [Thumbnail worker]
                                                        |
                                                        +---- write thumbnail --> [Object storage]
                                                        +---- update metadata --> [Database (primary)]
```

## What each component solves

- **CDN:** Delivers cached photos and thumbnails from edge locations, reducing origin bandwidth and viewer latency.
- **Load balancer:** Distributes API traffic across healthy app servers so a single server does not become a bottleneck.
- **App servers:** Handle authenticated requests, validate uploads, coordinate storage and metadata changes, and assemble feeds.
- **Cache:** Keeps frequently read feed data and metadata available quickly while reducing repeated database reads.
- **Database primary:** Stores durable structured data such as users, follows, photo metadata, and feed relationships.
- **Database read replica:** Handles eligible read queries to scale feed and metadata reads without sending all reads to the primary.
- **Object storage:** Stores original photo and thumbnail files durably without filling the database with large binary blobs.
- **Thumbnail queue:** Buffers thumbnail jobs so image processing can happen asynchronously and absorb bursts of uploads.
- **Thumbnail worker:** Consumes queued jobs, creates resized images, writes thumbnails to object storage, and records their metadata.

## Photo upload flow

1. The user submits an authenticated photo upload request to an app server through the load balancer.
2. The app server validates the request and uploads the original photo to object storage under a unique object key.
3. After the original is stored, the app server writes the photo metadata and object key to the database primary.
4. The app server enqueues a thumbnail job containing the object key and required photo metadata; the client can be told the original upload succeeded while thumbnail processing continues.
5. A thumbnail worker consumes the job, reads the original from object storage, and creates the 50 KB thumbnail.
6. The worker writes the thumbnail to object storage and updates the photo metadata so the thumbnail is available to the feed and CDN.
7. The CDN fetches the original or thumbnail from object storage on a cache miss, then serves cached copies to viewers.

## Trade-offs

- **Asynchronous thumbnails improve upload responsiveness but add delay and failure handling.** Users can finish an upload without waiting for image processing, but the feed may briefly show a placeholder and jobs need retries and monitoring.
- **A read replica increases read capacity but may be stale.** Replication lag can make a newly uploaded photo or recent feed update temporarily absent from replica-backed reads.
- **Caching and CDN delivery reduce latency and database or origin load but complicate freshness.** New or changed content may require cache invalidation, short time-to-live settings, or accepting brief staleness.
- **Object storage separates media from relational data and scales well, but adds coordination across systems.** The upload flow must handle cases where the original is stored but metadata or thumbnail processing fails, and clean up orphaned objects when needed.
