using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AssignmentSubmission.Api.Models;

public class User
{
    public int Id { get; set; }
    
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required, EmailAddress, MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [Required, JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required, MaxLength(20)]
    public string Role { get; set; } = string.Empty; // Admin, Teacher, Student
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
