FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["AssignmentSubmission.Api/AssignmentSubmission.Api.csproj", "AssignmentSubmission.Api/"]
RUN dotnet restore "AssignmentSubmission.Api/AssignmentSubmission.Api.csproj"

# Copy full source code and build
COPY . .
WORKDIR "/src/AssignmentSubmission.Api"
RUN dotnet build "AssignmentSubmission.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "AssignmentSubmission.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port 8080 since .NET 8 defaults to 8080 in the container
EXPOSE 8080

ENTRYPOINT ["dotnet", "AssignmentSubmission.Api.dll"]
