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
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Assignments.ToListAsync());
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var assignments = await _context.Assignments
            .Where(a => a.TeacherId == teacherId)
            .ToListAsync();
            
        return Ok(assignments);
    }

    [HttpGet("for-me")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetAssignmentsForMe()
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var classIds = await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .Select(e => e.ClassCourseId)
            .ToListAsync();

        var assignments = await _context.Assignments
            .Where(a => classIds.Contains(a.ClassCourseId) && a.Status == "Published")
            .ToListAsync();

        return Ok(assignments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound();

        var role = User.FindFirstValue(ClaimTypes.Role);
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (role == "Student" && assignment.Status != "Published")
        {
            return Forbid();
        }

        if (role == "Teacher" && assignment.TeacherId != userId)
        {
            // Only the owner teacher can view unless Admin
            return Forbid();
        }

        return Ok(assignment);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Verify teacher is assigned to this subject/class
        var isAssigned = await _context.TeacherAssignments
            .AnyAsync(t => t.TeacherId == teacherId && t.SubjectId == dto.SubjectId && t.ClassCourseId == dto.ClassCourseId);

        if (!isAssigned) return Forbid();

        var assignment = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            SubjectId = dto.SubjectId,
            ClassCourseId = dto.ClassCourseId,
            TeacherId = teacherId,
            Deadline = dto.Deadline,
            MaxMarks = dto.MaxMarks,
            Status = dto.Status,
            AllowLateSubmissions = dto.AllowLateSubmissions
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = assignment.Id }, assignment);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateAssignmentDto dto)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound();

        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (assignment.TeacherId != teacherId) return Forbid();

        if (assignment.Status == "Published" && dto.Status == "Draft")
        {
            return BadRequest(new { message = "Cannot change a published assignment back to draft." });
        }

        assignment.Title = dto.Title;
        assignment.Description = dto.Description;
        assignment.Deadline = dto.Deadline;
        assignment.MaxMarks = dto.MaxMarks;
        assignment.Status = dto.Status;
        assignment.AllowLateSubmissions = dto.AllowLateSubmissions;

        await _context.SaveChangesAsync();
        return Ok(assignment);
    }
}
