# Security Specification & Payload-First TDD

## 1. Data Invariants
1. **Admin-Only Writes**: Only verified administrators (`request.auth.token.email_verified == true` and either bootstrapped email `julia.sggomes@gmail.com` or an existing `/admins/{uid}` document) may create, update, or delete `/projects/{projectId}`, `/projects/{projectId}/chunks/{chunkId}`, and `/siteContent/main`.
2. **Public Portfolio Readability (No PII)**: `/projects/{projectId}`, `/projects/{projectId}/chunks/{chunkId}`, and `/siteContent/{docId}` contain zero private PII and are readable by portfolio visitors only with valid IDs, bounded list limits, and schema checks. `/admins/{adminId}` contains PII (`email`) and is readable strictly by the owning admin or another verified admin.
3. **Strict Path & Payload Integrity**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (1–128 chars). Every string, map, array, and enum field has explicit `.size()` and allowlist checks.
4. **Master Gate & Atomicity**: Every `/projects/{projectId}/chunks/{chunkId}` write checks `getAfter(/databases/$(database)/documents/projects/$(projectId)).data.id == projectId` so chunks cannot be orphaned or attached to non-existent projects.
5. **Immutability & Server Time**: `ownerId` and `createdAt` are immutable after creation; `createdAt == request.time` on create and `updatedAt == request.time` on both create and update.

## 2. The "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Create**: Anonymous/unauthenticated user tries `create` on `/projects/proj-1` -> Denied.
2. **Unverified Admin Email Spoof**: User with `email: "julia.sggomes@gmail.com"` and `email_verified: false` tries `create` on `/projects/proj-1` -> Denied.
3. **Non-Admin Authenticated User Write**: Random verified Google user tries `create` or `update` on `/projects/proj-1` -> Denied.
4. **Self-Assigned Admin Escalation**: Non-admin user tries `create` on `/admins/{uid}` with `{ role: "admin" }` -> Denied.
5. **PII Blanket Read on `/admins`**: Non-admin user tries `get` or `list` on `/admins/{otherUid}` -> Denied.
6. **Ghost Field / Shadow Update**: Admin sends extra unexpected key `isFeatured: true` in `/projects/proj-1` -> Denied by `keys().hasOnly(...)` / `affectedKeys().hasOnly(...)`.
7. **OwnerId Spoofing**: Admin tries to create `/projects/proj-1` with `ownerId: "someone-else"` -> Denied (`ownerId == request.auth.uid`).
8. **Immutable Field Mutation**: Admin tries to update `createdAt` or `ownerId` on an existing project -> Denied.
9. **Client-Forged Timestamp**: Admin sends `updatedAt` != `request.time` -> Denied.
10. **ID Poisoning**: Write to `/projects/bad$id..slash` or >128 char ID -> Denied by `isValidId()`.
11. **Value Poisoning / Size Overflow**: Admin sends `cat: "invalid"`, `title` > 200 chars, or `cover` > 500,000 chars -> Denied.
12. **Orphaned Chunk Write**: Write to `/projects/nonexistent/chunks/0` without a parent project existing after batch -> Denied by `getAfter(...)`.
