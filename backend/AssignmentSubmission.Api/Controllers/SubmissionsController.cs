using System.Security.Claims;
using AssignmentSubmission.Api.Data;
using AssignmentSubmission.Api.DTOs;
using AssignmentSubmission.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmission.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubmissionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMySubmissions()
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var submissions = await _context.Submissions
            .Include(s => s.Assignment)
            .Where(s => s.StudentId == studentId)
            .ToListAsync();
            
        return Ok(submissions);
    }

    [HttpGet("for-teacher")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetSubmissionsForTeacher()
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var submissions = await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Where(s => s.Assignment.TeacherId == teacherId)
            .ToListAsync();
            
        return Ok(submissions);
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Submit([FromBody] CreateSubmissionDto dto)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
        if (assignment == null) return NotFound("Assignment not found");
        if (assignment.Status != "Published") return BadRequest("Assignment is not published yet.");

        var isEnrolled = await _context.Enrollments.AnyAsync(e => e.StudentId == studentId && e.ClassCourseId == assignment.ClassCourseId);
        if (!isEnrolled) return Forbid();

        var existingSubmission = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);
            
        if (existingSubmission != null) return BadRequest("Already submitted.");

        var isLate = DateTime.UtcNow > assignment.Deadline;
        if (isLate && !assignment.AllowLateSubmissions)
        {
            return BadRequest("Deadline has passed and late submissions are not allowed.");
        }

        var submission = new Submission
        {
            AssignmentId = dto.AssignmentId,
            StudentId = studentId,
            Content = dto.Content,
            FileUrl = dto.FileUrl,
            Status = isLate ? "Late" : "Submitted"
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMySubmissions), new { id = submission.Id }, submission);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> UpdateSubmission(int id, [FromBody] UpdateSubmissionDto dto)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var submission = await _context.Submissions.Include(s => s.Assignment).FirstOrDefaultAsync(s => s.Id == id);
        
        if (submission == null) return NotFound();
        if (submission.StudentId != studentId) return Forbid();
        
        if (DateTime.UtcNow > submission.Assignment.Deadline && !submission.Assignment.AllowLateSubmissions)
        {
            return BadRequest("Cannot update after deadline unless late submissions are allowed.");
        }

        submission.Content = dto.Content;
        submission.FileUrl = dto.FileUrl;
        submission.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(submission);
    }

    [HttpPut("{id}/grade")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Grade(int id, [FromBody] GradeSubmissionDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var submission = await _context.Submissions.Include(s => s.Assignment).FirstOrDefaultAsync(s => s.Id == id);
        
        if (submission == null) return NotFound();
        if (submission.Assignment.TeacherId != teacherId) return Forbid();

        if (dto.Marks < 0 || dto.Marks > submission.Assignment.MaxMarks)
        {
            return BadRequest($"Marks must be between 0 and {submission.Assignment.MaxMarks}");
        }

        submission.Marks = dto.Marks;
        submission.Feedback = dto.Feedback;
        submission.Status = "Graded";
        submission.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(submission);
    }
}
