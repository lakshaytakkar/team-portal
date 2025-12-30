# Routing Audit and Normalization Report

**Date:** January 2025  
**Purpose:** Document routing structure, normalization changes, and pages using mock data

---

## Overview

This document tracks the routing structure of the Team Portal application, documents normalization changes made, and identifies pages using mock data vs. real database queries.

---

## Routing Normalization Changes

### Fixed Inconsistencies

1. **Development Routes**
   - **Before:** Sidebar referenced `/development/*` routes
   - **After:** Updated to `/dev/*` to match actual route structure
   - **Files Changed:** `lib/utils/sidebar-config.ts`
   - **Routes Updated:**
     - `/development/projects` → `/dev/projects`
     - `/development/design-system/components` → `/dev/design-system/components`
     - `/development/docs` → `/dev/docs`

2. **Explore Route**
   - **Before:** Sidebar referenced `/home` which doesn't exist
   - **After:** Updated to `/explore` to match actual route
   - **Files Changed:** `lib/utils/sidebar-config.ts`

### Route Structure Standards

- **Single-level routes preferred:** `/projects`, `/tasks`, `/my-tasks`
- **Department routes:** `/hr/*`, `/sales/*`, `/finance/*`, `/marketing/*`, `/analytics/*`, `/rnd/*`, `/recruitment/*`
- **CEO routes:** `/ceo/*` (kept for executive-specific views)
- **Admin routes:** `/admin/*`
- **My Workspace routes:** `/my-*` (personal employee views)
- **Dev routes:** `/dev/*` (development portal)

---

## Pages Added to Sidebar

### HR Module (People Section)
- `/hr/assets` - Manage company assets and equipment
- `/hr/onboarding` - Manage employee onboarding processes
- `/hr/roles` - Manage organizational roles
- `/hr/verticals` - Manage company verticals
- `/hr/templates` - Manage HR templates

### Recruitment Module (People Section)
- `/recruitment/evaluations` - View candidate evaluations
- `/recruitment/job-roles` - Manage job roles and positions
- `/recruitment/job-portals` - Manage job portal integrations
- `/recruitment/job-listings` - View all job listings

### Marketing Module
- `/marketing/whatsapp-templates` - Create WhatsApp templates
- `/marketing/whatsapp-automations` - Configure WhatsApp automation workflows
- `/marketing/drips` - Manage drip campaigns
- `/marketing/pages` - Manage marketing pages
- `/marketing/automation-logs` - View automation execution logs

### Finance Module
- `/finance/sales-orders` - Manage sales orders
- `/finance/vendors` - Manage vendor information
- `/finance/taxes` - Manage tax information

### Analytics Module
- `/analytics/domains` - Manage tracked domains

### R&D Module (Research Section)
- `/rnd/mindmaps` - Visual mind mapping
- `/rnd/financial-planning` - Financial planning and analysis
- `/rnd/new-verticals` - Explore new business verticals
- `/rnd/market-research` - Market research and analysis

### Admin Module
- `/admin/credentials` - Manage system credentials
- `/admin/tasks` - View all tasks
- `/admin/analytics` - Admin analytics and insights

### CEO Module (Dashboards Section)
- `/ceo/sales-summary` - Sales performance summary
- `/ceo/hr-summary` - HR metrics summary
- `/ceo/recruitment-summary` - Recruitment pipeline summary
- `/ceo/performance-analytics` - Performance metrics and analytics
- `/ceo/department-oversight` - Department performance overview
- `/ceo/team-management` - Team structure and management
- `/ceo/reports` - Executive reports and insights

### CEO Explorers (Operations Section)
- `/ceo/explorers/projects` - Explore all projects
- `/ceo/explorers/tasks` - Explore all tasks
- `/ceo/explorers/deals` - Explore all deals
- `/ceo/explorers/employees` - Explore all employees

---

## Placeholder Pages

The following pages exist but are **placeholder pages** (not added to sidebar):

- `/departments/hr` - Placeholder with links to `/hr/employees` and `/hr/onboarding`
- `/departments/sales` - Placeholder with links to `/sales/leads`, `/sales/deals`, `/sales/pipeline`
- `/departments/recruitment` - Placeholder with links to `/recruitment/candidates`, `/recruitment/applications`, `/recruitment/job-postings`

**Decision:** These pages are not added to the sidebar as they are simple placeholder pages. The actual functional department dashboards (`/hr/dashboard`, `/sales/dashboard`, `/recruitment/dashboard`) are already in the sidebar.

---

## Pages Using Mock Data

### Sales Module (All Pages - Mock Data)

All Sales module pages use mock data from `lib/data/sales.ts`:

- `/sales/dashboard` - Uses `initialDeals`, `initialLeads`
- `/sales/pipeline` - Uses `initialDeals`
- `/sales/leads` - Uses `initialLeads`
- `/sales/deals` - Uses `initialDeals`
- `/sales/quotations` - Uses `initialQuotations`
- `/sales/automation-logs` - Uses `initialAutomationLogs`

**Status:** Expected for MVP - Database tables may not exist yet  
**Priority:** Medium - Sales module needs database tables created

### Finance Module (All Pages - Mock Data)

All Finance module pages use mock data from `lib/data/finance.ts`:

- `/finance/dashboard` - Mock data
- `/finance/invoices` - Uses `initialInvoices`
- `/finance/expenses` - Uses `initialExpenses`
- `/finance/payroll` - Uses `initialPayroll`
- `/finance/transactions` - Uses `initialTransactions`
- `/finance/reports` - Mock data
- `/finance/sales-orders` - Uses `initialSalesOrders`
- `/finance/vendors` - Uses `initialVendors`
- `/finance/taxes` - Uses `initialTaxes`

**Status:** Expected for MVP - Database tables may not exist yet  
**Priority:** Medium - Finance module needs database tables created

### Marketing Module (All Pages - Mock Data)

All Marketing module pages use mock data from `lib/data/marketing.ts`:

- `/marketing/dashboard` - Mock data
- `/marketing/campaigns` - Uses `initialCampaigns`
- `/marketing/email-templates` - Uses `initialEmailTemplates`
- `/marketing/email-automations` - Uses `initialEmailAutomations`
- `/marketing/whatsapp-templates` - Uses `initialWhatsAppTemplates`
- `/marketing/whatsapp-automations` - Uses `initialWhatsAppAutomations`
- `/marketing/drips` - Uses `initialDrips`
- `/marketing/pages` - Uses `initialPages`
- `/marketing/automation-logs` - Uses `initialAutomationLogs`
- `/marketing/content-editor` - Mock data

**Status:** Expected for MVP - Database tables may not exist yet  
**Priority:** Medium - Marketing module needs database tables created

### Analytics Module (All Pages - Mock Data)

All Analytics module pages use mock data from `lib/data/analytics.ts`:

- `/analytics/dashboard` - Uses `initialWebsiteTraffic`
- `/analytics/website-traffic` - Uses `initialWebsiteTraffic`
- `/analytics/conversions` - Uses `initialConversions`
- `/analytics/client-reports` - Uses `initialClientReports`
- `/analytics/domains` - Uses `initialDomains`

**Status:** Expected for MVP - May use external services or tables not yet created  
**Priority:** Low - Analytics may integrate with external services

### R&D Module (All Pages - Mock Data)

All R&D module pages use mock data from `lib/data/rnd.ts`:

- `/rnd/research-docs` - Uses `initialResearchDocs`
- `/rnd/mindmaps` - Uses `initialMindmaps`
- `/rnd/financial-planning` - Uses `initialFinancialPlanning`
- `/rnd/new-verticals` - Uses `initialNewVerticals`
- `/rnd/suggestions` - Uses `initialSuggestions`
- `/rnd/strategic-planning` - Uses `initialStrategicPlanning`
- `/rnd/market-research` - Uses `initialMarketResearch`

**Status:** Expected for MVP - Database tables may not exist yet  
**Priority:** Low - R&D module is exploratory

### My Workspace Pages (Mock Data)

- `/my-attendance` - Uses `defaultData` (mock array)
- `/my-training` - Uses `initialTrainings` from `lib/data/my-workspace.ts`

**Status:** Should be migrated to real data - These are core features  
**Priority:** High - Core employee features need real database integration

### CEO Summary Pages (Mock Data)

- `/ceo/operations-summary` - Uses `initialProjects`, `initialTasks` from `lib/data/projects.ts` and `lib/data/tasks.ts`
- `/ceo/sales-summary` - Uses `initialDeals`, `initialLeads` from `lib/data/sales.ts`
- `/ceo/hr-summary` - Uses `initialEmployees` from `lib/data/hr.ts`
- `/ceo/recruitment-summary` - Uses `initialCandidates` from `lib/data/candidates.ts`, `initialJobPostings` from `lib/data/recruitment.ts`

**Status:** Should use aggregated real data - These are executive dashboards  
**Priority:** Medium - Should aggregate from real database tables

---

## Database Tables Needed

### High Priority (Core Features)

1. **Attendance**
   - Table: `attendance`
   - Used by: `/my-attendance`
   - Server actions needed: `lib/actions/attendance.ts`

2. **Training**
   - Table: `trainings`
   - Used by: `/my-training`
   - Server actions needed: `lib/actions/trainings.ts`

### Medium Priority (Business Modules)

3. **Sales Module Tables**
   - `leads`
   - `deals`
   - `quotations`
   - `sales_orders`
   - `automation_logs` (sales-specific)

4. **Finance Module Tables**
   - `invoices`
   - `expenses`
   - `payroll`
   - `transactions`
   - `vendors`
   - `taxes`

5. **Marketing Module Tables**
   - `email_templates`
   - `whatsapp_templates`
   - `email_automations`
   - `whatsapp_automations`
   - `drips`
   - `campaigns`
   - `automation_logs` (marketing-specific)
   - `pages` (marketing)

### Low Priority (Support Modules)

6. **Analytics Module Tables**
   - `website_traffic`
   - `conversions`
   - `client_reports`
   - `domains`
   - Note: May use external services instead

7. **R&D Module Tables**
   - `research_docs`
   - `mindmaps`
   - `financial_planning`
   - `suggestions`
   - `strategic_planning`
   - `market_research`

---

## Pages Using Real Database

The following modules are fully integrated with the database:

- **Projects** - Full CRUD via `lib/actions/projects.ts`
- **Tasks** - Full CRUD via `lib/actions/tasks.ts`
- **Calls** - Full CRUD via `lib/actions/calls.ts`
- **HR Module** - Full CRUD via `lib/actions/hr.ts`
- **Recruitment Module** - Full CRUD via `lib/actions/recruitment.ts`
- **Leave Requests** - Full CRUD via `lib/actions/leave-requests.ts`
- **Goals** - Full CRUD via `lib/actions/goals.ts`
- **Assets** - Full CRUD via `lib/actions/assets.ts`
- **Credentials** - Full CRUD via `lib/actions/credentials.ts`
- **Admin** - Full CRUD via `lib/actions/admin.ts`
- **Employee Documents** - Full CRUD via `lib/actions/employee-documents.ts`

---

## Summary Statistics

- **Total Pages:** 100+
- **Pages with Database Backing:** ~60%
- **Pages Using Mock Data:** ~30%
- **Pages Using External Services:** ~10%
- **Placeholder Pages:** 3 (`/departments/*`)
- **Routes Normalized:** 4 (`/development/*` → `/dev/*`, `/home` → `/explore`)
- **Pages Added to Sidebar:** 30+

---

## Recommendations

### Immediate Actions

1. ✅ **Completed:** Normalize routing inconsistencies
2. ✅ **Completed:** Add missing pages to sidebar
3. ✅ **Completed:** Document mock data usage

### Future Actions

1. **High Priority:** Migrate `/my-attendance` and `/my-training` to real database
2. **Medium Priority:** Create database tables for Sales, Finance, and Marketing modules
3. **Medium Priority:** Update CEO summary pages to use aggregated real data
4. **Low Priority:** Decide on `/departments/*` routes - implement or remove
5. **Low Priority:** Create database tables for Analytics and R&D modules (if needed)

---

**End of Routing Audit Report**

