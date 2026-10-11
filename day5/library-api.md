# Library Books REST API

Base path: `/books`

## Endpoints

- **List books**
  - Method: `GET`
  - Path: `/books`
  - Description: Returns the collection of books.
  - Success: `200 OK`

- **Get one book**
  - Method: `GET`
  - Path: `/books/{bookId}`
  - Description: Returns the book with the specified ID.
  - Success: `200 OK`

- **Create a book**
  - Method: `POST`
  - Path: `/books`
  - Description: Creates a book and returns the created resource.
  - Example request body:
    ```json
    {
      "title": "Haunting Adeline",
      "author": "H.D Carlton",
      "publishedYear": 1969
    }
    ```
  - Success: `201 Created`

- **Update a book**
  - Method: `PUT`
  - Path: `/books/{bookId}`
  - Description: Replaces the book with the specified ID.
  - Example request body:
    ```json
    {
      "title": "Hunting Adeline",
      "author": "H.D Carlton",
      "publishedYear": 1969
    }
    ```
  - Success: `200 OK`

- **Delete a book**
  - Method: `DELETE`
  - Path: `/books/{bookId}`
  - Description: Deletes the book with the specified ID.
  - Success: `204 No Content`

- **List books by author**
  - Method: `GET`
  - Path: `/books?author=Ursula%20K.%20Le%20Guin`
  - Description: Returns books whose author matches the `author` query parameter.
  - Success: `200 OK`

## Error responses

- `400 Bad Request`: The request is invalid, such as a create request missing the required `title` field.
- `404 Not Found`: The requested book ID does not exist, such as `GET /books/9999`.
