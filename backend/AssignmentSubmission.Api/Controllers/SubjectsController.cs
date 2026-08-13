using AssignmentSubmission.Api.Data;
using AssignmentSubmission.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmission.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class SubjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubjectsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous] // Allow teachers/students to view subjects
    public async Task<IActionResult> GetSubjects()
    {
        return Ok(await _context.Subjects.ToListAsync());
    }

    public class SubjectDto
    {
        public string Name { get; set; } = string.Empty;
        public int ClassCourseId { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> CreateSubject([FromBody] SubjectDto dto)
    {
        var subject = new Subject { Name = dto.Name, ClassCourseId = dto.ClassCourseId };
        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSubjects), new { id = subject.Id }, subject);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubject(int id, [FromBody] SubjectDto dto)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null) return NotFound();
        
        subject.Name = dto.Name;
        subject.ClassCourseId = dto.ClassCourseId;
        _context.Entry(subject).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubject(int id)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null) return NotFound();
        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
