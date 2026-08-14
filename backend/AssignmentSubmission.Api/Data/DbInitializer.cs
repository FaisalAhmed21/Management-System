using AssignmentSubmission.Api.Models;

namespace AssignmentSubmission.Api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        // Ensure database is created (or apply migrations in production)
        context.Database.EnsureCreated();

        if (context.Users.Any())
        {
            return; // DB has been seeded
        }

        var admin = new User { Name = "Admin User", Email = "admin@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), Role = "Admin" };
        var teacher1 = new User { Name = "Teacher One", Email = "teacher1@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), Role = "Teacher" };
        var teacher2 = new User { Name = "Teacher Two", Email = "teacher2@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), Role = "Teacher" };
        var student1 = new User { Name = "Student One", Email = "student1@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), Role = "Student" };
        var student2 = new User { Name = "Student Two", Email = "student2@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), Role = "Student" };
        var student3 = new User { Name = "Student Three", Email = "student3@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), Role = "Student" };

        context.Users.AddRange(admin, teacher1, teacher2, student1, student2, student3);
        context.SaveChanges();

        var class10A = new ClassCourse { Name = "Class 10 - Section A" };
        var class10B = new ClassCourse { Name = "Class 10 - Section B" };
        context.ClassCourses.AddRange(class10A, class10B);
        context.SaveChanges();

        var mathSubject = new Subject { Name = "Mathematics", ClassCourseId = class10A.Id };
        var scienceSubject = new Subject { Name = "Science", ClassCourseId = class10A.Id };
        context.Subjects.AddRange(mathSubject, scienceSubject);
        context.SaveChanges();

        var assignment1 = new TeacherSubjectAssignment { TeacherId = teacher1.Id, SubjectId = mathSubject.Id, ClassCourseId = class10A.Id };
        context.TeacherAssignments.Add(assignment1);
        context.SaveChanges();

        var enrollment1 = new StudentEnrollment { StudentId = student1.Id, ClassCourseId = class10A.Id };
        var enrollment2 = new StudentEnrollment { StudentId = student2.Id, ClassCourseId = class10A.Id };
        context.Enrollments.AddRange(enrollment1, enrollment2);
        context.SaveChanges();

        // 1. Published assignment with normal future deadline
        var hw1 = new Assignment
        {
            Title = "Math Homework 1 - Algebra",
            Description = "Please solve equations 1-10.",
            SubjectId = mathSubject.Id,
            ClassCourseId = class10A.Id,
            TeacherId = teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            Status = "Published",
            AllowLateSubmissions = false,
            CreatedAt = DateTime.UtcNow
        };

        // 2. Published assignment with past deadline AND AllowLateSubmissions = true
        var hw2 = new Assignment
        {
            Title = "Math Homework 2 - Geometry",
            Description = "Draw the shapes.",
            SubjectId = mathSubject.Id,
            ClassCourseId = class10A.Id,
            TeacherId = teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(-2), // Past deadline
            MaxMarks = 50,
            Status = "Published",
            AllowLateSubmissions = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        context.Assignments.AddRange(hw1, hw2);
        context.SaveChanges();

        // 3. Graded student submission
        var submission1 = new Submission
        {
            AssignmentId = hw1.Id,
            StudentId = student1.Id,
            Content = "Here are my answers: x=5, y=10.",
            Status = "Graded",
            Marks = 95,
            Feedback = "Excellent work!",
            SubmittedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow
        };

        context.Submissions.Add(submission1);
        context.SaveChanges();
    }
}
