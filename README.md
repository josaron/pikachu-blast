# Pika-Blast ⚡

A fun web application where you click Pikachu to create lightning blasts with random intensity levels. The backend tracks scores for each intensity level.

## Features

- 🎮 Interactive Pikachu that responds to clicks
- ⚡ Dynamic lightning animations with varying intensity
- 🔊 Sound effects that match intensity levels
- 📊 Score tracking for low, medium, high, and extreme blasts
- 🐳 Fully containerized with Docker
- 🚀 Production-ready infrastructure

## Project Structure

```
pikachu-blast/
├── server.js              # Express backend server
├── package.json           # Node.js dependencies
├── Dockerfile             # Docker image configuration
├── docker-compose.yml     # Docker Compose configuration
├── public/
│   ├── index.html         # Frontend HTML
│   ├── styles.css         # Styling
│   ├── app.js             # Frontend JavaScript
│   └── pikachu.png        # Pikachu image (you need to add this)
└── README.md              # This file
```

## Prerequisites

- Docker and Docker Compose installed
- A Pikachu image file (`pikachu.png`) placed in the `public/` directory
  - See `public/GET_PIKACHU_IMAGE.md` for instructions on obtaining the image

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pikachu-blast
```

2. Add a Pikachu image:
   - Place a `pikachu.png` file in the `public/` directory
   - Recommended size: 300x300px or larger

3. Build and run:
```bash
docker-compose up --build
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Using Docker directly

1. Build the image:
```bash
docker build -t pika-blast .
```

2. Run the container:
```bash
docker run -p 3000:3000 pika-blast
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deployment

### GitHub Actions CI/CD

The project includes GitHub Actions workflows:
- **`.github/workflows/docker-build.yml`**: Builds and tests the Docker image on every push/PR
- **`.github/workflows/deploy.yml`**: Deployment workflow (configure with your cloud platform credentials)

To enable deployment:
1. Add your Docker Hub credentials (or other registry) as GitHub Secrets:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
2. Update the deploy workflow with your cloud platform commands

### Deploying to Cloud Platforms

#### AWS ECS / EC2

1. Build and tag the image:
```bash
docker build -t pika-blast .
docker tag pika-blast:latest <your-ecr-repo>/pika-blast:latest
docker push <your-ecr-repo>/pika-blast:latest
```

2. Deploy using ECS task definition or EC2 instance

#### Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/<project-id>/pika-blast
gcloud run deploy pika-blast --image gcr.io/<project-id>/pika-blast --platform managed
```

#### Azure Container Instances

```bash
az acr build --registry <registry-name> --image pika-blast:latest .
az container create --resource-group <resource-group> --name pika-blast --image <registry-name>.azurecr.io/pika-blast:latest --ports 3000
```

#### Heroku

Create a `heroku.yml`:
```yaml
build:
  docker:
    web: Dockerfile
```

Then deploy:
```bash
heroku container:push web
heroku container:release web
```

### Production Deployment

For production, use the production docker-compose file:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

This includes:
- Resource limits
- Health checks
- Restart policies
- Production environment variables

## API Endpoints

- `GET /` - Serves the frontend application
- `GET /health` - Health check endpoint
- `GET /api/scores` - Get current blast scores
- `POST /api/blast` - Record a new blast
  - Body: `{ "intensity": "low" | "medium" | "high" | "extreme" }`

## Intensity Levels

- **Low** (40% chance): Yellow lightning, lower frequency sound
- **Medium** (30% chance): Gold lightning, medium frequency sound
- **High** (20% chance): Orange lightning, higher frequency sound
- **Extreme** (10% chance): Red lightning, highest frequency sound

## Production Considerations

- The current implementation uses in-memory storage for scores. For production, consider:
  - Adding a database (PostgreSQL, MongoDB, Redis)
  - Implementing persistent storage
  - Adding rate limiting
  - Setting up monitoring and logging
  - Using environment variables for configuration
  - Adding SSL/TLS termination (via reverse proxy like nginx)

## Health Checks

The application includes health check endpoints for container orchestration:
- Docker health check configured in Dockerfile
- HTTP health endpoint at `/health`

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

