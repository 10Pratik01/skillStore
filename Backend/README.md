# SkillStore Backend ⚙️

The SkillStore Backend is a robust microservices-based system built with **Spring Boot**, **Spring Cloud**, and **PostgreSQL**. It handles everything from user authentication to course management, order processing, and interactive learning features.

## 🏗️ Architecture

The backend follows a decentralized architecture where each service has its own responsibility and database.

### Core Services
- **[Service Registry](registry/)**: Netflix Eureka for dynamic service discovery and health monitoring. (Port: `8761`)
- **[API Gateway](gateway/)**: Spring Cloud Gateway for unified entry point, routing, and security. (Port: `8080`)

### Microservices
- **[User Service](user-service/)**: Handles user registration, authentication (JWT), and profile management.
- **[Course Service](course-service/)**: Manages the course catalog, lesson content, and enrollment logic.
- **[Order Service](order-service/)**: Processes course purchases and payment history.
- **[Assignment Service](assignment-service/)**: Manages quizzes, assignments, and student submissions.
- **[Community Service](community-service/)**: Powers the Q&A forums and student-instructor interactions.

## 🛠️ Tech Stack

- **Framework**: Spring Boot 3.x
- **Infrastructure**: Spring Cloud (Eureka, Gateway)
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: PostgreSQL
- **Build Tool**: Maven

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- Docker (for database and service orchestration)

### Local Development

While you can run services individually, it is recommended to use the `docker-compose.yml` in the root directory to spin up the entire ecosystem:

```bash
docker compose up
```

If you wish to run a specific service manually:
1. Ensure the **Registry** and **PostgreSQL** are running.
2. Navigate to the service directory.
3. Run with Maven:
   ```bash
   mvn spring-boot:run
   ```

## 🔐 Security

- All requests are routed through the **API Gateway**.
- Authentication is handled via **JWT tokens**.
- Inter-service communication is managed through **Feign Clients** (where applicable).

## 📊 Database Schema

Each service maintains its own schema within the PostgreSQL instance:
- `miniproject_user`
- `miniproject_course`
- `miniproject_order`
- `miniproject_assignment`
- `miniproject_community`

---

*Part of the [SkillStore](..) project.*
