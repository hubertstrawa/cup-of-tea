# Cup of Tea

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
Cup of Tea is an MVP application designed to simplify calendar management and lesson bookings for language teachers and students. The platform enables teachers to manage their available lesson slots, while students can easily register via unique teacher-generated links and book lessons. With secure authentication provided by Supabase Auth and automated notifications, Cup of Tea streamlines scheduling to save time and reduce errors.

## Tech Stack
- **Frontend:**
  - **Astro 5:** For fast, efficient page rendering and optimal performance.
  - **React 19:** For building interactive user interface components.
  - **TypeScript 5:** For static type-checking and enhanced IDE support.
  - **Tailwind 4:** For utility-first CSS styling.
  - **Shadcn/ui:** For pre-built, accessible UI components.
- **Backend:**
  - **Supabase:** Utilizing PostgreSQL for databases and Supabase Auth for secure user authentication.
- **Testing:**
  - **Vitest:** Modern testing framework for unit and integration tests.
  - **React Testing Library:** Component testing with focus on user interactions.
  - **jsdom:** DOM simulation for frontend testing.
  - **Coverage Reporting:** Automated test coverage with 90% target for critical code.
- **Additional Technologies:**
  - **AI Integration:** Access to models via Openrouter.ai.
  - **CI/CD:** Managed with GitHub Actions with automated testing pipeline.
  - **Hosting:** Deployed on DigitalOcean.

## Getting Started Locally
To run Cup of Tea locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cup-of-tea.git
   cd cup-of-tea
   ```
2. **Ensure you have the correct Node.js version:**
   - The project requires Node.js `22.14.0`.
   - You can set up your environment using [nvm](https://github.com/nvm-sh/nvm):
     ```bash
     nvm install 22.14.0
     nvm use 22.14.0
     ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Open your browser:**
   Navigate to `http://localhost:3000` (or the port specified) to view the application.

## Available Scripts
The following scripts can be run in the project directory:

- **`npm run dev`**  
  Starts the Astro development server.

- **`npm run build`**  
  Builds the application for production.

- **`npm run preview`**  
  Serves the built project for previewing production builds.

- **`npm run astro`**  
  Runs the Astro CLI command.

- **`npm run lint`**  
  Runs ESLint to check for code quality issues.

- **`npm run lint:fix`**  
  Automatically fixes lint errors.

- **`npm run format`**  
  Formats the codebase using Prettier.

- **`npm run test`**  
  Runs the test suite using Vitest.

- **`npm run test:watch`**  
  Runs tests in watch mode for development.

- **`npm run test:ui`**  
  Opens Vitest UI for interactive test exploration.

- **`npm run test:coverage`**  
  Generates test coverage reports.

## Project Scope
The project includes the following functionalities:
- **Teacher Features:**
  - Registration, login, and secure authentication using Supabase Auth.
  - Calendar management: adding, editing, and deleting lesson slots.
- **Student Features:**
  - Registration through unique, teacher-generated links.
  - Booking available lesson slots with visual indicators for availability.
- **General Features:**
  - Automated email notifications for reservations and reminders.

## Testing Strategy
Cup of Tea implements comprehensive testing to ensure reliability and maintainability:

### Testing Levels
- **Unit Tests:** Individual functions, hooks, and components tested in isolation
- **Integration Tests:** API endpoints and database interactions
- **Component Tests:** React components with user interaction simulation
- **End-to-End Tests:** Complete user workflows (planned for future implementation)

### Quality Metrics
- **90% code coverage** target for business logic
- **100% API endpoint coverage**
- **WCAG 2.1 AA compliance** for accessibility
- **Sub-500ms response times** for 95% of API requests

### Key Test Areas
1. **Authentication & Authorization:** User registration, login, and permission systems
2. **Calendar Management:** Lesson slot creation, editing, and deletion by teachers
3. **Booking System:** Student reservations with conflict resolution
4. **Data Integrity:** Consistent teacher-student relationships and transaction handling
5. **Error Handling:** Graceful failure management and user feedback

For detailed testing procedures, see our [comprehensive test plan](docs/test-plan.md).

## Project Status
Cup of Tea is currently in the MVP phase, actively under development. Future improvements aim to enhance feature sets, optimize performance, and expand user functionalities based on real-world feedback.

## License
This project is licensed under the MIT License.