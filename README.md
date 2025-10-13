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
- **Additional Technologies:**
  - **AI Integration:** Access to models via Openrouter.ai.
  - **CI/CD:** Managed with GitHub Actions.
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
  
## Project Status
Cup of Tea is currently in the MVP phase, actively under development. Future improvements aim to enhance feature sets, optimize performance, and expand user functionalities based on real-world feedback.

## License
This project is licensed under the MIT License.