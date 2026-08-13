using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmission.Api.Models;

public class Submission
{
    public int Id { get; set; }
    
    public int AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;
    
    public int StudentId { get; set; }
    public User Student { get; set; } = null!;
    
    public string Content { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    
    public string Status { get; set; } = "Submitted"; // Submitted, Late, UnderReview, Graded, ReturnedForResubmission
    
    public int? Marks { get; set; }
    public string Feedback { get; set; } = string.Empty;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
