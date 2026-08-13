using AssignmentSubmission.Api.Controllers;
using AssignmentSubmission.Api.Data;
using AssignmentSubmission.Api.DTOs;
using AssignmentSubmission.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace AssignmentSubmission.Tests;

public class SubmissionsControllerTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private SubmissionsController GetController(AppDbContext context, int userId, string role)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        }, "mock"));

        var controller = new SubmissionsController(context)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            }
        };
        return controller;
    }

    [Fact]
    public async Task Submit_AfterDeadline_WithoutLateAllowed_ReturnsBadRequest()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, Deadline = DateTime.UtcNow.AddDays(-1), AllowLateSubmissions = false, Status = "Published" };
        db.Assignments.Add(assignment);
        await db.SaveChangesAsync();

        var controller = GetController(db, 1, "Student");
        var result = await controller.Submit(new CreateSubmissionDto { AssignmentId = 1, Content = "Test" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Submit_AfterDeadline_WithLateAllowed_MarksStatusAsLate()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, Deadline = DateTime.UtcNow.AddDays(-1), AllowLateSubmissions = true, Status = "Published" };
        db.Assignments.Add(assignment);
        await db.SaveChangesAsync();

        var controller = GetController(db, 1, "Student");
        var result = await controller.Submit(new CreateSubmissionDto { AssignmentId = 1, Content = "Test" });

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var submission = Assert.IsType<Submission>(createdResult.Value);
        Assert.Equal("Late", submission.Status);
    }

    [Fact]
    public async Task Grade_WithMarksGreaterThanMax_ReturnsBadRequest()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, TeacherId = 2, MaxMarks = 100 };
        var submission = new Submission { Id = 1, AssignmentId = 1, StudentId = 1, Assignment = assignment };
        db.Assignments.Add(assignment);
        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        var controller = GetController(db, 2, "Teacher");
        var result = await controller.Grade(1, new GradeSubmissionDto { Marks = 150, Feedback = "Good" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Grade_WithNegativeMarks_ReturnsBadRequest()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, TeacherId = 2, MaxMarks = 100 };
        var submission = new Submission { Id = 1, AssignmentId = 1, StudentId = 1, Assignment = assignment };
        db.Assignments.Add(assignment);
        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        var controller = GetController(db, 2, "Teacher");
        var result = await controller.Grade(1, new GradeSubmissionDto { Marks = -10, Feedback = "Bad" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateSubmission_AfterDeadline_WithoutLateAllowed_ReturnsBadRequest()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, Deadline = DateTime.UtcNow.AddDays(-1), AllowLateSubmissions = false };
        var submission = new Submission { Id = 1, AssignmentId = 1, StudentId = 1, Assignment = assignment };
        db.Assignments.Add(assignment);
        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        var controller = GetController(db, 1, "Student");
        var result = await controller.UpdateSubmission(1, new UpdateSubmissionDto { Content = "Updated" });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateSubmission_AnotherStudentsSubmission_ReturnsForbid()
    {
        var db = GetInMemoryDbContext();
        var submission = new Submission { Id = 1, AssignmentId = 1, StudentId = 1, Assignment = new Assignment { Id = 1, Deadline = DateTime.UtcNow.AddDays(1) } };
        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        // Logged in as student 2 trying to update student 1's submission
        var controller = GetController(db, 2, "Student");
        var result = await controller.UpdateSubmission(1, new UpdateSubmissionDto { Content = "Hacked" });

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Grade_TeacherGradesAnotherTeachersAssignment_ReturnsForbid()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, TeacherId = 1, MaxMarks = 100 };
        var submission = new Submission { Id = 1, AssignmentId = 1, StudentId = 1, Assignment = assignment };
        db.Assignments.Add(assignment);
        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        // Logged in as teacher 2 trying to grade teacher 1's assignment
        var controller = GetController(db, 2, "Teacher");
        var result = await controller.Grade(1, new GradeSubmissionDto { Marks = 90 });

        Assert.IsType<ForbidResult>(result);
    }
}
