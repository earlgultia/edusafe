# EduSafe UI Specification

## 1. Design Principles

The UI should feel like a trusted school safety and communication platform for administrators, teachers, parents, guards, and nurses. The experience should prioritize clarity, fast action, and accountability.

Core design rules:
- Mobile-first layout with large tap targets.
- High-contrast status indicators for safety events, attendance, pickup, and emergency alerts.
- Consistent header, section spacing, action buttons, and cards.
- Every critical action must show a confirmation, validation, or success message.
- Empty states must guide users toward the next step.
- Sensitive workflows must expose audit and queue status where relevant.

---

## 2. Global Shell

### 2.1 App Shell
Purpose:
- Provide the shared navigation and role-aware experience for all users.

UI Components:
- Top app bar with school name, role badge, notification bell, and user menu.
- Bottom navigation bar for mobile roles with Home, Calendar, Messages, People, Profile, and Safety shortcuts.
- Main content area with role-specific panels.
- Toast container for success and error feedback.
- Global loading overlay for async actions.

Buttons:
- Back, Menu, Logout, Add, Save, Submit, Cancel, Refresh, View Details.

Forms:
- Minimal profile/preferences form in the user menu.

Validation:
- Session expiry and network offline indicators.

Navigation:
- Role-aware navigation items.

Dialogs:
- Logout confirmation modal.
- Offline queue replay confirmation.

Error Messages:
- Session expired, network unavailable, action failed.

Success Messages:
- Saved profile, submitted form, queued action.

Loading States:
- Skeleton cards for dashboard sections.

Empty States:
- No notifications, no records, no linked students.

User Flow:
- User opens the app, authenticates, lands on role dashboard, then navigates to task-specific screens.

Responsive Design:
- Mobile-first stacked layout; desktop expands into multi-column dashboards.

---

## 3. Authentication Screens

### 3.1 Login Screen
Purpose:
- Authenticate a user and direct them to the correct dashboard.

UI Components:
- School logo/header.
- Email and password fields.
- Role selection dropdown.
- Sign in button.
- Forgot password link.

Buttons:
- Sign In, Forgot Password.

Forms:
- Login form with email, password, and optional role.

Validation:
- Email format validation.
- Required password.
- Disabled submit when fields are incomplete.

Navigation:
- On success, route to role dashboard.

Dialogs:
- None.

Error Messages:
- Invalid credentials, account disabled, network issue.

Success Messages:
- Welcome toast after successful login.

Loading States:
- Spinner on sign in button.

Empty States:
- None.

User Flow:
- User enters credentials, taps Sign In, app validates, then redirects to the role homepage.

Responsive Design:
- Centered card on mobile, two-column on larger screens.

### 3.2 Forgot Password Screen
Purpose:
- Recover access for a locked or forgotten account.

UI Components:
- Email field and submit button.
- Helpful instructions text.

Buttons:
- Send Reset Link, Back to Login.

Forms:
- Recovery email form.

Validation:
- Valid email required.

Navigation:
- Return to login after successful request.

Dialogs:
- Confirmation modal that the reset link was sent.

Error Messages:
- Email not found, service failure.

Success Messages:
- Reset link sent confirmation.

Loading States:
- Button spinner.

Empty States:
- None.

User Flow:
- User submits email, receives confirmation, returns to login.

Responsive Design:
- Single-column card layout.

---

## 4. Role Dashboard Screens

### 4.1 Admin Dashboard
Purpose:
- Give administrators a high-level operational view of school safety, attendance, incidents, visitors, and communications.

UI Components:
- Summary cards for students, present/absent today, visitors on campus, pending forms, pickup queue, active teachers, clinic visits, audit trail, and offline queue.
- Quick action buttons for notice, event, student, teacher, guardian, visitor, incident, and emergency.
- Recent notifications and activity feed.
- Device registration panel.
- School profile snapshot.

Buttons:
- Publish Notice, Add Event, Add Student, Add Teacher, Add Guardian, New Visitor, Report Incident, Trigger Emergency, Refresh Devices, Export, Remove Selected.

Forms:
- Quick announcement composer.
- Report export helper.

Validation:
- Announcement title/body required before send.
- Emergency type/message required.

Navigation:
- Dashboard tabs for Overview, People, Reports, Profile.

Dialogs:
- Confirmation before removing devices or deleting records.
- Preview modal for generated reports.

Error Messages:
- Missing fields, failed export, failed device refresh.

Success Messages:
- Notice published, event added, report generated, devices refreshed.

Loading States:
- Spinner while loading devices or reports.

Empty States:
- No notifications yet, no devices registered, no audit entries available.

User Flow:
- Admin scans the dashboard, opens a quick action, completes a flow, then returns to the dashboard.

Responsive Design:
- Cards wrap into a grid; action buttons stack on mobile.

### 4.2 Teacher Dashboard
Purpose:
- Support classroom and safety workflows for teachers.

UI Components:
- Today’s attendance summary card.
- Student roster list with attendance status chips.
- Incident and clinic shortcuts.
- Upcoming class events and announcements.
- Quick communication action.

Buttons:
- Mark Present, Mark Absent, Mark Late, Mark Excused, Report Incident, Add Clinic Note, Send Message.

Forms:
- Attendance entry form.
- Incident report form.
- Announcement quick compose.

Validation:
- Attendance cannot be submitted twice for the same student on the same day.
- Incident description and type required.

Navigation:
- Home, Attendance, Students, Reports, Messages.

Dialogs:
- Confirmation when changing attendance after submission.

Error Messages:
- Duplicate attendance warning, permission denied, save failed.

Success Messages:
- Attendance marked, incident submitted, clinic note saved.

Loading States:
- Attendance save spinner.

Empty States:
- No students assigned yet, no incident reports.

User Flow:
- Teacher selects a student, records attendance, optionally creates an incident or clinic note, then views the update.

Responsive Design:
- Student list becomes a scrollable panel on small screens.

### 4.3 Parent Dashboard
Purpose:
- Give parents a secure, child-focused summary of attendance, pickup, clinic, incidents, messages, and alerts.

UI Components:
- Child selector.
- Summary cards for attendance, pickup history, clinic visits, incident reports, digital forms, audit trail, and offline queue.
- Family messages and emergency alerts section.
- Trusted adults panel.
- Lost and found section.

Buttons:
- Add Trusted Adult, Open Messages, View Calendar, Submit Claim, Edit Profile.

Forms:
- Guardian form.
- Profile edit form.
- Lost item claim form.

Validation:
- Guardian name and student link required.
- Claim contact required if claim is submitted.

Navigation:
- Home, Calendar, Messages, Lost & Found, People, Profile tabs.

Dialogs:
- Claim item modal, profile edit sheet.

Error Messages:
- No linked student, action blocked, claim failed.

Success Messages:
- Guardian added, claim submitted, profile saved.

Loading States:
- Spinner when loading child data or messages.

Empty States:
- No attendance data yet, no notices, no trusted adults registered.

User Flow:
- Parent selects a child, views the overview, submits forms, and manages linked relationships.

Responsive Design:
- Cards reorder vertically on mobile; child selector becomes a prominent top control.

### 4.4 Guard Dashboard
Purpose:
- Support visitor management, pickup release, and entry monitoring.

UI Components:
- Visitor check-in list.
- Pickup queue board.
- Emergency alert shortcuts.
- Quick action buttons for check-in and checkout.

Buttons:
- Check In Visitor, Check Out Visitor, Release Student, View Queue, Trigger Emergency.

Forms:
- Visitor registration form.
- Pickup release confirmation form.

Validation:
- Visitor name and purpose required.
- Release requires a verified guardian.

Navigation:
- Queue, Visitors, Alerts, Profile.

Dialogs:
- Confirmation dialog for student release and visitor checkout.

Error Messages:
- Guardian not verified, visitor already checked out, permission denied.

Success Messages:
- Visitor checked in/out, student released, alert sent.

Loading States:
- Queue refresh spinner.

Empty States:
- No visitors on campus, no pickup requests.

User Flow:
- Guard processes arrival and departure events and release requests from the queue.

Responsive Design:
- Large touch-friendly action tiles for quick use.

### 4.5 Nurse Dashboard
Purpose:
- Support clinic visits, student health tracking, and incident review.

UI Components:
- Clinic visit list.
- Student health summary cards.
- Incident overview panel.
- Quick add clinic note action.

Buttons:
- Add Clinic Visit, Update Disposition, View Incident, Save Note.

Forms:
- Clinic form.
- Incident follow-up form.

Validation:
- Reason and student required.
- Disposition optional but recommended.

Navigation:
- Overview, Clinic, Incidents, Profile.

Dialogs:
- Confirmation for updating a completed visit.

Error Messages:
- Missing student, invalid temperature or note, save failed.

Success Messages:
- Clinic visit recorded, incident updated.

Loading States:
- Saving clinic note spinner.

Empty States:
- No clinic visits for the day.

User Flow:
- Nurse records a student visit, updates disposition, and reviews incidents.

Responsive Design:
- Stack clinic actions vertically on small screens.

---

## 5. Student Management Screens

### 5.1 Student List Screen
Purpose:
- View and manage the school student roster.

UI Components:
- Search bar.
- Filter chips for grade and section.
- Student cards with name, grade, section, status, and teacher.
- Add Student button.

Buttons:
- Add Student, Filter, View Details, Edit.

Forms:
- Search/filter form.

Validation:
- Search input trimmed.

Navigation:
- Back to dashboard, open student detail.

Dialogs:
- Confirmation before deletion.

Error Messages:
- No matching students.

Success Messages:
- Student created or updated.

Loading States:
- Skeleton list while loading.

Empty States:
- No students found.

User Flow:
- User searches, selects a student, then opens details or edits.

Responsive Design:
- Cards become a list on mobile.

### 5.2 Student Detail Screen
Purpose:
- Display attendance, guardian links, incidents, and clinic history for one student.

UI Components:
- Student profile header.
- Attendance summary chart.
- Guardian list.
- Incident and clinic timeline.
- Edit and Add Guardian buttons.

Buttons:
- Edit Student, Add Guardian, View Attendance, Add Incident.

Forms:
- Student edit form.

Validation:
- Required fields before save.

Navigation:
- Back to student list.

Dialogs:
- Link guardian confirmation.

Error Messages:
- Student not found, save failed.

Success Messages:
- Student updated, guardian linked.

Loading States:
- Content skeleton.

Empty States:
- No guardian links, no attendance records.

User Flow:
- User opens a student, views history, then edits or links records.

Responsive Design:
- Tabs for sections on larger screens; stacked cards on mobile.

---

## 6. Attendance Screens

### 6.1 Attendance Entry Screen
Purpose:
- Record or review student attendance.

UI Components:
- Date header.
- Student list with status chips.
- Bulk action toolbar.
- Summary count cards.

Buttons:
- Mark Present, Mark Absent, Mark Late, Mark Excused, Save All.

Forms:
- Attendance entry form.

Validation:
- One entry per student per day.
- A status must be selected before save.

Navigation:
- Back to dashboard or roster.

Dialogs:
- Duplicate attendance warning.

Error Messages:
- Duplicate error, save failure.

Success Messages:
- Attendance saved.

Loading States:
- Inline spinner after each save.

Empty States:
- No students to mark yet.

User Flow:
- Teacher selects student, chooses status, saves, and sees confirmation.

Responsive Design:
- Large touch targets and simple vertical list.

---

## 7. Guardian and Family Screens

### 7.1 Guardian Management Screen
Purpose:
- Add or edit a guardian and link to a child.

UI Components:
- Guardian form.
- Student selector.
- Verification status badge.

Buttons:
- Save Guardian, Verify Guardian, Cancel.

Forms:
- Guardian creation/edit form.

Validation:
- Name and student selection required.
- Phone/email optional but validated if present.

Navigation:
- Return to student details or parent dashboard.

Dialogs:
- Verification confirmation.

Error Messages:
- Missing student, invalid contact details.

Success Messages:
- Guardian saved or verified.

Loading States:
- Save button spinner.

Empty States:
- No guardians linked yet.

User Flow:
- School staff adds a guardian and links them to a student.

Responsive Design:
- Form fields stack on mobile.

### 7.2 Parent Profile Screen
Purpose:
- Let parents manage their account details and linked children.

UI Components:
- Profile summary card.
- Editable name and email fields.
- Linked student list.

Buttons:
- Edit Profile, Save Profile.

Forms:
- Profile edit form.

Validation:
- Email format required if provided.

Navigation:
- Back to dashboard.

Dialogs:
- None.

Error Messages:
- Invalid email.

Success Messages:
- Profile updated.

Loading States:
- Save spinner.

Empty States:
- No linked students.

User Flow:
- Parent updates profile details and reviews linked children.

Responsive Design:
- Simple stacked form.

---

## 8. Incident and Safety Screens

### 8.1 Incident Report Screen
Purpose:
- Capture a safety incident with severity, description, and notifications.

UI Components:
- Student selection.
- Incident type dropdown.
- Severity selector.
- Description text area.
- Guardian notification toggle.

Buttons:
- Submit Incident, Cancel.

Forms:
- Incident form.

Validation:
- Type and description required.
- Student selection recommended when known.

Navigation:
- Back to dashboard or student detail.

Dialogs:
- Confirmation before submission.

Error Messages:
- Missing type, description, or student context.

Success Messages:
- Incident submitted successfully.

Loading States:
- Submit button spinner.

Empty States:
- None.

User Flow:
- User selects a student, fills the form, submits, and returns to the dashboard.

Responsive Design:
- Form fields stack neatly on mobile.

### 8.2 Incident Detail Screen
Purpose:
- Review incident timeline, status, notes, and involved guardians.

UI Components:
- Incident header with status badge.
- Timeline of updates.
- Notes field.
- Status dropdown.

Buttons:
- Update Status, Add Note.

Forms:
- Status update form.

Validation:
- Status must be valid.

Navigation:
- Back to incident list.

Dialogs:
- Status change confirmation.

Error Messages:
- Failed update.

Success Messages:
- Status updated.

Loading States:
- Save spinner.

Empty States:
- No notes yet.

User Flow:
- Staff updates status and adds notes after review.

Responsive Design:
- Timeline and form stack on smaller screens.

---

## 9. Clinic Screens

### 9.1 Clinic Visit Form
Purpose:
- Record a health visit or medical concern.

UI Components:
- Student selection.
- Reason field.
- Temperature field.
- Notes textarea.
- Disposition dropdown.

Buttons:
- Save Clinic Visit, Cancel.

Forms:
- Clinic report form.

Validation:
- Reason required; notes optional; temperature validated if present.

Navigation:
- Back to nurse dashboard or student detail.

Dialogs:
- None.

Error Messages:
- Missing student or reason.

Success Messages:
- Clinic visit saved.

Loading States:
- Save spinner.

Empty States:
- None.

User Flow:
- Nurse records the visit and saves it for follow-up.

Responsive Design:
- Single-column form on mobile.

---

## 10. Visitor and Pickup Screens

### 10.1 Visitor Registration Screen
Purpose:
- Register a visitor arrival.

UI Components:
- Visitor name field.
- Purpose field.
- Contact details field.
- Check-in button.

Buttons:
- Check In Visitor, Cancel.

Forms:
- Visitor arrival form.

Validation:
- Name and purpose required.

Navigation:
- Return to guard dashboard.

Dialogs:
- Confirmation after check-in.

Error Messages:
- Missing name or purpose.

Success Messages:
- Visitor checked in.

Loading States:
- Button spinner.

Empty States:
- None.

User Flow:
- Guard completes the form, checks in the visitor, and the visitor appears in the active list.

Responsive Design:
- Compact form layout for mobile devices.

### 10.2 Pickup Release Screen
Purpose:
- Confirm student pickup release with verified guardian identity.

UI Components:
- Guardian identity card.
- Student name and release status.
- Confirmation button.
- Notes area.

Buttons:
- Release Student, Cancel.

Forms:
- Release confirmation form.

Validation:
- Guardian must be verified.
- Student must be linked to the guardian.

Navigation:
- Back to pickup queue.

Dialogs:
- Confirmation prompt before release.

Error Messages:
- Guardian not verified, bad link, permission denied.

Success Messages:
- Student released successfully.

Loading States:
- Spinner during release.

Empty States:
- No pending releases.

User Flow:
- Guard selects a pickup request, confirms identity, and releases the student.

Responsive Design:
- Touch-friendly card layout.

---

## 11. Messaging and Announcement Screens

### 11.1 Messages Screen
Purpose:
- Allow users to view and receive announcements and updates.

UI Components:
- Filter chips for message type.
- Message cards with title, body, sender, and timestamp.
- Read/unread status.

Buttons:
- Mark Read, Compose, Filter.

Forms:
- Announcement composer for admins.

Validation:
- Title/body required for new announcements.

Navigation:
- Back to dashboard.

Dialogs:
- Compose modal.

Error Messages:
- Message failed to send.

Success Messages:
- Message published or read state updated.

Loading States:
- Message list skeleton.

Empty States:
- No messages yet.

User Flow:
- User opens messages, filters items, reads them, and may compose a new announcement if authorized.

Responsive Design:
- List view on mobile and two-column layout on tablet/desktop.

---

## 12. Reports and Export Screens

### 12.1 Reports Screen
Purpose:
- Provide export-ready reports for attendance, visitors, clinic visits, incidents, pickups, and lost and found.

UI Components:
- Report cards grouped by category.
- Preview pane for generated CSV or PDF content.
- Export buttons.

Buttons:
- Preview, Export CSV, Export PDF, Print.

Forms:
- Report filter form.

Validation:
- Date range must be valid if supplied.

Navigation:
- Back to admin dashboard.

Dialogs:
- Report preview modal.

Error Messages:
- No data available for the selected report.

Success Messages:
- Report generated and downloaded.

Loading States:
- Report generation spinner.

Empty States:
- No records available for the selected report.

User Flow:
- Admin selects a report, previews it, then downloads or prints it.

Responsive Design:
- Report cards stack on small screens.

---

## 13. Emergency and Alert Screens

### 13.1 Emergency Alert Screen
Purpose:
- Broadcast critical school-wide safety messages.

UI Components:
- Alert type selector.
- Message textarea.
- Send alert button.
- Active alerts list.

Buttons:
- Send Alert, Cancel, Acknowledge.

Forms:
- Emergency form.

Validation:
- Type and message required.

Navigation:
- Back to dashboard or alerts list.

Dialogs:
- Confirmation before sending.

Error Messages:
- Missing required fields, send failed.

Success Messages:
- Emergency alert sent.

Loading States:
- Sending spinner.

Empty States:
- No active alerts.

User Flow:
- Admin composes the message, sends it, and users receive and acknowledge it.

Responsive Design:
- Full-width form on mobile with stacked controls.

---

## 14. Lost and Found Screens

### 14.1 Lost and Found Screen
Purpose:
- Let staff log found items and let parents claim items.

UI Components:
- Item list with status chips.
- Claim action button.
- Add item button.

Buttons:
- Add Item, Claim, Mark Returned.

Forms:
- Lost item form.
- Claim form.

Validation:
- Item name and location required.
- Claim contact required.

Navigation:
- Back to parent or admin dashboard.

Dialogs:
- Item claim modal.

Error Messages:
- Claim failed, missing contact info.

Success Messages:
- Item logged or claimed.

Loading States:
- Spinner while submitting claim.

Empty States:
- No items found yet.

User Flow:
- Staff logs a found item; parents review and claim it.

Responsive Design:
- Card list on mobile and table-like grid on desktop.

---

## 15. Settings and Profile Screens

### 15.1 Settings Screen
Purpose:
- Allow user profile or notification preferences to be managed.

UI Components:
- Account details section.
- Notification toggles.
- Theme or language toggles if supported.

Buttons:
- Save Settings, Cancel.

Forms:
- Preference form.

Validation:
- Email validation if changed.

Navigation:
- Back to profile.

Dialogs:
- None.

Error Messages:
- Failed to save preferences.

Success Messages:
- Preferences updated.

Loading States:
- Save spinner.

Empty States:
- None.

User Flow:
- User updates preferences and returns to the main dashboard.

Responsive Design:
- Simple stacked form.

---

## 16. Offline and Queue Screens

### 16.1 Offline Queue Screen
Purpose:
- Show queued actions that could not be completed while offline and allow replay.

UI Components:
- Queue item list with action type, payload summary, timestamp, and status.
- Retry button.
- Empty state guidance.

Buttons:
- Retry, Clear, Refresh.

Forms:
- None.

Validation:
- Queue item must be valid.

Navigation:
- Access from admin dashboard or settings.

Dialogs:
- Retry confirmation modal.

Error Messages:
- Replay failed, network still unavailable.

Success Messages:
- Queue item processed successfully.

Loading States:
- Retry spinner.

Empty States:
- No queued actions.

User Flow:
- Admin reviews offline actions, retries them after connectivity returns, and sees final status.

Responsive Design:
- Compact list with large action buttons.

---

## 17. Audit Trail Screen

### 17.1 Audit Log Screen
Purpose:
- Show system actions and compliance history for administrators.

UI Components:
- Filter toolbar by action and date.
- Audit log list with timestamp, actor, action, and details.

Buttons:
- Filter, Export, Refresh.

Forms:
- Filter form.

Validation:
- Date range must be valid.

Navigation:
- Access from admin dashboard.

Dialogs:
- Export preview modal.

Error Messages:
- Failed to load audit entries.

Success Messages:
- Audit log refreshed.

Loading States:
- Skeleton rows.

Empty States:
- No audit entries yet.

User Flow:
- Admin filters the log and inspects compliance events.

Responsive Design:
- Table-like layout on desktop, stacked cards on mobile.
