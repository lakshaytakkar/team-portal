# Fix Implementation Plan

**Date:** January 2025  
**Priority:** Based on audit findings  
**Estimated Total Effort:** 20-30 hours

---

## Priority 0: Critical Security Fixes (IMMEDIATE)

### P0-1: Enable RLS on All Tables

**Severity:** 🔴 CRITICAL  
**Effort:** 8-12 hours  
**Dependencies:** None  
**Risk:** High (if done incorrectly, could break application)

**Steps:**
1. Create migration file: `supabase/migrations/[timestamp]_enable_rls_all_tables.sql`
2. Enable RLS on each table
3. Create policies for each table based on role:
   - Superadmin: Full access
   - Manager: Team access
   - Executive: Own data access
4. Test each table with different user roles
5. Deploy to staging first
6. Monitor for any access issues

**Tables to Enable RLS:**
- profiles, employees, applications, candidates, credentials
- attendance, leave_requests, tasks, interviews, evaluations
- job_postings, job_roles, job_portals, job_listings
- assets, asset_types, asset_assignments
- hr_templates, credential_categories
- daily_reports, goals, trainings
- knowledge_base_articles, personal_documents, personal_notes, meeting_notes
- departments, employee_departments
- contacts, addresses, phone_numbers
- roles, permissions, role_permissions, user_roles
- recruitment_calls, onboarding_tasks, onboardings
- task_attachments
- And more...

**Testing:**
- Test with superadmin user
- Test with manager user
- Test with executive user
- Verify no data leaks
- Verify proper access restrictions

---

### P0-2: Fix Function Search Path

**Severity:** 🔴 CRITICAL  
**Effort:** 15 minutes  
**Dependencies:** None  
**Risk:** Low

**Steps:**
1. Migration already created: `supabase/migrations/20250110000001_fix_function_search_path.sql`
2. Review migration
3. Apply migration
4. Test functions still work correctly

**Functions to Fix:**
- `update_hr_templates_updated_at()`
- `update_updated_at()`

**Testing:**
- Verify triggers still fire correctly
- Verify `updated_at` fields update properly

---

## Priority 1: High Priority Performance Fixes

### P1-1: Add Missing Foreign Key Indexes

**Severity:** 🟡 HIGH  
**Effort:** 1 hour  
**Dependencies:** None  
**Risk:** Low

**Steps:**
1. Migration already created: `supabase/migrations/20250110000000_add_missing_fk_indexes.sql`
2. Review migration
3. Apply migration
4. Monitor query performance improvement

**Indexes to Create:** 17

**Testing:**
- Run queries that filter by these foreign keys
- Verify performance improvement
- Check index usage in query plans

---

### P1-2: Review and Remove Unused Indexes

**Severity:** 🟡 MEDIUM  
**Effort:** 4-6 hours  
**Dependencies:** P1-1 (wait to see if indexes become used)  
**Risk:** Medium (if removed incorrectly, could hurt performance)

**Steps:**
1. Monitor index usage for 1-2 weeks after adding missing indexes
2. Identify indexes that are still unused
3. Review query patterns to confirm indexes aren't needed
4. Create migration to remove unused indexes
5. Test in staging first
6. Monitor for performance regressions

**Indexes to Review:** 80+

**Testing:**
- Verify no performance regressions
- Monitor query execution times
- Check for slow queries

---

## Priority 2: Medium Priority Improvements

### P2-1: Create Missing Server Actions

**Severity:** 🟡 MEDIUM  
**Effort:** 8-12 hours  
**Dependencies:** None  
**Risk:** Low

**Server Actions to Create:**

1. **Attendance** (`lib/actions/attendance.ts`)
   - `checkIn()`
   - `checkOut()`
   - `getAttendance()`
   - `getAttendanceByDateRange()`
   - `requestCorrection()`
   - `approveCorrection()`

2. **Daily Reports** (`lib/actions/daily-reports.ts`)
   - `createDailyReport()`
   - `getDailyReports()`
   - `getDailyReportById()`
   - `updateDailyReport()`
   - `submitDailyReport()`

3. **Trainings** (`lib/actions/trainings.ts`)
   - `createTraining()`
   - `getTrainings()`
   - `getTrainingById()`
   - `updateTraining()`
   - `completeTraining()`

4. **Knowledge Base** (`lib/actions/knowledge-base.ts`)
   - `createArticle()`
   - `getArticles()`
   - `getArticleById()`
   - `updateArticle()`
   - `deleteArticle()`
   - `publishArticle()`

5. **Personal Notes** (`lib/actions/personal-notes.ts`)
   - `createNote()`
   - `getNotes()`
   - `getNoteById()`
   - `updateNote()`
   - `deleteNote()`

6. **Meeting Notes** (`lib/actions/meeting-notes.ts`)
   - `createMeetingNote()`
   - `getMeetingNotes()`
   - `getMeetingNoteById()`
   - `updateMeetingNote()`
   - `deleteMeetingNote()`

**Pattern to Follow:**
- Use `resolveProfileId()`, `normalizeOptional()` utilities
- Use `getUserFriendlyErrorMessage()`, `logDatabaseError()`
- Use `revalidatePath()` after mutations
- Follow existing patterns from other action files

---

### P2-2: Add Transaction Support to Multi-Table Operations

**Severity:** 🟡 MEDIUM  
**Effort:** 4-6 hours  
**Dependencies:** None  
**Risk:** Medium (if done incorrectly, could break operations)

**Operations to Wrap in Transactions:**

1. **`createOnboarding`** (`lib/actions/hr.ts`)
   - Creates onboarding + onboarding_tasks
   - Should be atomic

2. **`createEmployee`** (`lib/actions/hr.ts`)
   - Creates profile + employee
   - Should be atomic

3. **Any other multi-table creates/updates**

**Implementation:**
- Create Supabase RPC functions for transactions
- Or use Supabase client transaction support
- Wrap operations in try-catch
- Rollback on error

**Testing:**
- Test successful operations
- Test failure scenarios (should rollback)
- Verify no partial data created

---

### P2-3: Complete CRUD Operations

**Severity:** 🟡 MEDIUM  
**Effort:** 4-6 hours  
**Dependencies:** None  
**Risk:** Low

**Missing Operations:**

1. **Task Attachments**
   - Add UPDATE operation

2. **Onboardings**
   - Add DELETE operation (if needed)

3. **HR Templates**
   - Add DELETE operation (if needed)

4. **Applications**
   - Add DELETE operation (if needed)

5. **Interviews**
   - Add DELETE operation (if needed)

6. **Evaluations**
   - Add UPDATE and DELETE operations (if needed)

7. **Job Portals**
   - Add DELETE operation (if needed)

8. **Credential Categories**
   - Add UPDATE and DELETE operations (if needed)

**Note:** Some entities may intentionally not have DELETE operations (e.g., historical data). Verify requirements first.

---

## Priority 3: Low Priority Improvements

### P3-1: Verify Navigation Links

**Severity:** 🟢 LOW  
**Effort:** 2-3 hours  
**Dependencies:** None  
**Risk:** Low

**Steps:**
1. Test all sidebar links
2. Verify no 404 errors
3. Fix broken links
4. Verify role-based visibility
5. Test breadcrumb navigation

---

### P3-2: Add Pagination to List Queries

**Severity:** 🟢 LOW  
**Effort:** 6-8 hours  
**Dependencies:** None  
**Risk:** Low

**Queries to Add Pagination:**

1. `getProjects()` - Add pagination
2. `getTasks()` - Add pagination
3. `getEmployees()` - Add pagination
4. `getCandidates()` - Add pagination
5. `getApplications()` - Add pagination
6. All other list queries

**Implementation:**
- Add `page` and `pageSize` parameters
- Use `LIMIT` and `OFFSET` in queries
- Return pagination metadata (total, page, pageSize, hasMore)

---

### P3-3: Verify Error Handling Everywhere

**Severity:** 🟢 LOW  
**Effort:** 2-3 hours  
**Dependencies:** None  
**Risk:** Low

**Steps:**
1. Test all forms with invalid data
2. Verify error messages display
3. Verify loading states
4. Verify success feedback
5. Fix any missing error handling

---

## Implementation Timeline

### Week 1: Critical Fixes
- **Day 1-2:** Enable RLS on all tables (P0-1)
- **Day 3:** Fix function search path (P0-2)
- **Day 4-5:** Add missing foreign key indexes (P1-1)

### Week 2: High Priority
- **Day 1-3:** Create missing server actions (P2-1)
- **Day 4-5:** Add transaction support (P2-2)

### Week 3: Medium Priority
- **Day 1-2:** Complete CRUD operations (P2-3)
- **Day 3:** Verify navigation links (P3-1)
- **Day 4-5:** Review unused indexes (P1-2)

### Week 4: Low Priority
- **Day 1-3:** Add pagination (P3-2)
- **Day 4-5:** Verify error handling (P3-3)

---

## Risk Mitigation

### For RLS Implementation:
1. **Test Thoroughly:** Test with all user roles
2. **Staging First:** Deploy to staging before production
3. **Monitor:** Watch for access issues
4. **Rollback Plan:** Have migration to disable RLS if needed

### For Index Removal:
1. **Monitor First:** Wait 1-2 weeks after adding missing indexes
2. **Verify Unused:** Confirm indexes truly unused
3. **Test:** Test in staging first
4. **Monitor:** Watch for performance regressions

### For Transactions:
1. **Test Failure Scenarios:** Ensure rollback works
2. **Test Success Scenarios:** Ensure operations complete
3. **Monitor:** Watch for transaction deadlocks

---

## Success Criteria

### Critical Fixes (P0):
- ✅ RLS enabled on all tables
- ✅ Function search paths fixed
- ✅ No security vulnerabilities

### High Priority (P1):
- ✅ Missing indexes added
- ✅ Query performance improved
- ✅ Unused indexes reviewed and removed (if appropriate)

### Medium Priority (P2):
- ✅ Missing server actions created
- ✅ Transactions added to multi-table operations
- ✅ CRUD operations complete

### Low Priority (P3):
- ✅ Navigation links verified
- ✅ Pagination added to list queries
- ✅ Error handling verified everywhere

---

**End of Fix Implementation Plan**

