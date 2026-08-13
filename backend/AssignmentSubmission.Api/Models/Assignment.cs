using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmission.Api.Models;

public class Assignment
{
    public int Id { get; set; }
    
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    
    public int ClassCourseId { get; set; }
    public ClassCourse ClassCourse { get; set; } = null!;
    
    public int TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    
    public DateTime Deadline { get; set; }
    
    public int MaxMarks { get; set; }
    
    public string Status { get; set; } = "Draft"; // Draft, Published
    
    public bool AllowLateSubmissions { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
