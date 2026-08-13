namespace AssignmentSubmission.Api.DTOs;

public class CreateSubmissionDto
{
    public int AssignmentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
}

public class UpdateSubmissionDto
{
    public string Content { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
}

public class GradeSubmissionDto
{
    public int Marks { get; set; }
    public string Feedback { get; set; } = string.Empty;
}
