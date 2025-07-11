# README.md

# Blog Backend

This project is a backend application for a blogging platform.

## Project Structure

- `src/index.js`: Main entry point of the application.
- `Dockerfile`: Instructions to build a Docker image for the application.
- `docker-compose.yml`: Configuration for running multi-container Docker applications.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd blog/backend
   ```

2. Build the Docker image:
   ```
   docker build -t blog-backend .
   ```

3. Run the application using Docker Compose:
   ```
   docker-compose up
   ```

## Usage

Once the application is running, you can access the API at `http://localhost:PORT`, where `PORT` is the port defined in your `docker-compose.yml`.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.