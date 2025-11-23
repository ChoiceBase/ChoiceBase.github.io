# Docker Quick Reference

## 🚀 Quick Start

```bash
# Start production server (nginx)
docker-compose up -d

# Start development server (with auto-reload)
docker-compose --profile dev up -d choicebase-dev
```

## 📋 Common Commands

### Starting/Stopping

```bash
# Start all services
docker-compose up -d

# Start only production
docker-compose up -d choicebase

# Start only development
docker-compose --profile dev up -d choicebase-dev

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View production logs
docker-compose logs -f choicebase

# View development logs
docker-compose logs -f choicebase-dev
```

### Rebuilding

```bash
# Rebuild after code changes
docker-compose up -d --build

# Rebuild specific service
docker-compose build choicebase
docker-compose up -d choicebase
```

### Direct Docker Commands

```bash
# Build image manually
docker build -t choicebase .

# Run container manually
docker run -d -p 8081:80 --name choicebase choicebase

# Stop and remove
docker stop choicebase
docker rm choicebase

# View logs
docker logs -f choicebase

# Execute command in container
docker exec -it choicebase sh
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8081
netstat -ano | findstr :8081  # Windows
lsof -i :8081                 # Mac/Linux

# Use different port in docker-compose.yml
ports:
  - "8081:80"  # Change 8081 to 8081
```

### Container Won't Start

```bash
# Check logs
docker-compose logs choicebase

# Remove and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Permission Issues (Linux/Mac)

```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or run with sudo
sudo docker-compose up -d
```

## 📊 Container Status

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Container stats
docker stats

# Inspect container
docker inspect choicebase
```

## 🧹 Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (careful!)
docker system prune -a
```

## 🌐 Access URLs

- **Production**: http://localhost:8081
- **Development**: http://localhost:8081

## 📝 Notes

- Development server auto-reloads on file changes
- Production server uses nginx (more realistic)
- Volumes are mounted for live editing
- Containers restart automatically unless stopped





