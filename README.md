# NUS-Tree

## Team Information

**Team Name:** RAAR  
**Project Name:** NUS-Tree  
**Proposed Level of Achievement:** Apollo

**Team Members:**
- Arav Cabral
- Raghuveer Singh

---

## Project Overview

NUS-Tree is a visual supplement to NUSMods that helps NUS students understand module prerequisites, post-requisites, and long-term module planning paths.

While NUSMods is useful for viewing module information and planning timetables, students still face difficulty when planning modules across multiple years. This is especially challenging for students aiming for advanced Level 3000 or Level 4000 modules, because they may only realise later that they have missed an important prerequisite in an earlier semester.

NUS-Tree addresses this problem by visualising module dependencies as an interactive graph. Instead of manually checking prerequisite text module by module, students can explore a full prerequisite tree and see how their current module choices affect future module options.

---

## Motivation

Module planning is a complex and high-impact task for NUS students. A student who wants to take an advanced module, such as a Level 4000 Computer Science module, may need to complete several prerequisite modules across multiple semesters before becoming eligible.

The pain point is that students often do not only need to know the direct prerequisite of a module. They need to understand the full chain of earlier modules that lead to that module. If a student misses a key foundation module in Year 1 or Year 2, they may only discover the problem much later, when it is already difficult to recover without delaying their academic plan.

Our target users include:

- Freshmen planning towards advanced modules in later years.
- Students checking whether their NUSMods plan satisfies future prerequisites.
- Students looking for alternative modules when they cannot take their original intended module.

NUS-Tree aims to reduce these planning mistakes by giving students a visual way to explore prerequisites, post-requisites, and semester availability.

---

## Aim

We aim to build **NUS-Tree**, a visual supplement to NUSMods.

The system helps NUS students perform deep-tree analysis of:

1. **Prerequisites** — what modules must be taken before a selected module.
2. **Post-requisites** — what future modules are unlocked by taking a selected module.

By doing this, NUS-Tree helps students optimise their multi-year academic plans and reduce the risk of graduation delays caused by missed prerequisites or poor semester sequencing.

---

## User Stories

### 1. Long-term Planning

As a Computer Science freshman, I want to see the full recursive prerequisite tree for a Level 4000 module, such as CS4226, so that I can plan the exact sequence of modules needed from Year 1 to taking the module.

### 2. Unlocking Opportunities

As a student considering a foundation module, such as MA1521, I want to see a post-requisite tree showing the modules that this module would eventually unlock.

### 3. Prerequisite Validation

As a student using NUSMods, I want to import my planned schedule and see a visual warning if a module’s prerequisites are not met in the preceding semesters.

### 4. Alternative Pathfinding

As a student who failed to get into a specific module, I want to see a visual map of alternative modules that share similar prerequisite roots so that I can stay on track for my major.

---

## Core Features

### Feature 1: NUSMods API Integration

The system fetches real module data from the NUSMods API (prereqTree modules/{moduleCode}), including module codes, titles, descriptions, prerequisite strings, and semester availability.

**Milestone 2 target:** Complete basic API integration and retrieve real module information.

---

### Feature 2: Recursive Dependency Graph

The system renders module prerequisite relationships as an interactive directed graph.

**Milestone 2 target:** Complete recursive graph traversal across multiple prerequisite levels.

---

### Feature 3: Unlocks View

The Unlocks View shows the reverse relationship of prerequisites. Instead of asking what is needed before taking a module, it shows what future modules are unlocked by taking a selected module.

**Milestone 2 target:** Implement reverse-tree traversal and visualisation.


---

### Feature 4: NUSMods JSON Import

The system will allow students to import their NUSMods plan and compare completed or planned modules against prerequisite requirements.

**Milestone 3 target:** Highlight completed, planned, and missing modules within the graph.

---

### Feature 5: Semester Availability Overlay

Some modules are only offered in specific semesters. This feature will show semester availability through visual indicators on graph nodes.

**Milestone 3 target:** Add semester availability information to reduce planning errors caused by module offering schedules.

---

## Tech Stack

### Full-stack Framework

* **Next.js**

We are using Next.js as a full-stack framework. The frontend UI will be built with Next.js and React, while server-side functionality will be handled through Next.js server-side utilities and route handlers.

### Graph Visualisation

* **React Flow**

React Flow will be used to render interactive prerequisite and post-requisite graphs.

### Styling

* **Tailwind CSS**

Tailwind CSS will be used to create a clean and responsive interface consistent with the NUSMods-style user experience.

### Data Source

* **NUSMods API**

The system will fetch module information, prerequisite strings, and semester availability data from the NUSMods API.

### Automated Testing

* **Jest** for unit testing parser and graph-building logic.
* **React Testing Library** for testing UI components.
* **Playwright** for end-to-end testing of user flows such as searching for a module and rendering a graph.

### Deployment and CI/CD

* **Vercel** for deployment.
* **GitHub** for version control.
* **GitHub Actions** for automated linting, testing, and deployment checks.

---

## System Architecture

NUS-Tree is designed using a modular architecture with clear separation of concerns.

```
User
 ↓
Next.js Frontend UI
 ↓
Next.js Server / Route Handlers
 ↓
NUSMods API
 ↓
Data Retrieval Layer
 ↓
Business Logic Layer
 ↓
React Flow Graph Visualisation
```



### CI/CD Testing Workflow

GitHub Actions will run automated checks on every pull request.

Planned CI checks:

```
npm run lint
npm run test
npm run test:e2e
npm run build
```

