# Assignment & Submission Management System

This is a complete, role-based Assignment & Submission Management System built for a school/college. 
The project is organized as a monorepo containing a `.NET 8 Web API` backend and a `Next.js 14` frontend.

## Features
- **Role-based Access Control**: Three distinct roles (Admin, Teacher, Student) with server-side authorization policies.
- **Assignment Management**: Teachers can create, publish, and manage assignments.
- **Submission Workflow**: Students can submit assignments, which are automatically marked "Late" if submitted past the deadline unless explicitly allowed.
- **Grading System**: Teachers can grade submissions and provide feedback.
- **Security**: JWT-based authentication, BCrypt password hashing.

## Tech Stack
- **Backend**: ASP.NET Core Web API (.NET 8), Entity Framework Core (Code-First), PostgreSQL, FluentValidation, Serilog, Swashbuckle, xUnit.
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, React Hook Form, Zod, Axios, Zustand.

## Project Structure
- `/backend`: Contains the .NET 8 Web API (`AssignmentSubmission.Api`) and Unit Tests (`AssignmentSubmission.Tests`).
- `/frontend`: Contains the Next.js React application.

## Setup Instructions

### 1. Database & Backend
1. Ensure you have **PostgreSQL** installed and running.
2. Ensure you have the **.NET 8 SDK** installed.
3. Open `backend/AssignmentSubmission.Api/appsettings.json` and configure your `DefaultConnection` string (update username/password).
4. Open a terminal in `backend/AssignmentSubmission.Api` and run the initial migration:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
   *(Note: The database will be seeded automatically on startup via `DbInitializer` if empty).*
5. Run the backend:
   ```bash
   dotnet run
   ```
   The API will start (usually on `https://localhost:7198`). You can access Swagger at `/swagger`.

### 2. Frontend
1. Ensure you have **Node.js** (v18+) installed.
2. Open a terminal in `/frontend`.
3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials (Seeded Data)

The following users are automatically created upon the first database initialization:

- **Admin**: `admin@example.com` / `Password123`
- **Teacher**: `teacher1@example.com` / `Password123`
- **Teacher**: `teacher2@example.com` / `Password123`
- **Student**: `student1@example.com` / `Password123`
- **Student**: `student2@example.com` / `Password123`

## Assumptions & Design Decisions
1. **User Management**: We assume the Admin creates users (Teachers/Students). A basic `/api/auth/register` is provided, but in production, it would be secured.
2. **Submission Format**: Submissions consist of a `Content` text field (e.g., textarea) and an optional `FileUrl` string (for links to external files/Google Drive, etc.).
3. **Late Submissions**: A student can submit after the deadline. If `AllowLateSubmissions` is false, it's blocked. If true, it automatically gets the status `Late` instead of `Submitted`.
4. **Environment**: The workspace lacked the `.NET CLI` during scaffolding, so the backend `.csproj` and C# files were constructed manually. You will need to run the `dotnet ef` migration commands locally.

## Testing
To run the backend unit tests:
```bash
cd backend/AssignmentSubmission.Tests
dotnet test
```
This tests core business rules like deadline enforcement and grading limits.
