# SkillStore Frontend 🎨

The SkillStore Frontend is a modern, high-performance learning dashboard built with **React**, **Vite**, and **Tailwind CSS**. It provides a sleek, responsive interface for students to learn and instructors to manage their courses.

## ✨ Features

- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.
- **Dynamic Dashboards**: Personalized views for Students and Instructors.
- **Real-time Interactions**: Interactive course player, quizzes, and community forums.
- **Premium UI**: Crafted with a focus on aesthetics and smooth user experience.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To run the frontend in development mode with HMR:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

> **Note**: For the full microservices experience (including backend connectivity), it is recommended to run the project via Docker Compose from the root directory.

### Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` folder, ready to be served by Nginx or any static host.

## 📁 Structure

- `src/components`: Reusable UI components.
- `src/pages`: Main page views (Dashboard, Course Player, Studio, etc.).
- `src/services`: API integration with the Backend Gateway.
- `src/assets`: Images, fonts, and styles.

---

*Part of the [SkillStore](..) project.*
