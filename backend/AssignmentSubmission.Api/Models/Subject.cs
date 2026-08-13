using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmission.Api.Models;

public class Subject
{
    public int Id { get; set; }
    
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public int ClassCourseId { get; set; }
    public ClassCourse ClassCourse { get; set; } = null!;
}
