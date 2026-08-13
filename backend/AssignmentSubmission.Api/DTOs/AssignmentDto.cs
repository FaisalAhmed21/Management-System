namespace AssignmentSubmission.Api.DTOs;

public class CreateAssignmentDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SubjectId { get; set; }
    public int ClassCourseId { get; set; }
    public DateTime Deadline { get; set; }
    public int MaxMarks { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Published
    public bool AllowLateSubmissions { get; set; }
}

public class UpdateAssignmentStatusDto
{
    public string Status { get; set; } = string.Empty;
}
