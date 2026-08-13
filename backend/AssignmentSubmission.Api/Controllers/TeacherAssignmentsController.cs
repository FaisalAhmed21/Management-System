using AssignmentSubmission.Api.Data;
using AssignmentSubmission.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmission.Api.Controllers;

[Route("api/teacher-assignments")]
[ApiController]
[Authorize(Roles = "Admin")]
public class TeacherAssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TeacherAssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAssignments()
    {
        return Ok(await _context.TeacherAssignments.ToListAsync());
    }

    public class TeacherAssignmentDto
    {
        public int TeacherId { get; set; }
        public int SubjectId { get; set; }
        public int ClassCourseId { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> CreateAssignment([FromBody] TeacherAssignmentDto dto)
    {
        var assignment = new TeacherSubjectAssignment { TeacherId = dto.TeacherId, SubjectId = dto.SubjectId, ClassCourseId = dto.ClassCourseId };
        _context.TeacherAssignments.Add(assignment);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAssignments), new { id = assignment.Id }, assignment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var assignment = await _context.TeacherAssignments.FindAsync(id);
        if (assignment == null) return NotFound();
        _context.TeacherAssignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
