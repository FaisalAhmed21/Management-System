# Assumptions and Design Decisions

1. **Teacher-Subject-Class Assignments**
   - Teacher-subject-class assignments are managed via "Assign" (create) and "Remove" (delete) actions.
   - There is deliberately no "Edit" action for assignments. Changing any field (e.g., swapping a teacher for a different subject) effectively creates an entirely different conceptual assignment, so it is cleaner and less error-prone to delete the old assignment and create a new one.
