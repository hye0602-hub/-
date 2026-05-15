# Security Spec

## Data Invariants
- A Mission must belong to a user (`userId == request.auth.uid`)
- A Mission must securely track creation times (`createdAt == request.time`)
- Users can only read, create, update, and delete their own missions.

## The Dirty Dozen Payloads
1. Unauthorized read attempt
2. Unauthorized write attempt
3. Read someone else's mission
4. Create mission for another user
5. Create mission with missing fields
6. Create mission with extra ghost fields
7. Create mission with invalid ID
8. Create mission with tampered `createdAt`
9. Update `userId` of an existing mission
10. Update `createdAt` of an existing mission
11. Delete someone else's mission
12. List missions without `userId` where clause constraint
