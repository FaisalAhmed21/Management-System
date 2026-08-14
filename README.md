# Assignment & Submission Management System

A robust, role-based platform designed for educational institutions to streamline the assignment lifecycle. Administrators manage the foundation (users, classes, and subjects), Teachers create, distribute, and grade assignments, and Students view their deadlines, submit their work, and review their grades—all within a single, unified system.

## Main Features

### Admin
- **Dashboard Overview:** Key statistics (total users, classes, assignments).
- **User Management:** Create, read, and manage Admin, Teacher, and Student accounts.
- **Class & Subject Management:** Define the curriculum structure.
- **Teacher Assignments:** Securely map Teachers to specific Subject + Class combinations so they can only manage relevant coursework.

### Teacher
- **My Assignments CRUD:** Create, edit, publish, and delete homework, scoped exclusively to their assigned classes. Drafts are supported.
- **Deadlines & Late Policies:** Native datetime pickers for deadlines, with explicit toggles allowing or preventing late submissions.
- **Submissions & Grading:** Review student submissions per assignment and provide Marks and Feedback through an intuitive grading interface.

### Student
- **Assignment Feed:** View all currently *Published* assignments for the classes they are enrolled in.
- **Submission Portal:** Submit text content or external file URLs securely before the deadline (or later if explicitly permitted).
- **Grades History:** Dedicated view to check teacher feedback and final marks on graded assignments.

## Tech Stack
- **Backend:** C# / .NET 8 (ASP.NET Core Web API)
- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons, Zustand (for state management)
- **Database:** PostgreSQL (via Entity Framework Core)
- **Authentication:** JWT Bearer Tokens (Role-based Authorization)
- **Testing:** xUnit + Moq (Backend)

## Project Structure
```text
.
├── backend/
│   ├── AssignmentSubmission.Api/   # Main ASP.NET Core project
│   │   ├── Controllers/            # API Endpoints
│   │   ├── Models/                 # EF Core Entities
│   │   ├── DTOs/                   # Data Transfer Objects
│   │   └── Data/                   # DbContext & Seeding
│   └── AssignmentSubmission.Tests/ # xUnit Test Suite
└── frontend/
    └── src/
        ├── app/                    # Next.js App Router (Admin, Teacher, Student layouts)
        ├── components/             # Reusable UI components
        ├── lib/                    # Axios API interceptors
        └── store/                  # Zustand authentication state
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- .NET 8 SDK
- PostgreSQL (running locally or remotely)

### Database Setup
1. Create a local PostgreSQL database (e.g., `assignment_submission_db`).
2. Navigate to `backend/AssignmentSubmission.Api`.
3. Set your connection string in `appsettings.Development.json` (or via environment variables).
4. Run migrations and seed the database:
   ```bash
   dotnet ef database update
   ```
   *Note: This automatically seeds Admin, Teacher, and Student users, along with sample classes, enrollments, and assignments.*

### Running the Backend
1. Navigate to `backend/AssignmentSubmission.Api`.
2. Run the application:
   ```bash
   dotnet run
   ```
   The API will start at `http://localhost:5000` (or the port defined in your properties). Swagger UI is available at `/swagger`.

### Running the Frontend
1. Navigate to `frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` based on `.env.example`.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

### Running the Test Suite
1. Navigate to `backend/AssignmentSubmission.Tests`.
2. Run the tests:
   ```bash
   dotnet test
   ```

## Assumptions Made
- **File Uploads:** Assumed the spec ("File Upload or Link") allows users to just provide an external URL to a hosted file (like Google Drive) or text content natively, rather than building an S3/Blob storage architecture for binary file uploads within the MVP.
- **Teacher Assignment Updates:** A teacher's mapping to a class/subject is managed by Admins via Assign/Remove relationships rather than "Editing" the relationship.
- **Grades:** Marks are stored as integers (e.g., `95` out of `100`), not letters or floats.
- **Student Enrollment:** Students are strictly enrolled into entire `ClassCourses`, and automatically inherit assignments for all `Subjects` mapped to that class.

## Known Limitations
- **Responsive Design:** The UI is predominantly optimized for desktop/tablet viewports; heavy data tables may require horizontal scrolling on narrow mobile devices.
- **Toast Notifications / Error Handling Polish:** While the core API error handling works and native `alert()` dialogs intercept issues, global non-blocking toast notifications are omitted per MVP scope constraints.
- **Test Coverage:** The test suite covers the fundamental controller logic (Status transitions, Marks boundaries) but does not include exhaustive End-to-End browser tests (like Cypress) or full frontend component rendering tests.

## Demo Credentials

The database seeding mechanism automatically provides the following working accounts:

Admin Email: admin@example.com Password: Password123
Teacher Email: teacher1@example.com Password: Password123
Student Email: student1@example.com Password: Password123
