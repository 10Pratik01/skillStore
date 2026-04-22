# ![SkillStore Logo](skillstore_logo_1776889610481.png)

# SkillStore - Microservices E-Learning Platform

SkillStore is a state-of-the-art, comprehensive e-learning platform built on a robust microservices architecture. It provides a seamless experience for both students and instructors, featuring course management, interactive quizzes, community discussions, and real-time analytics.

---

## 🚀 Features

### 👨‍🎓 For Students
- **Course Discovery**: Browse and search through a wide range of courses across various categories.
- **Interactive Learning**: Engage with video lessons, assignments, and quizzes.
- **Progress Tracking**: Keep track of completed lessons and overall course progress.
- **Community Q&A**: Ask questions and get answers from instructors and peers.
- **Secure Enrollment**: Purchase courses with a streamlined checkout process.

### 👨‍🏫 For Instructors
- **Course Creation**: Intuitive studio for building and managing course content.
- **Analytics Dashboard**: Gain insights into student performance and course engagement.
- **Engagement Tools**: Create quizzes and assignments to evaluate student learning.
- **Feedback Management**: Interact with students through community forums.

---

## 🏗️ Architecture

SkillStore follows a **Microservices Architecture** to ensure scalability, maintainability, and independent deployment of features.

- **Frontend**: A modern, responsive React application built with Vite and styled with Tailwind CSS.
- **Backend**: Java-based microservices using Spring Boot and Spring Cloud.
- **Service Registry**: Netflix Eureka for service discovery.
- **API Gateway**: Spring Cloud Gateway for centralized routing and security.
- **Database**: PostgreSQL with dedicated databases for each microservice to ensure data isolation.
- **Containerization**: Fully Dockerized for consistent development and production environments.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Axios, Lucide Icons |
| **Backend** | Spring Boot, Spring Data JPA, Hibernate |
| **Microservices** | Spring Cloud Eureka, Spring Cloud Gateway |
| **Database** | PostgreSQL |
| **DevOps** | Docker, Docker Compose |

---

## 📂 Project Structure

```bash
.
├── Backend/                 # Spring Boot Microservices
│   ├── user-service/        # Authentication & User Management
│   ├── course-service/      # Course Content & Catalog
│   ├── order-service/       # Enrollment & Payments
│   ├── assignment-service/  # Quizzes & Assignments
│   ├── community-service/   # Q&A & Discussions
│   ├── gateway/             # API Gateway (Port 8080)
│   └── registry/            # Eureka Service Registry (Port 8761)
├── Frontend/                # React Dashboard & Learning App (Port 3000)
└── docker-compose.yml       # Full Stack Orchestration
```

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/10Pratik01/skillStore.git
   cd skillStore
   ```

2. **Start the platform**:
   ```bash
   docker compose up --build
   ```

3. **Access the applications**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API Gateway**: [http://localhost:8080](http://localhost:8080)
   - **Service Registry**: [http://localhost:8761](http://localhost:8761)

---

## 📸 Screenshots

*(Add your screenshots here to showcase the beautiful UI!)*

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

*Made with ❤️ by [Pratik Patil](https://github.com/10Pratik01)*
