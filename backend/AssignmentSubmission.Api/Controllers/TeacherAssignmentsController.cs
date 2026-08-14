using AssignmentSubmission.Api.Data;
using AssignmentSubmission.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentSubmission.Api.Controllers;

[Route("api/teacher-assignments")]
[ApiController]
[Authorize]
public class TeacherAssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TeacherAssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAssignments()
    {
        return Ok(await _context.TeacherAssignments.ToListAsync());
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetMyAssignments()
    {
        var teacherId = int.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);
        var assignments = await _context.TeacherAssignments
            .Where(t => t.TeacherId == teacherId)
            .ToListAsync();
        return Ok(assignments);
    }

    public class TeacherAssignmentDto
    {
        public int TeacherId { get; set; }
        public int SubjectId { get; set; }
        public int ClassCourseId { get; set; }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAssignment([FromBody] TeacherAssignmentDto dto)
    {
        var assignment = new TeacherSubjectAssignment { TeacherId = dto.TeacherId, SubjectId = dto.SubjectId, ClassCourseId = dto.ClassCourseId };
        _context.TeacherAssignments.Add(assignment);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAssignments), new { id = assignment.Id }, assignment);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var assignment = await _context.TeacherAssignments.FindAsync(id);
        if (assignment == null) return NotFound();
        _context.TeacherAssignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
