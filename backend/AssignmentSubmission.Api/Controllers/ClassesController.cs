using AssignmentSubmission.Api.Data;
using AssignmentSubmission.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmission.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class ClassesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClassesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous] // Allow anyone logged in to see classes (teachers/students)
    public async Task<IActionResult> GetClasses()
    {
        return Ok(await _context.ClassCourses.ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] ClassCourse classCourse)
    {
        _context.ClassCourses.Add(classCourse);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetClasses), new { id = classCourse.Id }, classCourse);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] ClassCourse classCourse)
    {
        if (id != classCourse.Id) return BadRequest();
        _context.Entry(classCourse).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var classCourse = await _context.ClassCourses.FindAsync(id);
        if (classCourse == null) return NotFound();
        _context.ClassCourses.Remove(classCourse);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
