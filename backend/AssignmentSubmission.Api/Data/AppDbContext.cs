using AssignmentSubmission.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmission.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<ClassCourse> ClassCourses { get; set; } = null!;
    public DbSet<Subject> Subjects { get; set; } = null!;
    public DbSet<TeacherSubjectAssignment> TeacherAssignments { get; set; } = null!;
    public DbSet<StudentEnrollment> Enrollments { get; set; } = null!;
    public DbSet<Assignment> Assignments { get; set; } = null!;
    public DbSet<Submission> Submissions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<TeacherSubjectAssignment>()
            .HasIndex(t => new { t.TeacherId, t.SubjectId, t.ClassCourseId })
            .IsUnique();

        modelBuilder.Entity<StudentEnrollment>()
            .HasIndex(e => new { e.StudentId, e.ClassCourseId })
            .IsUnique();

        modelBuilder.Entity<Submission>()
            .HasIndex(s => new { s.AssignmentId, s.StudentId })
            .IsUnique();
    }
}
