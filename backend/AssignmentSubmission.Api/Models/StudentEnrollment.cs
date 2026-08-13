namespace AssignmentSubmission.Api.Models;

public class StudentEnrollment
{
    public int Id { get; set; }
    
    public int StudentId { get; set; }
    public User Student { get; set; } = null!;
    
    public int ClassCourseId { get; set; }
    public ClassCourse ClassCourse { get; set; } = null!;
}
