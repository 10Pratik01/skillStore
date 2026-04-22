# LuminaLearn – Deep Implementation Plan

## Dependencies to Install First
```bash
npm install recharts @stomp/stompjs
```
`recharts` — charts/dashboards | `@stomp/stompjs` — already there ✓

---

## Phase 1 — Public Pages (No Login Required)

### P1.1 Landing Page (`/`) — **Replace current placeholder**
**New file:** `src/pages/Landing.jsx`

**Sections (top → bottom):**
1. **Navbar** — Logo, Explore, Login, Register CTAs
2. **Hero** — Big headline, sub-text, "Explore Courses" + "Start Teaching" buttons, animated background blobs
3. **Stats Bar** — "10,000+ Students · 500+ Courses · 200+ Instructors" (static or from API)
4. **Featured Courses** — 6 cards pulled from `GET /api/courses` (first page), each card: thumbnail, title, instructor, price, star rating
5. **How It Works** — 3-step student journey + 3-step instructor journey in two columns
6. **CTA Banner** — "Ready to learn?" purple gradient block with Register button
7. **Footer** — Links, copyright

**Routing change in `App.jsx`:** `<Route path="/" element={<Landing />} />`

---

### P1.2 Browse Courses (`/courses`) — **Refactor existing**
**File:** `src/pages/Courses.jsx`

**Layout:** Sidebar filter (left 280px) + Course grid (right flex-1)

**Sidebar filters:**
- Search input (debounced 400ms) → `GET /api/courses?search=`
- Category chips (Programming, Design, Business, etc.)
- Price range slider
- Rating filter (4★ and above, etc.)

**Course Grid Card** (`src/components/CourseCard.jsx` — reusable):
```
┌─────────────────────────────┐
│  [Thumbnail Image]          │
│  Category badge             │
├─────────────────────────────┤
│  Course Title               │
│  Instructor Name            │
│  ⭐ 4.7  (234 reviews)      │
│  🧑 1,204 students          │
├─────────────────────────────┤
│  $49.99        [Enroll →]   │
└─────────────────────────────┘
```
Click → navigates to `/courses/:courseId`

---

### P1.3 Course Detail Page (`/courses/:courseId`) — **New**
**File:** `src/pages/CourseDetail.jsx`

**Layout:**
```
┌──────────────────────────────────────┬──────────────┐
│ Breadcrumb: Courses > React Basics   │  Sticky Card  │
│ Title (h1)                           │  [Thumbnail]  │
│ Subtitle                             │  $49.99       │
│ ⭐ 4.7 · 1,204 students              │  [Enroll Now] │
│ By: Instructor Name                  │  or           │
│                                      │  [Go to Course│
│ Tabs: Overview | Curriculum | Reviews│  if enrolled] │
├──────────────────────────────────────┘              │
│ [Tab Content Area]                                   │
└──────────────────────────────────────────────────────┘
```

**Curriculum Tab** — Accordion (section → lessons):
- Lock icon on lessons if not enrolled
- Lesson type icon: 🎬 Video | 📄 Text | 📎 Assignment | ❓ Quiz

**Enroll Button Logic:**
1. Not logged in → redirect to `/login`
2. Course is Public → `POST /api/orders/purchase` directly
3. Course is Password-Protected → show modal asking for access code → `POST /api/orders/purchase` with `{ accessCode }`
4. Course is Invite-Only → show "Request Access" or "You need an invite"
5. Already enrolled → "Go to Course" button → `/courses/:id/learn`

**Reviews Tab:**
- Rating breakdown bar (5★ to 1★ counts)
- List of reviews (avatar, name, stars, text, date)
- If enrolled & not yet reviewed → "Write a Review" form

**API calls:**
- `GET /api/courses/:id` — course details
- `GET /api/courses/:id/reviews` — reviews
- `POST /api/courses/:id/reviews` — submit review (student only)
- `POST /api/orders/purchase` — enroll

---

## Phase 2 — Student Pages

### P2.1 Student Dashboard (`/dashboard`) — **Refactor with Recharts**
**File:** `src/pages/Dashboard.jsx`

**Layout:** Left sidebar nav (fixed 256px) + Main content area

**Sidebar nav links:**
- Dashboard (overview)
- My Courses
- Notifications
- Billing History
- Settings

**Main content — 3 rows:**

**Row 1 — Stats strip:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Enrolled    │  Completed   │  In Progress │  Streak      │
│  12 courses  │  4 courses   │  8 courses   │  7 days 🔥  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Row 2 — Recharts Activity Chart:**
- `<AreaChart>` — X-axis: last 7 days, Y-axis: lessons completed
- Data pulled from progress API
- Purple gradient fill

**Row 3 — Enrolled Courses Grid:**
- Each card has: thumbnail placeholder, course name, linear progress bar (%), "Continue" button
- Click card or button → `/courses/:id/learn`
- Progress %: from `GET /api/orders/student/:id/progress/:courseId`

**Notifications section (accessible via bell or sidebar):**
- List of unread notifications
- Mark all as read
- Each notification: icon + message + timestamp + link to the relevant task/comment

---

### P2.2 Course Player (`/courses/:courseId/learn`) — **New standalone page**
**File:** `src/pages/CoursePlayer.jsx`

**Full-screen layout (no main navbar shown):**
```
┌────────────────────────────────────────────┬─────────────────────┐
│  ← Back  |  Course Title                  │  [Lessons] [Community│
│──────────────────────────────────────────── ├─────────────────────┤
│                                            │ Section 1           │
│   MAIN CONTENT AREA (left/center)          │  ✓ Lesson 1 (done)  │
│                                            │  ● Lesson 2 (active)│
│   depends on lesson type (see below)       │  ○ Lesson 3         │
│                                            │ Section 2           │
│───────────────────────────────────────────  │  ○ Lesson 4         │
│   TASK COMMENT THREAD (below content)      │  ○ Lesson 5         │
│                                            │                     │
└────────────────────────────────────────────┴─────────────────────┘
```

**Content Area renders by `lesson.type`:**

**`type: video`**
```
┌─────────────────────────────────────────┐
│           Video Player (iframe/HTML5)    │
│         [videoUrl from lesson]           │
├─────────────────────────────────────────┤
│  Title & Description                     │
│  [✓ Mark as Complete] button             │
└─────────────────────────────────────────┘
```

**`type: text`**
```
┌─────────────────────────────────────────┐
│  Title                                   │
│  Rendered rich text (lesson.content)     │
│  [✓ Mark as Complete] button             │
└─────────────────────────────────────────┘
```

**`type: assignment`**
```
┌─────────────────────────────────────────┐
│  📎 Assignment: [Title]                  │
│  [Instructions block - from teacher]    │
│  Due: [date if set]                      │
├─────────────────────────────────────────┤
│  YOUR SUBMISSION                         │
│  ○ Text response  ○ File upload (PDF/DOC)│
│  [Textarea or File Dropzone]             │
│  [Submit Assignment] button              │
│                                          │
│  If submitted: "Submitted ✓" badge       │
│  If graded: Score: 87/100 + Feedback     │
└─────────────────────────────────────────┘
```
File upload: `POST /api/assignments/:id/submit` (multipart/form-data)

**`type: quiz`**
```
┌─────────────────────────────────────────┐
│  ❓ Quiz: [Title]                        │
│  [Q1] Question text                      │
│     ○ Option A  ○ Option B               │
│     ○ Option C  ○ Option D               │
│  [Q2] ...                                │
│  [Submit Quiz] button                    │
│                                          │
│  After submit: score + correct answers   │
└─────────────────────────────────────────┘
```

**Comment Thread (below content):**
```
┌─────────────────────────────────────────┐
│  💬 Discussion for this task             │
├─────────────────────────────────────────┤
│  [Avatar] StudentName    2h ago          │
│  "Can we submit in any format?"          │
│    [Reply] [👍 3]                        │
│    └── [Avatar] Teacher  1h ago          │
│        "Yes, PDF or DOCX"                │
│                                          │
│  [Write a comment... @mention support]  │
│  [Post Comment]                          │
└─────────────────────────────────────────┘
```
- `GET /api/community/lesson/:lessonId/comments`
- `POST /api/community/lesson/:lessonId/comment`
- Reply: `POST /api/community/comment/:commentId/reply`
- **@mention:** While typing, if `@` is typed show a dropdown of course participants → tag a user → they get a notification

**Right sidebar — "Community" tab:**
- Full real-time STOMP WebSocket chat for the whole course
- `GET /api/community/course/:courseId`
- `POST /api/community/course/:courseId/post`

**Mark as complete:** `PATCH /api/orders/student/:studentId/progress` with `{ lessonId, completed: true }`

---

### P2.3 Rate Course
- Appears as a card in the Dashboard once enrolled
- Modal with 5-star selector + text area
- `POST /api/courses/:id/reviews`

---

## Phase 3 — Instructor Pages

### P3.1 Instructor Dashboard (`/instructor/dashboard`) — **Refactor with real data**
**File:** `src/pages/instructor/InstructorDashboard.jsx`

**Layout:** Sidebar + Main

**Sidebar links:**
- Overview
- My Courses
- Grading Queue
- Notifications
- Settings

**Main content:**
- Stats: Total Students, Total Revenue, Active Courses, Avg. Rating (from `/api/courses/instructor/:id/analytics`)
- Revenue chart (Recharts `BarChart` — monthly)
- Course list table:

| Title | Students | Status | Rating | Actions |
|---|---|---|---|---|
| React Basics | 234 | Published | ⭐ 4.7 | [Studio] [Grading] |

---

### P3.2 Create Course (`/instructor/course-builder`) — **Refactor**
**File:** `src/pages/instructor/CourseBuilder.jsx`

**Multi-step form (3 steps):**

**Step 1 — Basic Info:**
- Thumbnail image URL field (+ preview)
- Title, Subtitle, Description (textarea)
- Category dropdown
- Price (number input)
- Tags input

**Step 2 — Access Settings:**
```
Access Type:
  ○ Public          — Anyone can enroll
  ○ Password Protected — Shown in catalog, prompts for code at enrollment
  ○ Invite Only     — Not shown in catalog, teacher adds students manually
```
- If "Password Protected" → show "Set Access Code" input
- If "Invite Only" → course is unlisted

**Step 3 — Review & Publish:**
- Summary of all info
- [Save as Draft] [Publish Course] buttons
- API: `POST /api/courses` with `{ ..., accessType, accessCode }`

---

### P3.3 Course Studio (`/instructor/courses/:courseId`) — **New**
**File:** `src/pages/instructor/CourseStudio.jsx`

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  ← Back to Dashboard  |  [Course Title]  [Preview]     │
├──────────────────────┬─────────────────────────────────┤
│  STRUCTURE TREE       │  EDIT PANEL (right)             │
│  (left 320px)         │                                 │
│  Section 1            │  Selected: Assignment Lesson    │
│   + Lesson 1 (video)  │  Title: ___________________     │
│   + Lesson 2 (assign) │  Type: [Assignment ▼]           │
│   + Add Lesson        │  Instructions: [textarea]       │
│  + Add Section        │  Due Date: [date picker]        │
│                       │  Max Score: [number]            │
│                       │  [Save Changes]  [Delete Task]  │
│                       │                                 │
│                       │  ──── Student Activity ────     │
│                       │  12 opened · 8 submitted        │
│                       │  [View All Submissions →]       │
└──────────────────────┴─────────────────────────────────┘
```

**Student Activity Per Lesson:**
- `GET /api/assignments/:assignmentId/submissions` — count of submissions
- Show: "X students opened · Y submitted · Z graded"

**Invite Students (Course Settings panel):**
- Input: search by username or email
- `POST /api/orders/instructor-enroll` → `{ courseId, studentUsername }`
- Shows current enrolled student list with [Remove] button

**Access Code Management:**
- Toggle lock on/off
- Change access code
- `PATCH /api/courses/:id`

---

### P3.4 Grading Queue (`/instructor/courses/:courseId/grading`) — **New**
**File:** `src/pages/instructor/GradingQueue.jsx`

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Filter: [All ▼] [Assignment ▼] [Status: Pending ▼]  │
├────────────┬─────────────────────────────────────────┤
│ Submission │  Grade Panel                             │
│ List       │                                          │
│ (left)     │  Student: John Doe                       │
│            │  Assignment: Week 1 Homework             │
│ ● John Doe │  Submitted: 2h ago                       │
│   Week 1   │  ─────────────────────────────────────  │
│   Pending  │  [Submission text / Download link]       │
│            │  ─────────────────────────────────────  │
│ ✓ Jane Doe │  Score: [___] / 100                      │
│   Week 2   │  Feedback: [textarea]                    │
│   Graded   │  [Submit Grade]                          │
└────────────┴─────────────────────────────────────────┘
```

---

## Phase 4 — Admin Pages

### P4.1 Admin Dashboard (`/admin/dashboard`) — **Refactor**
- Platform stats: `GET /api/users/admin/stats`, `GET /api/courses/admin/stats`
- Recharts `PieChart` — users by role breakdown
- Recent activity feed (recent registrations, new courses)

### P4.2 Users List (`/admin/users`) — **Refactor**
- Paginated table: Avatar | Name | Email | Role | Joined | [View] [Delete]
- Role filter tabs: All | Students | Instructors | Admins
- Search: `GET /api/users?search=`
- Delete: `DELETE /api/users/:id`
- Click [View] → `/admin/users/:userId`

### P4.3 User Detail (`/admin/users/:userId`) — **New**
**File:** `src/pages/admin/AdminUserDetail.jsx`

**If INSTRUCTOR selected:**
```
┌──────────────────────────────────────────────────────────┐
│  [Avatar] John Smith — INSTRUCTOR  [Delete Account]       │
├──────────────────────────────────────────────────────────┤
│  Courses Created: 6                                       │
│                                                           │
│  ▶ React for Beginners (234 students)                     │
│    ▶ Section 1                                            │
│       ▶ Assignment: Week 1 Homework                       │
│          Submissions: 45  |  Pending: 12  |  Graded: 33   │
│          Community messages: 128                          │
│    ▶ Section 2 ...                                        │
└──────────────────────────────────────────────────────────┘
```

**If STUDENT selected:**
```
┌──────────────────────────────────────────────────────────┐
│  [Avatar] Jane Doe — STUDENT  [Delete Account]            │
├──────────────────────────────────────────────────────────┤
│  Enrolled Courses:                                        │
│  ┌────────────────┬──────────┬──────────────────────┐    │
│  │ Course Name    │ Progress │ Comments Sent        │    │
│  │ React Basics   │  ████░ 72%│ 23 comments          │    │
│  │ Python Intro   │  ██░░ 40%│ 5 comments           │    │
│  └────────────────┴──────────┴──────────────────────┘    │
│                                                           │
│  Community Messages (all courses): [expandable list]      │
│  Task Comments: [expandable list]                         │
└──────────────────────────────────────────────────────────┘
```

### P4.4 Courses List (`/admin/courses`) — **Refactor**
- Table: Thumbnail | Title | Instructor | Students | Status | Created | [View] [Delete]
- Click [View] → `/admin/courses/:courseId`

### P4.5 Course Detail — Admin View (`/admin/courses/:courseId`) — **New**
**File:** `src/pages/admin/AdminCourseDetail.jsx`

```
┌──────────────────────────────────────────────────────────┐
│  [Thumbnail]  React for Beginners  |  Instructor: John    │
│  234 enrolled · ⭐ 4.7 · Published                        │
│  [Delete Course]                                          │
├──────────────────────────────────────────────────────────┤
│  Tabs: [Content] [Submissions] [Community] [Reviews]      │
├──────────────────────────────────────────────────────────┤
│  Content Tab:                                             │
│  All sections → all tasks (type, title, instructions)     │
│                                                           │
│  Submissions Tab:                                         │
│  Filter by assignment → all student submissions + grades  │
│                                                           │
│  Community Tab:                                           │
│  Full community chat log for the course                   │
│                                                           │
│  Reviews Tab:                                             │
│  All ratings and review text from students                │
└──────────────────────────────────────────────────────────┘
```

---

## Notification System (Cross-cutting)

### Storage: Backend via `community-service` notifications table

**Triggers → Notifications:**
| Event | Who gets notified |
|---|---|
| Teacher adds new task | All enrolled students |
| Student submits assignment | The course instructor |
| Instructor grades submission | That student |
| Comment posted on a task | All enrolled students in that course |
| @mention in a comment | The mentioned user specifically |
| New student enrolls | The instructor |

### Frontend Implementation:
**Component:** `src/components/NotificationCenter.jsx`

```
Bell icon in navbar → click → slide-down panel
┌──────────────────────────────────────────┐
│  🔔 Notifications          [Mark all read]│
├──────────────────────────────────────────┤
│  🔵 [icon]  "John submitted Week 1..."   │
│              React Basics · 2 min ago    │
│  🔵 [icon]  "@You were mentioned in..."  │
│              Python Intro · 1h ago       │
│  ○  [icon]  "New task added: Quiz 3"     │
│              React Basics · 3h ago       │
└──────────────────────────────────────────┘
```

**Real-time:** STOMP subscription to `/topic/notifications/{userId}`
**Polling fallback:** `GET /api/community/notifications/user/:userId` on page load
**Mark read:** `PATCH /api/community/notifications/read/:notifId`

---

## @Mention System

**In any comment input:**
1. User types `@`
2. Frontend fetches course participants: `GET /api/orders/course/:courseId/students` + instructor
3. Dropdown appears with avatar + name options, filtered as user types more characters
4. On select: inserts `@username` as highlighted token in the input
5. On submit: comment body is scanned for `@username` patterns
6. Frontend sends: `POST /api/community/lesson/:lessonId/comment` with `{ content, mentions: ['userId1', 'userId2'] }`
7. Backend creates a notification for each mentioned userId

**UI rendering:** comments with `@username` render the tag as a colored, clickable chip

---

## New File Structure (Complete)

```
src/
├── pages/
│   ├── Landing.jsx                  ← Phase 1 (new)
│   ├── Courses.jsx                  ← Phase 1 (refactor)
│   ├── CourseDetail.jsx             ← Phase 1 (new)
│   ├── Dashboard.jsx                ← Phase 2 (refactor + Recharts)
│   ├── CoursePlayer.jsx             ← Phase 2 (new standalone)
│   ├── instructor/
│   │   ├── InstructorDashboard.jsx  ← Phase 3 (refactor)
│   │   ├── CourseBuilder.jsx        ← Phase 3 (refactor)
│   │   ├── CourseStudio.jsx         ← Phase 3 (new)
│   │   └── GradingQueue.jsx         ← Phase 3 (new)
│   └── admin/
│       ├── AdminDashboard.jsx       ← Phase 4 (refactor)
│       ├── AdminUsers.jsx           ← Phase 4 (refactor)
│       ├── AdminCourses.jsx         ← Phase 4 (refactor)
│       ├── AdminUserDetail.jsx      ← Phase 4 (new)
│       └── AdminCourseDetail.jsx    ← Phase 4 (new)
├── components/
│   ├── CourseCard.jsx               ← Reusable
│   ├── LessonRenderer.jsx           ← Renders video/text/assignment/quiz
│   ├── CommentThread.jsx            ← Threaded comments + @mention
│   ├── MentionInput.jsx             ← Input with @mention dropdown
│   ├── NotificationCenter.jsx       ← Bell + panel
│   ├── StarRating.jsx               ← Reusable rating
│   ├── ProgressRing.jsx             ← Circular progress
│   └── FileUploader.jsx             ← Drag-and-drop file upload
└── contexts/
    └── AuthContext.jsx              ← Add notificationCount state
```

---

## Build Sequence

| # | Phase | Deliverable |
|---|---|---|
| 1 | Public | Landing, Courses (refactor), CourseDetail |
| 2 | Student | Dashboard + Recharts, CoursePlayer, Comments, @Mention |
| 3 | Instructor | Dashboard, CourseBuilder, CourseStudio, GradingQueue |
| 4 | Admin | Dashboard, UserDetail, CourseDetail |
| 5 | Cross-cutting | NotificationCenter (STOMP), @Mention notifications |

> [!IMPORTANT]
> **Ready to start Phase 1?** Say "Start Phase 1" and I will build the Landing page, refactor the Courses page, and create the CourseDetail page.
