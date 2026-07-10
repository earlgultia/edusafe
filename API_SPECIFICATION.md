# EduSafe API Specification

## 1. Overview

Base URL: `/api/v1`

Authentication: Bearer access token issued by the authentication service.

Authorization model:
- `admin`: full access to school operations, reports, audit, and device management.
- `teacher`: attendance, incident, announcement, visitor, and limited student access.
- `parent`: access to linked child data, announcements, clinic/incident history, and profile management.
- `guard`: pickup and visitor workflows only.
- `nurse`: clinic, incident, and student health-related operations.

Common response envelope:
- `200/201/204`: success
- `400`: invalid request
- `401`: unauthenticated
- `403`: forbidden
- `404`: not found
- `409`: conflict, such as duplicate attendance
- `422`: validation failure
- `503`: service unavailable or offline queue processing failure

Common pagination/query parameters:
- `page`, `limit`, `sort`, `filter`, `from`, `to`

---

## 2. Authentication Endpoints

### 2.1 Login
- Purpose: Authenticate a user and issue an access token.
- Method: `POST /auth/login`
- Request: `{ "email": "string", "password": "string", "role": "optional string" }`
- Response: `{ "accessToken": "string", "refreshToken": "string", "user": { ... } }`
- Permissions: Public.
- Validation: Email must be valid; password must be non-empty.
- Possible Errors: `401 invalid credentials`, `422 validation error`.
- Authentication: None.
- Authorization: None.
- Business Rules: Must return the role-specific dashboard profile and linked school context.

### 2.2 Refresh Token
- Purpose: Refresh an expired access token.
- Method: `POST /auth/refresh`
- Request: `{ "refreshToken": "string" }`
- Response: `{ "accessToken": "string" }`
- Permissions: Public.
- Validation: Refresh token required.
- Possible Errors: `401 invalid refresh token`.
- Authentication: None.
- Authorization: None.
- Business Rules: Refresh token must be bound to the same user and school.

### 2.3 Logout
- Purpose: Invalidate the current session.
- Method: `POST /auth/logout`
- Request: `{ "refreshToken": "optional string" }`
- Response: `{ "success": true }`
- Permissions: Authenticated users only.
- Validation: Token must be present.
- Possible Errors: `401 unauthorized`.
- Authentication: Required.
- Authorization: Any authenticated user.
- Business Rules: Session and device token should be invalidated server-side.

### 2.4 Current User Profile
- Purpose: Retrieve the current authenticated user and role context.
- Method: `GET /auth/me`
- Request: None.
- Response: `{ "user": { "id": "string", "name": "string", "email": "string", "role": "string", "schoolId": "string" } }`
- Permissions: Authenticated users only.
- Validation: None.
- Possible Errors: `401 unauthorized`.
- Authentication: Required.
- Authorization: Any authenticated user.
- Business Rules: Must return the effective role and school context for the current session.

---

## 3. School and Profile Endpoints

### 3.1 Get School Profile
- Purpose: Retrieve school setup details.
- Method: `GET /schools/me`
- Request: None.
- Response: `{ "school": { "id": "string", "name": "string", "type": "string", "year": "string", "contact": "string", "address": "string" } }`
- Permissions: `admin`, `teacher`, `parent`, `guard`, `nurse`.
- Validation: None.
- Possible Errors: `404 school not found`.
- Authentication: Required.
- Authorization: User must belong to the school.
- Business Rules: School profile must be scoped to the authenticated school.

### 3.2 Update School Profile
- Purpose: Update basic school information.
- Method: `PATCH /schools/me`
- Request: `{ "name": "optional string", "type": "optional string", "year": "optional string", "contact": "optional string", "address": "optional string" }`
- Response: `{ "school": { ... } }`
- Permissions: `admin` only.
- Validation: Name cannot be blank if provided.
- Possible Errors: `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Updates must be audited.

---

## 4. User and Role Endpoints

### 4.1 List Users
- Purpose: Retrieve users for administration and roster management.
- Method: `GET /users`
- Request: Query params optional: `role`, `schoolId`, `active`, `page`, `limit`.
- Response: `{ "users": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher` (limited view).
- Validation: Role must be one of the supported roles if provided.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Role-based access.
- Business Rules: Teachers can only see users relevant to their class/school scope.

### 4.2 Create User
- Purpose: Create a new staff or admin account.
- Method: `POST /users`
- Request: `{ "name": "string", "email": "string", "role": "string", "schoolId": "string", "grade": "optional string", "section": "optional string" }`
- Response: `{ "user": { ... } }`
- Permissions: `admin` only.
- Validation: Email must be unique and valid; role must be supported.
- Possible Errors: `409 duplicate email`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: New user creation must trigger audit logging.

### 4.3 Get User By ID
- Purpose: Retrieve a specific user profile.
- Method: `GET /users/{userId}`
- Request: None.
- Response: `{ "user": { ... } }`
- Permissions: `admin`, `teacher` (same school scope), `parent` (self only).
- Validation: `userId` must exist.
- Possible Errors: `404 not found`, `403 forbidden`.
- Authentication: Required.
- Authorization: Resource ownership or staff scope.
- Business Rules: Parents cannot view other parents or staff profiles.

### 4.4 Update User By ID
- Purpose: Modify user profile or role status.
- Method: `PATCH /users/{userId}`
- Request: `{ "name": "optional string", "email": "optional string", "role": "optional string", "active": "optional boolean" }`
- Response: `{ "user": { ... } }`
- Permissions: `admin` only or self for non-sensitive fields.
- Validation: Email must remain unique.
- Possible Errors: `403 forbidden`, `409 duplicate email`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` or self.
- Business Rules: Role changes must be audited.

---

## 5. Student Endpoints

### 5.1 List Students
- Purpose: Retrieve students for a school.
- Method: `GET /students`
- Request: Query params optional: `grade`, `section`, `status`, `page`, `limit`.
- Response: `{ "students": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent`, `nurse`.
- Validation: Filters must match allowed values.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Scope-limited by school and linked guardians.
- Business Rules: Parents can only see their linked children.

### 5.2 Create Student
- Purpose: Register a student profile.
- Method: `POST /students`
- Request: `{ "name": "string", "lrn": "optional string", "grade": "string", "section": "string", "teacherId": "optional string", "guardianIds": ["string"] }`
- Response: `{ "student": { ... } }`
- Permissions: `admin`, `teacher` (limited scope).
- Validation: Name is required; grade/section should be valid; LRN must be unique if supplied.
- Possible Errors: `409 duplicate LRN`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` or authorized teacher.
- Business Rules: Student creation must be audited.

### 5.3 Get Student By ID
- Purpose: Retrieve student record and linked relationships.
- Method: `GET /students/{studentId}`
- Request: None.
- Response: `{ "student": { ... }, "guardians": [ ... ], "attendanceSummary": { ... } }`
- Permissions: `admin`, `teacher`, `parent`, `nurse`.
- Validation: Student must exist.
- Possible Errors: `404 not found`, `403 forbidden`.
- Authentication: Required.
- Authorization: Scope-based.
- Business Rules: Parents can only access their linked child.

### 5.4 Update Student By ID
- Purpose: Edit student details or status.
- Method: `PATCH /students/{studentId}`
- Request: `{ "name": "optional string", "grade": "optional string", "section": "optional string", "status": "optional string" }`
- Response: `{ "student": { ... } }`
- Permissions: `admin`, `teacher` (limited scope).
- Validation: Required fields must remain valid.
- Possible Errors: `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized staff only.
- Business Rules: Changes must be logged to the audit trail.

### 5.5 Delete Student
- Purpose: Remove a student record from the school registry.
- Method: `DELETE /students/{studentId}`
- Request: None.
- Response: `{ "success": true }`
- Permissions: `admin` only.
- Validation: Student must exist.
- Possible Errors: `404 not found`, `403 forbidden`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Must also remove or reassign linked guardian references and attendance history.

---

## 6. Teacher Endpoints

### 6.1 List Teachers
- Purpose: Retrieve teacher records.
- Method: `GET /teachers`
- Request: Optional filters: `grade`, `section`, `active`.
- Response: `{ "teachers": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent` (limited role metadata).
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: School-scoped.
- Business Rules: Parent access limited to teacher display metadata.

### 6.2 Create Teacher
- Purpose: Create a teacher profile.
- Method: `POST /teachers`
- Request: `{ "name": "string", "email": "string", "grade": "optional string", "section": "optional string", "userId": "optional string" }`
- Response: `{ "teacher": { ... } }`
- Permissions: `admin` only.
- Validation: Name and email required; email must be unique.
- Possible Errors: `409 duplicate email`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Teacher creation must be audited.

### 6.3 Update Teacher
- Purpose: Update teacher roster details.
- Method: `PATCH /teachers/{teacherId}`
- Request: `{ "name": "optional string", "grade": "optional string", "section": "optional string", "active": "optional boolean" }`
- Response: `{ "teacher": { ... } }`
- Permissions: `admin` only.
- Validation: Any provided values must be valid.
- Possible Errors: `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Changes must be logged.

---

## 7. Guardian Endpoints

### 7.1 List Guardians
- Purpose: Retrieve guardians linked to school students.
- Method: `GET /guardians`
- Request: Optional filter: `studentId`, `verified`, `page`, `limit`.
- Response: `{ "guardians": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent` (linked only).
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Scope-based.
- Business Rules: Parents can see only guardians associated with their linked students.

### 7.2 Create Guardian
- Purpose: Register a guardian and link them to a student.
- Method: `POST /guardians`
- Request: `{ "name": "string", "email": "optional string", "phone": "optional string", "relation": "string", "studentId": "string", "verified": "boolean" }`
- Response: `{ "guardian": { ... } }`
- Permissions: `admin`, `teacher`.
- Validation: `studentId` required; if `email` provided it must be valid; `name` required.
- Possible Errors: `404 student not found`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized school staff.
- Business Rules: Guardian creation must create a QR/pass reference and be audited.

### 7.3 Update Guardian
- Purpose: Update guardian profile or verification state.
- Method: `PATCH /guardians/{guardianId}`
- Request: `{ "name": "optional string", "phone": "optional string", "relation": "optional string", "verified": "optional boolean" }`
- Response: `{ "guardian": { ... } }`
- Permissions: `admin`, `teacher`, `parent` (self only).
- Validation: At least one field must be provided.
- Possible Errors: `403 forbidden`, `404 not found`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized school staff or self.
- Business Rules: Verification changes must be audited.

### 7.4 Verify Guardian
- Purpose: Mark a guardian as verified for pickup and school access.
- Method: `POST /guardians/{guardianId}/verify`
- Request: `{ "verified": true }`
- Response: `{ "guardian": { ... } }`
- Permissions: `admin` only.
- Validation: Guardian must exist.
- Possible Errors: `403 forbidden`, `404 not found`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Verification event must be recorded in the audit log.

---

## 8. Attendance Endpoints

### 8.1 List Attendance Records
- Purpose: Retrieve attendance records for a date range or student.
- Method: `GET /attendance`
- Request: Query params: `studentId`, `date`, `status`, `page`, `limit`.
- Response: `{ "attendance": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent` (linked students only), `nurse`.
- Validation: Date must be valid; `status` must be one of allowed values.
- Possible Errors: `400 bad request`, `403 forbidden`.
- Authentication: Required.
- Authorization: Scope-based.
- Business Rules: Duplicate attendance entries for the same student/day are not allowed.

### 8.2 Create Attendance Record
- Purpose: Log a student attendance status.
- Method: `POST /attendance`
- Request: `{ "studentId": "string", "status": "Present|Absent|Late|Excused", "date": "optional string" }`
- Response: `{ "attendance": { ... } }`
- Permissions: `admin`, `teacher`, `nurse`.
- Validation: Student must exist; status must be supported; one record per student per day.
- Possible Errors: `409 duplicate attendance`, `404 student not found`, `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: Role-based.
- Business Rules: Attendance creation creates notifications for linked guardians when absent.

### 8.3 Update Attendance Record
- Purpose: Correct an entered attendance record.
- Method: `PATCH /attendance/{attendanceId}`
- Request: `{ "status": "Present|Absent|Late|Excused", "reason": "optional string" }`
- Response: `{ "attendance": { ... } }`
- Permissions: `admin`, `teacher`, `nurse`.
- Validation: Attendance record must exist; status must be supported.
- Possible Errors: `404 not found`, `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized staff only.
- Business Rules: Corrections must be audited.

---

## 9. Pickup and Release Endpoints

### 9.1 List Pickup Queue
- Purpose: View students waiting for pickup release.
- Method: `GET /pickups/queue`
- Request: None.
- Response: `{ "queue": [ ... ] }`
- Permissions: `admin`, `guard`.
- Validation: None.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Guard/admin access only.
- Business Rules: Queue entries must reflect the current release status.

### 9.2 Create Pickup Release
- Purpose: Approve a guardian pickup release.
- Method: `POST /pickups/release`
- Request: `{ "guardianId": "string", "studentId": "optional string" }`
- Response: `{ "pickup": { ... } }`
- Permissions: `admin`, `guard`.
- Validation: Guardian must be verified and linked to the student.
- Possible Errors: `403 forbidden`, `404 guardian not found`, `409 already released`, `422 validation error`.
- Authentication: Required.
- Authorization: Guard/admin access.
- Business Rules: Release must be audited and create a pickup log entry.

### 9.3 List Pickup History
- Purpose: Retrieve historical student pickup records.
- Method: `GET /pickups/history`
- Request: Query params optional: `studentId`, `date`, `page`, `limit`.
- Response: `{ "pickups": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent` (linked students only).
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Scope-based.
- Business Rules: History must reflect final release status and timestamps.

---

## 10. Visitor Endpoints

### 10.1 List Visitors
- Purpose: Retrieve current and historical visitor records.
- Method: `GET /visitors`
- Request: Query params optional: `status`, `date`, `page`, `limit`.
- Response: `{ "visitors": [ ... ], "count": 0 }`
- Permissions: `admin`, `guard`, `teacher`.
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Staff access.
- Business Rules: Current visitors should be marked `On campus` until checkout.

### 10.2 Create Visitor Record
- Purpose: Log a visitor arrival.
- Method: `POST /visitors`
- Request: `{ "name": "string", "purpose": "string", "contact": "optional string", "schoolId": "optional string" }`
- Response: `{ "visitor": { ... } }`
- Permissions: `admin`, `guard`, `teacher`.
- Validation: Name and purpose required.
- Possible Errors: `422 validation error`, `403 forbidden`.
- Authentication: Required.
- Authorization: Staff roles.
- Business Rules: Visitor creation must add an entry to notifications and audit.

### 10.3 Checkout Visitor
- Purpose: Mark a visitor as checked out.
- Method: `POST /visitors/{visitorId}/checkout`
- Request: None.
- Response: `{ "visitor": { ... } }`
- Permissions: `admin`, `guard`.
- Validation: Visitor must exist and be currently checked in.
- Possible Errors: `404 not found`, `409 already checked out`, `403 forbidden`.
- Authentication: Required.
- Authorization: Guard/admin access.
- Business Rules: Checkout must be audited and update the visitor status.

---

## 11. Incident Endpoints

### 11.1 List Incidents
- Purpose: Retrieve incident reports.
- Method: `GET /incidents`
- Request: Query params optional: `studentId`, `status`, `type`, `page`, `limit`.
- Response: `{ "incidents": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `nurse`, `parent` (linked student only).
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Scope-based.
- Business Rules: Parents can view only incidents relevant to their linked child.

### 11.2 Create Incident Report
- Purpose: Record a safety or conduct incident.
- Method: `POST /incidents`
- Request: `{ "studentId": "optional string", "student": "optional string", "type": "string", "description": "string", "severity": "optional string", "notifyAll": "boolean", "guardianIds": ["string"] }`
- Response: `{ "incident": { ... } }`
- Permissions: `admin`, `teacher`, `nurse`.
- Validation: Type and description required; student can be identified by ID or name.
- Possible Errors: `403 forbidden`, `404 student not found`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized staff roles.
- Business Rules: Incident creation must notify linked guardians and create an audit entry.

### 11.3 Update Incident Status
- Purpose: Change the incident state.
- Method: `PATCH /incidents/{incidentId}`
- Request: `{ "status": "Submitted|Investigating|Resolved|Closed", "notes": "optional string" }`
- Response: `{ "incident": { ... } }`
- Permissions: `admin`, `teacher`, `nurse`.
- Validation: Status must be supported.
- Possible Errors: `404 not found`, `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized staff roles.
- Business Rules: Status transitions must be audited.

---

## 12. Clinic Endpoints

### 12.1 List Clinic Visits
- Purpose: Retrieve clinic visit records.
- Method: `GET /clinic-visits`
- Request: Query params optional: `studentId`, `date`, `reason`, `page`, `limit`.
- Response: `{ "clinicVisits": [ ... ], "count": 0 }`
- Permissions: `admin`, `nurse`, `parent` (linked students only).
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Scope-based.
- Business Rules: Parents can view only their linked child records.

### 12.2 Create Clinic Visit
- Purpose: Record a clinic visit.
- Method: `POST /clinic-visits`
- Request: `{ "studentId": "optional string", "student": "optional string", "reason": "string", "temp": "optional string", "notes": "optional string", "disposition": "optional string" }`
- Response: `{ "clinicVisit": { ... } }`
- Permissions: `admin`, `nurse`.
- Validation: Reason required; student may be specified by ID or name.
- Possible Errors: `403 forbidden`, `404 student not found`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized medical/staff roles.
- Business Rules: Clinic visit creation must be audited.

### 12.3 Update Clinic Visit
- Purpose: Update a clinic visit disposition.
- Method: `PATCH /clinic-visits/{visitId}`
- Request: `{ "disposition": "optional string", "notes": "optional string", "reason": "optional string" }`
- Response: `{ "clinicVisit": { ... } }`
- Permissions: `admin`, `nurse`.
- Validation: Visit must exist.
- Possible Errors: `404 not found`, `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: Authorized medical/staff roles.
- Business Rules: Any change to disposition must be logged.

---

## 13. Announcement and Event Endpoints

### 13.1 List Announcements
- Purpose: Retrieve current school announcements.
- Method: `GET /announcements`
- Request: Query params optional: `audience`, `page`, `limit`.
- Response: `{ "announcements": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent`, `guard`, `nurse`.
- Validation: Audience must be supported.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Role and audience-based.
- Business Rules: Parents should only receive announcements relevant to their role and linked students.

### 13.2 Create Announcement
- Purpose: Publish a school notice.
- Method: `POST /announcements`
- Request: `{ "title": "string", "body": "string", "audience": "All|Parent|Teacher|Guard|Admin", "priority": "Normal|High|Critical", "studentId": "optional string" }`
- Response: `{ "announcement": { ... } }`
- Permissions: `admin` only.
- Validation: Title and body required; audience must be supported.
- Possible Errors: `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Announcement creation must be audited and dispatched to the target audience.

### 13.3 List Events
- Purpose: Retrieve calendar and school events.
- Method: `GET /events`
- Request: Query params optional: `from`, `to`, `page`, `limit`.
- Response: `{ "events": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent`, `guard`, `nurse`.
- Validation: Dates must be valid if supplied.
- Possible Errors: `400 bad request`.
- Authentication: Required.
- Authorization: School-scoped.
- Business Rules: Events should be visible to the school community.

### 13.4 Create Event
- Purpose: Add a school event or schedule item.
- Method: `POST /events`
- Request: `{ "title": "string", "date": "string", "time": "optional string", "description": "optional string" }`
- Response: `{ "event": { ... } }`
- Permissions: `admin` only.
- Validation: Title and date required.
- Possible Errors: `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Event creation must be audited.

---

## 14. Emergency Endpoints

### 14.1 List Emergency Alerts
- Purpose: Retrieve active and historical emergency alerts.
- Method: `GET /emergencies`
- Request: Query params optional: `active`, `page`, `limit`.
- Response: `{ "emergencies": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `guard`, `nurse`, `parent`.
- Validation: None.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: Role-based.
- Business Rules: Parents and staff should see alerts relevant to their school.

### 14.2 Trigger Emergency Alert
- Purpose: Broadcast a critical emergency notice.
- Method: `POST /emergencies`
- Request: `{ "type": "string", "message": "string" }`
- Response: `{ "emergency": { ... } }`
- Permissions: `admin` only.
- Validation: Type and message required.
- Possible Errors: `403 forbidden`, `422 validation error`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Must create announcements, push payloads, and audit entries.

### 14.3 Acknowledge Emergency Alert
- Purpose: Record that a user has acknowledged an emergency notice.
- Method: `POST /emergencies/{emergencyId}/acknowledge`
- Request: `{ "user": "string" }`
- Response: `{ "acknowledgement": { ... } }`
- Permissions: Authenticated users.
- Validation: Emergency must exist.
- Possible Errors: `404 not found`, `403 forbidden`.
- Authentication: Required.
- Authorization: Any authenticated user.
- Business Rules: Must be recorded for compliance and accountability.

---

## 15. Lost and Found Endpoints

### 15.1 List Lost and Found Items
- Purpose: Retrieve found or claimed items.
- Method: `GET /lost-found`
- Request: Query params optional: `status`, `page`, `limit`.
- Response: `{ "items": [ ... ], "count": 0 }`
- Permissions: `admin`, `teacher`, `parent`.
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: School-scoped.
- Business Rules: Items should be visible to the school community.

### 15.2 Create Lost and Found Item
- Purpose: Record a found item.
- Method: `POST /lost-found`
- Request: `{ "item": "string", "description": "optional string", "location": "string", "date": "string", "photo": "optional string" }`
- Response: `{ "item": { ... } }`
- Permissions: `admin`, `teacher`, `guard`.
- Validation: Item and location required.
- Possible Errors: `422 validation error`, `403 forbidden`.
- Authentication: Required.
- Authorization: Staff roles.
- Business Rules: New item creation must be auditable.

### 15.3 Claim Lost Item
- Purpose: Register a claim for a found item.
- Method: `POST /lost-found/{itemId}/claim`
- Request: `{ "claimant": "string", "contact": "string" }`
- Response: `{ "item": { ... } }`
- Permissions: `admin`, `teacher`, `parent`.
- Validation: Item must exist and not already be claimed.
- Possible Errors: `404 not found`, `409 already claimed`, `422 validation error`.
- Authentication: Required.
- Authorization: Authenticated users.
- Business Rules: Claim updates must be logged and visible in the item record.

### 15.4 Mark Item Returned
- Purpose: Mark a lost item as returned.
- Method: `POST /lost-found/{itemId}/return`
- Request: `{ "returnedBy": "string" }`
- Response: `{ "item": { ... } }`
- Permissions: `admin`, `teacher`, `guard`.
- Validation: Item must exist.
- Possible Errors: `404 not found`, `403 forbidden`.
- Authentication: Required.
- Authorization: Staff roles.
- Business Rules: Return status must be auditable.

---

## 16. Notification Endpoints

### 16.1 List Notifications
- Purpose: Retrieve recent notifications for the authenticated user.
- Method: `GET /notifications`
- Request: Query params optional: `unreadOnly`, `page`, `limit`.
- Response: `{ "notifications": [ ... ], "count": 0 }`
- Permissions: Authenticated users only.
- Validation: None.
- Possible Errors: `401 unauthorized`.
- Authentication: Required.
- Authorization: User-specific scope.
- Business Rules: Notifications must be filtered to the current user or linked roles.

### 16.2 Mark Notification as Read
- Purpose: Update a notification state.
- Method: `PATCH /notifications/{notificationId}/read`
- Request: None.
- Response: `{ "notification": { ... } }`
- Permissions: Authenticated users only.
- Validation: Notification must exist and belong to the current user.
- Possible Errors: `404 not found`, `403 forbidden`.
- Authentication: Required.
- Authorization: Self-only.
- Business Rules: Read state must be persisted.

---

## 17. Device and Push Endpoints

### 17.1 List Registered Devices
- Purpose: Retrieve push notification device registrations for the school.
- Method: `GET /devices`
- Request: None.
- Response: `{ "devices": [ ... ] }`
- Permissions: `admin` only.
- Validation: None.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Device registrations must be scoped to the school.

### 17.2 Register Device
- Purpose: Register a device for push notifications.
- Method: `POST /devices`
- Request: `{ "token": "string", "role": "string", "email": "optional string" }`
- Response: `{ "device": { ... } }`
- Permissions: Authenticated users.
- Validation: Token required.
- Possible Errors: `422 validation error`, `401 unauthorized`.
- Authentication: Required.
- Authorization: Authenticated user.
- Business Rules: Duplicate tokens should be deduplicated.

### 17.3 Remove Device
- Purpose: Remove a push notification device registration.
- Method: `DELETE /devices/{token}`
- Request: None.
- Response: `{ "success": true }`
- Permissions: `admin` or self.
- Validation: Token must exist.
- Possible Errors: `404 not found`, `403 forbidden`.
- Authentication: Required.
- Authorization: Admin or owner.
- Business Rules: Removal must be audited.

---

## 18. Audit and Offline Queue Endpoints

### 18.1 List Audit Log
- Purpose: Retrieve system audit events.
- Method: `GET /audit-log`
- Request: Query params optional: `action`, `from`, `to`, `page`, `limit`.
- Response: `{ "entries": [ ... ], "count": 0 }`
- Permissions: `admin` only.
- Validation: Filters must be valid.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Audit entries must be immutable and school-scoped.

### 18.2 List Offline Queue
- Purpose: View operations that could not be completed online and are queued for later processing.
- Method: `GET /offline-queue`
- Request: Query params optional: `status`, `page`, `limit`.
- Response: `{ "queue": [ ... ], "count": 0 }`
- Permissions: `admin` only.
- Validation: None.
- Possible Errors: `403 forbidden`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Queue entries should preserve the action payload and context for replay.

### 18.3 Retry Offline Queue Item
- Purpose: Replay a queued action after connectivity is restored.
- Method: `POST /offline-queue/{queueId}/retry`
- Request: None.
- Response: `{ "queueItem": { ... } }`
- Permissions: `admin` only.
- Validation: Queue item must exist.
- Possible Errors: `404 not found`, `403 forbidden`, `503 retry failed`.
- Authentication: Required.
- Authorization: `admin` only.
- Business Rules: Retry should preserve idempotency and audit the replay attempt.

---

## 19. Non-Functional Requirements for the API

- All protected endpoints must enforce role-based access and school scoping.
- Sensitive workflow endpoints must emit audit entries.
- Offline-capable endpoints must support queueing and replay semantics.
- Responses should be consistent and include machine-readable error details.
- All write operations should be idempotent where practical and safe to retry.
- All timestamps should use ISO 8601 format.
- All payloads should sanitize PII and avoid exposing data outside the relevant role scope.
