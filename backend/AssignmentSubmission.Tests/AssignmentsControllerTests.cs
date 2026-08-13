using AssignmentSubmission.Api.Controllers;
using AssignmentSubmission.Api.Data;
using AssignmentSubmission.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace AssignmentSubmission.Tests;

public class AssignmentsControllerTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private AssignmentsController GetController(AppDbContext context, int userId, string role)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        }, "mock"));

        var controller = new AssignmentsController(context)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            }
        };
        return controller;
    }

    [Fact]
    public async Task GetById_StudentViewsDraftAssignment_ReturnsForbid()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, Status = "Draft" };
        db.Assignments.Add(assignment);
        await db.SaveChangesAsync();

        var controller = GetController(db, 1, "Student");
        var result = await controller.GetById(1);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetById_StudentViewsPublishedAssignment_ReturnsOk()
    {
        var db = GetInMemoryDbContext();
        var assignment = new Assignment { Id = 1, Status = "Published" };
        db.Assignments.Add(assignment);
        await db.SaveChangesAsync();

        var controller = GetController(db, 1, "Student");
        var result = await controller.GetById(1);

        Assert.IsType<OkObjectResult>(result);
    }
}
