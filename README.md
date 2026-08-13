
# NUS-Tree

A visual dependency graph system for NUS module planning.


## Foreword by developers

We decided to build NUS-Tree because we personally made some "mistakes" planning our modules. NUS-Tree aims to make it easier to plan your courses and pick the most interesting courses available to you, even if you don't get your first choice.

NUS-Tree helps you visualise the full path to any course you may want to take, showing the required sequence at a glance. It also has an Unlocks view showing the future courses enabled by an earlier course. Our goal is to make long-term module planning easier throughout university.

We realised some courses would only be available to us in Year 4 because of their dependencies and semester-specific availability. We built NUS-Tree to help others identify these constraints earlier.
---

## Table of Contents

1. [Project Information](#project-information)
2. [Project Overview](#project-overview)
3. [Problem Statement](#problem-statement)
4. [Motivation](#motivation)
5. [Target Users](#target-users)
6. [User Stories](#user-stories)
7. [Feature Overview](#feature-overview)
8. [Detailed Feature Specification](#detailed-feature-specification)
9. [System Architecture](#system-architecture)
10. [Technical Design](#technical-design)
11. [Data Model](#data-model)
12. [Algorithms](#algorithms)
13. [Software Engineering Practices](#software-engineering-practices)
14. [Testing Plan](#testing-plan)
15. [CI/CD Plan](#cicd-plan)
16. [Milestone Scope](#milestone-scope)
17. [Risk Analysis](#risk-analysis)
18. [Setup Instructions](#setup-instructions)
19. [Verification Commands](#verification-commands)
---

## Project Information

| Field | Details |
|---|---|
| Project Name | NUS-Tree |
| Team Name | RAAR |
| Level of Achievement | Apollo 11 |
| Project Type | Visual module planning system |
| Primary Users | NUS students |
| Data Source | NUSMods API |
| Framework | Next.js |
| Visualisation Library | React Flow |
| Deployment Platform | Vercel |

---

## Project Overview

NUS-Tree is a visual supplement to NUSMods that helps NUS students understand module prerequisites, post-requisites, and long-term module planning paths.

The system is designed to support:

- Recursive prerequisite visualisation
- Reverse prerequisite or "post" requisite visualisation
- Structured AND/OR/n-of prerequisite resolution using NUSMods data
- Semester availability awareness
- NUSMods plan import and validation
- Automated testing and CI/CD workflows

---

## Problem Statement

Module planning is a complex multi-semester problem.

While NUSMods provides excellent scheduling and module information tools, students may still struggle with long-term planning because module relationships are difficult to visualise deeply.

Current pain points include:

1. Limited Prerequisite visibility

   Students can usually see direct prerequisites, but not the full recursive chain of prerequisites needed to reach a higher-level module.

2. No postrequisite visibility

   Students cannot easily answer: “What future modules will this module unlock?”

3. Hard to infer prerequisites with AND/OR logic

   Some modules have requirements involving AND/OR logic, such as:

   CS2040 and (CS2100 or EE2024) as a prerequisite. These requirements are difficult to understand when shown as plain text.

4. Semestral modules

   Some higher level modules are offered only in Semester 1 or Semester 2. Missing this detail can disrupt long-term plans.

5. Late Prerequisite discovery

   A student may only realise in Year 3 or Year 4 that they missed a key Year 1 or Year 2 prerequisite, potentially affecting graduation planning or causing them to miss an interesting course.

---

## Motivation

NUS students often plan modules across several semesters, especially when aiming for advanced Level 3000 or Level 4000 modules.

For example, a CS freshman may want to take a Level 4000 module in Year 4. However, that module may require several intermediate modules, which themselves require earlier foundation modules. If the student does not identify these dependencies early, they may miss an important prerequisite and be blocked from taking their intended module later.

NUS-Tree aims to prevent this by making module dependencies visually explicit.

Instead of manually clicking through many module pages, students can use NUS-Tree to:

* See all prerequisite layers for a target module
* Understand which modules act as bottlenecks
* Discover what future modules are unlocked by a foundation module
* Identify missing prerequisites in their planned academic path

---

## Target Users

NUS-Tree is designed for:

1. **Freshmen planning long-term module paths**

   Students who want to plan from Year 1 to Year 4 and avoid missing early prerequisites.

2. **Students planning towards advanced modules**

   Students targeting Level 3000 or Level 4000 modules who need to understand the full dependency chain.

3. **Students choosing early modules**

   Students deciding whether a module is worth taking based on what future modules it unlocks.

4. **Students using NUSMods for semester planning**

   Students who already plan modules using NUSMods and want an additional validation layer.

5. **Students exploring alternatives**

   Students who cannot get a desired module and want to find alternative modules which they have unlocked.

---

## User Stories

### User Story 1: Long-Term Planning

As a Computer Science freshman, I want to see the full recursive prerequisite tree for a Level 4000 module, such as CS4226, so that I can plan the exact sequence of modules needed from Year 1 to Year 4.

### User Story 2: Unlocking Opportunities

As a student considering a foundation module, such as MA1521, I want to see a post-requisite tree showing every module that this module would eventually unlock.

### User Story 3: Prerequisite Validation

As a student using NUSMods, I want to import my planned schedule and see a visual warning if a module’s prerequisites are not met in preceding semesters.

### User Story 4: Alternative Pathfinding

As a student who failed to get into a specific module, I want to see a visual map of alternative modules that share the same prerequisite roots so that I can stay on track for my major.

---

## Feature Overview

| Feature                       | Category  | Target | Status      | Description                                       |
| ----------------------------- | --------- | ------ | ----------- | ------------------------------------------------- |
| NUSMods API Integration       | Core      | MS2    | Implemented | Fetch real module data from NUSMods               |
| Module Search and Detail View | Core      | MS2    | Implemented | Search module codes and display module metadata   |
| Basic Dependency Graph        | Core      | MS2    | Implemented | Render a one-level prerequisite graph             |
| Recursive Dependency Graph    | Core      | MS2    | Implemented | Expand and combine prerequisite graphs recursively |
| Unlocks View                  | Core      | MS2    | Implemented | Show direct and indirect modules unlocked         |
| Logic Resolver                | Extension | MS3    | Implemented | Resolve structured AND, OR, and n-of requirements |
| NUSMods JSON Import           | Extension | MS3    | Implemented | Import plans and flag invalid prerequisite order  |
| Semester Planning             | Extension | MS3    | Implemented | Summarise four years and validate module offerings |
| Path Recommendation Engine    | Extension | MS3+   | Planned     | Suggest alternative module paths                  |

The current planner also supports local persistence, NUS-Tree JSON export/import, multiple roots, shared-prerequisite deduplication, editable modules and notes, templates, and automatic layout tools.

---

# Detailed Feature Specification

The sections below combine current implementation details with remaining design goals. The feature overview above is the source of truth for implementation status.

## Feature 1: NUSMods API Integration Layer

### Overview

The NUSMods API Integration Layer retrieves raw module data from the NUSMods API and transforms it into a consistent internal format used by the rest of the system.

This layer prevents the UI and graph logic from depending directly on external API response shapes.

### Responsibilities

The API layer:

* Fetch module metadata from the NUSMods API
* Retrieve module code, title, description, prerequisites, and semester availability
* Normalize API responses into internal data structures
* Handle missing fields safely
* Handle invalid module codes
* Support caching to avoid unnecessary repeated requests (with possible storage of module results in a database later)

### Data Flow

```mermaid
flowchart TD
    A[User enters module code] --> B[Next.js API Route / Server Function]
    B --> C[NUSMods API]
    C --> D[Raw Module JSON]
    D --> E[Normalization Layer]
    E --> F[Clean Module Object]
    F --> G[Graph Builder / UI Components]
```

### Expected Input

```ts
type ModuleCodeInput = string;
```

Example:

```text
CS2040S
```

### Expected Output

```ts
type NormalizedModule = {
  moduleCode: string;
  title: string;
  description: string;
  prerequisite: string | null;
  prereqTree: PrerequisiteTree | null;
  fulfillRequirements: string[];
  semesterData: number[];
};
```

### Edge Cases / Type Errors

| Case                                 | Expected Behaviour                         |
| ------------------------------------ | ------------------------------------------ |
| Invalid module code                  | Display user-friendly error                |
| Missing prerequisite field           | Treat module as having no prerequisites    |
| API timeout                          | Show retry/error state                     |
| Inconsistent prerequisite formatting | Send text through preprocessing step       |
| Duplicate API calls                  | Use cache or memoization where appropriate |

### Milestone 2 Success Criteria

* User can enter a valid module code
* System fetches real module information
* System displays module code, title, description, and prerequisite text
* Invalid module codes do not crash the app

---

## Feature 2: Module Search and View

### Overview

The search interface is the main entry point of the application. Users search for a module code and receive structured module information before viewing the graph.

### Responsibilities

The search and detail view should:

* Accept module code input
* Standardise casing, for example `cs2040s` → `CS2040S`
* Trigger module data fetching
* Display loading, success, and error states
* Show selected module metadata clearly

### UI States

```mermaid
stateDiagram-v2
    [*] --> Empty
    Empty --> Loading: User searches module
    Loading --> Success: Valid module found
    Loading --> Error: Invalid module/API failure
    Error --> Loading: User retries
    Success --> Loading: User searches another module
```

### Displayed Information

The module detail card should display:

* Module code
* Module title
* Module description
* Raw prerequisite string
* Semester of the module (or both sems if available)

### Milestone 1 Success Criteria

* Search input accepts a module code
* Search triggers data fetch
* Module details render correctly
* Loading state appears during fetch
* Error state appears for invalid input

---

## Feature 3: Recursive Dependency Graph Engine

### Overview

The Recursive Dependency Graph Engine is the core technical component of NUS-Tree. It converts prerequisite relationships into graph nodes and edges.

A selected target module becomes the root node. Its prerequisites become child nodes. Those child nodes may themselves have prerequisites, forming a multi-level dependency graph.

### Graph Model

NUS-Tree models modules as a directed graph:

```text
Prerequisite Module → Target Module
```

For example:

```text
CS1010 → CS2040 → CS3230
```

### Graph Diagram

```mermaid
graph TD
    CS1010[CS1010 / Programming Methodology] --> CS2040[CS2040 / Data Structures and Algorithms]
    CS1231S[CS1231S / Discrete Structures] --> CS2040
    CS2040 --> CS3230[CS3230 / Design and Analysis of Algorithms]
    CS1231S[CS1231S / Discrete Structures] --> CS3230
```

### Responsibilities

The graph engine should:

* Create graph nodes for each module
* Create directed edges for prerequisite relationships
* Expand prerequisite chains recursively
* Deduplicate repeated modules
* Prevent infinite recursion
* Support depth limits for performance
* Return graph data in a React Flow-compatible format

### Algorithm Sketch

```ts
function buildPrerequisiteGraph(moduleCode: string, visited = new Set()) {
  if (visited.has(moduleCode)) {
    return;
  }

  visited.add(moduleCode);

  const module = fetchModule(moduleCode);
  const prerequisites = parsePrerequisites(module.prerequisite);

  for (const prereq of prerequisites) {
    addNode(prereq);
    addEdge(prereq, moduleCode);
    buildPrerequisiteGraph(prereq, visited);
  }
}
```

### Graph Output Format

```ts
type GraphNode = {
  id: string;
  type?: string;
  data: {
    label: string;
    moduleCode: string;
    title?: string;
  };
  position: {
    x: number;
    y: number;
  };
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
};
```

### Milestone 1 Scope

For Milestone 1, the graph may support only one prerequisite level.

### Milestone 2 Scope

For Milestone 2, the graph should support full recursive traversal across multiple prerequisite levels.

### Success Criteria

| Requirement          | Criteria                                                      |
| -------------------- | ------------------------------------------------------------- |
| Node generation      | Every module in the dependency chain becomes exactly one node |
| Edge generation      | Every prerequisite relationship becomes a directed edge       |
| Deduplication        | Shared prerequisites do not appear multiple times             |
| Cycle protection     | Recursive traversal does not loop infinitely                  |
| Render compatibility | Output can be rendered by React Flow                          |

---

## Feature 4: Unlocks View / Reverse Dependency Engine

### Overview

The Unlocks View answers the reverse question:

> “If I take this module, what future modules does it unlock?”

This is useful for students deciding whether a foundation module is valuable for future academic paths.

### Concept

The normal prerequisite graph follows:

```text
Prerequisite → Module
```

The Unlocks View follows:

```text
Module → Future modules unlocked by this module
```


### Responsibilities

The Unlocks Engine:

* Reads each module's NUSMods `fulfillRequirements` list
* Traverses outward to find indirect unlocks
* Renders unlock relationships as a graph
* Allows switching between Prerequisite View and Unlocks View

### Algorithm Sketch

```ts
function buildUnlockGraph(moduleCode: string) {
  const queue = [moduleCode];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    const module = await fetchModule(current);
    for (const unlockedModule of module.fulfillRequirements ?? []) {
      if (!visited.has(unlockedModule)) {
        visited.add(unlockedModule);
        addEdge(current, unlockedModule);
        queue.push(unlockedModule);
      }
    }
  }
}
```

### Success Criteria

| Requirement      | Criteria                                              |
| ---------------- | ----------------------------------------------------- |
| Direct unlocks   | Shows modules that directly require selected module   |
| Indirect unlocks | Shows future modules unlocked through chains          |
| Reverse edges    | Edges point from selected module to unlocked modules  |
| View toggle      | User can switch between prerequisite and unlock views |
| Accuracy         | No unrelated modules appear in the unlock graph       |

---

## Feature 5: Prerequisite Logic Resolution

### Overview

Some module prerequisites are not simple lists of modules. They may include logical conditions such as AND, OR, and nested requirements.

Example:

```text
CS2040 and (CS2100 or EE2024)
```

NUS-Tree primarily resolves NUSMods' structured `prereqTree`. When structured data is unavailable, it falls back to extracting module codes from prerequisite text.

### Supported Logic

| Type             | Example                         | Meaning                              |
| ---------------- | ------------------------------- | ------------------------------------ |
| Simple module    | `CS2040S`                        | One required module                  |
| AND condition    | `CS2040S and CS2100`             | Both modules required                |
| OR condition     | `CS2040S or CS2040S`             | Either module accepted               |
| Nested condition | `CS2040S and (CS2100 or EE2024)` | Required module plus one alternative |

### Parser Pipeline

```mermaid
flowchart LR
    A[NUSMods prereqTree] --> B[Resolve and/or/nOf groups]
    B --> C[Prompt for valid alternatives]
    C --> D[Graph nodes and ALL/ANY edges]
```

### AST Model

```ts
type PrerequisiteAST =
  | string
  | { and: PrerequisiteAST[] }
  | { or: PrerequisiteAST[] }
  | { nOf: [number, PrerequisiteAST[]] };
```

### Example AST

Input:

```text
CS2040 and (CS2100 or EE2024)
```

Output:

```json
{
  "and": [
    "CS2040",
    { "or": ["CS2100", "EE2024"] }
  ]
}
```

### Success Criteria

| Requirement         | Criteria                                      |
| ------------------- | --------------------------------------------- |
| Structured groups   | `and`, `or`, and `nOf` are resolved correctly |
| Nested requirements | Compound branches retain their grouping       |
| Alternatives        | Users choose valid OR/n-of options            |
| Missing structure   | Module codes are extracted from fallback text |

---

## Feature 6: Graph Visualisation System

### Overview

The Graph Visualisation System renders dependency data using React Flow.

This layer is responsible for making the technical graph understandable and usable for students.

### Responsibilities

The graph UI should support:

* Node rendering
* Edge rendering
* Zooming
* Panning
* Node clicking
* Selected path highlighting
* View switching between prerequisites and unlocks
* Large graph readability improvements

### Rendering Flow

```mermaid
flowchart TD
    A[Graph Builder Output] --> B[React Flow Nodes]
    A --> C[React Flow Edges]
    B --> D[Graph Canvas]
    C --> D
    D --> E[Interactive User View]
```

### Node Types

| Node Type | Description                                      |
| --------- | ------------------------------------------------ |
| Module    | A course used as a target, prerequisite, or unlock |
| Note      | An editable reminder placed on the canvas        |

Target, prerequisite, unlock, and warning states are represented through node data, colors, and edge direction rather than separate node types.

### Success Criteria

| Requirement   | Criteria                                            |
| ------------- | --------------------------------------------------- |
| Graph renders | Nodes and edges appear correctly                    |
| Interaction   | User can zoom, pan, and click nodes                 |
| View update   | Graph updates when module changes                   |
| Readability   | Nodes are not excessively overlapping               |
| Stability     | Graph does not crash for empty prerequisite modules |

---

## Feature 7: Semester Availability Overlay

### Overview

Semester availability affects whether a student can actually follow a planned module path.

A module may be available in:

* Semester 1 only
* Semester 2 only
* Both semesters
* Unknown / not currently offered

### Data Model

```ts
type SemesterAvailability = {
  availableSemesters: number[];
  assignedSemester?: "Y1S1" | "Y1S2" | "Y2S1" | "Y2S2" |
    "Y3S1" | "Y3S2" | "Y4S1" | "Y4S2";
};
```

### Visual Encoding

| State                    | Visual Meaning                              |
| ------------------------ | ------------------------------------------- |
| Assigned semester       | Module appears in the four-year plan grid   |
| Unavailable assignment  | Study-plan warning for the selected term    |
| Invalid prerequisite order | Study-plan warning for same/later prerequisite |
| Unassigned              | Module appears in the Unassigned group      |

### Purpose

This feature helps students avoid plans that are logically valid but practically impossible due to semester sequencing.

### Success Criteria

| Requirement             | Criteria                                    |
| ----------------------- | ------------------------------------------- |
| Availability extraction | Semester data is extracted from module data |
| Plan summary            | Modules are grouped from Y1S1 through Y4S2  |
| Planning usefulness     | Students can identify semester-only modules |
| Graceful fallback       | Missing availability does not crash graph   |

---

## Feature 8: NUSMods JSON Import and Plan Validation

### Overview

This feature allows users to import their NUSMods plan and compare their planned modules against prerequisite requirements.

### Workflow

```mermaid
flowchart TD
    A[User uploads NUSMods JSON] --> B[Parse planned modules]
    B --> C[Map modules to semesters]
    C --> D[Compare against prerequisite graph]
    D --> E[Build planned module graph]
    D --> F[Flag missing or late prerequisites]
```

### Graph States

| State     | Meaning                                                |
| --------- | ------------------------------------------------------ |
| Planned   | Module imported into its assigned semester             |
| Valid     | Structured prerequisite expression is satisfied earlier |
| Invalid   | Required prerequisite is absent or not scheduled earlier |
| Completed | Optional imported codes count as already satisfied      |

### Success Criteria

| Requirement       | Criteria                                      |
| ----------------- | --------------------------------------------- |
| JSON import       | Valid NUSMods plan can be uploaded            |
| Module extraction | Planned modules are extracted correctly       |
| Semester ordering | Module order is checked against prerequisites |
| Missing detection | Missing prerequisites are flagged             |
| Graph annotation  | Node status is visually reflected             |

---

## Feature 9: Path Recommendation Engine

### Overview

The Path Recommendation Engine helps students recover when a planned path is blocked.

For example, if a student wants to take CS3230 but has not taken CS2040S, the system can identify the missing prerequisite path.

### Responsibilities

The engine should:

* Detect bottleneck modules
* Identify missing prerequisites
* Suggest a shortest valid path to a target module
* Suggest alternative modules with similar prerequisite roots

### Example Output

```text
Target Module: CS3230

Missing prerequisite:
- CS2040S

Suggested path:
CS1010 → CS2040S → CS3230
```

### Success Criteria

| Requirement              | Criteria                                          |
| ------------------------ | ------------------------------------------------- |
| Missing module detection | System identifies unavailable target modules      |
| Shortest path            | System suggests minimal prerequisite path         |
| Alternative path         | System suggests comparable modules where possible |
| Explanation              | Recommendation is understandable to user          |

---

# System Architecture

## High-Level Architecture

```mermaid
flowchart TD
    User[User] --> UI[Next.js UI Layer]
    UI --> Search[Module Search Component]
    UI --> GraphUI[React Flow Graph Canvas]

    Search --> API[Next.js API / Server Layer]
    API --> NUSMods[NUSMods API]
    NUSMods --> Normalize[Data Normalization Layer]

    Normalize --> Parser[Prerequisite Resolver]
    Parser --> GraphEngine[usePrereqTree Graph Builder]
    GraphEngine --> UnlockEngine[fulfillRequirements Traversal]
    GraphEngine --> GraphUI

    API --> Tests[node:test API Tests]
    GraphEngine --> Tests
    UI --> E2E[Playwright E2E Tests]
```

---

## Layered Architecture

```mermaid
flowchart TB
    subgraph Presentation_Layer[Presentation Layer]
        A1[Module Search]
        A2[Module Detail Card]
        A3[Graph Canvas]
        A4[View Toggle]
        A5[Warning Panel]
    end

    subgraph Server_Data_Layer[Server and Data Layer]
        B1[Next.js Route Handlers]
        B2[NUSMods API Wrapper]
        B3[Response Normalizer]
        B4[Cache / Memoization Store]
    end

    subgraph Business_Logic_Layer[Business Logic Layer]
        C1[usePrereqTree Resolver]
        C2[Recursive Graph Traversal]
        C3[Unlocks Traversal]
        C4[Tree Layout]
        C5[Plan Import and Validation]
    end

    subgraph Testing_Layer[Testing Layer]
        D1[node:test]
        D2[Planned React Testing Library]
        D3[Playwright]
        D4[GitHub Actions]
    end

    Presentation_Layer --> Server_Data_Layer
    Server_Data_Layer --> Business_Logic_Layer
    Business_Logic_Layer --> Presentation_Layer
    Testing_Layer -. validates .-> Presentation_Layer
    Testing_Layer -. validates .-> Server_Data_Layer
    Testing_Layer -. validates .-> Business_Logic_Layer
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Next.js UI
    participant API as Next.js Server Route
    participant N as NUSMods API
    participant P as Prerequisite Resolver
    participant G as Graph Engine
    participant R as React Flow

    U->>UI: Enter module code
    UI->>API: Request module data
    API->>N: Fetch module JSON
    N-->>API: Return raw module data
    API->>API: Normalize response
    API-->>UI: Return clean module object
    UI->>P: Resolve structured prereqTree
    P-->>G: Return selected prerequisite list
    G-->>R: Generate nodes and edges
    R-->>U: Display interactive graph
```

---

# Technical Design

## Full-Stack Framework Choice

NUS-Tree uses **Next.js as a full-stack framework**, using it for:

* Server-side API abstraction
* Route handlers
* Data preprocessing
* Daily upstream response caching
* Deployment through Vercel

This design reduces the need for a separate backend during early development while still allowing clean separation between frontend, server logic, and business logic.

---

## Repository Structure

```text
nus-tree/
├── app/
│   ├── api/{module,templates}/
│   ├── Explore/
│   ├── Tree/
│   ├── layout.js
│   └── page.js
├── components/
│   ├── Explore/
│   ├── Tree/
│   ├── ModuleNode.js
│   └── NoteNode.js
├── hooks/
│   ├── usePrereqTree.js
│   ├── useEdgeHighlighting.js
│   └── useTreePersistence.js
├── lib/
│   ├── treeFlowConfig.js
│   ├── treeLayout.js
│   ├── treeStorage.js
│   └── templates.js
├── tests/
│   ├── unit/moduleRoute.test.js
│   └── e2e/navigation.spec.js
├── custom-templates/
├── .github/workflows/ci.yml
├── README.md
├── package.json
└── playwright.config.js
```

---

# Data Model

## Module Data

```ts
type Module = {
  moduleCode: string;
  title: string;
  description: string;
  prerequisite: string | null;
  prereqTree: PrerequisiteAST | null;
  fulfillRequirements: string[];
  semesterData: number[];
};
```

## Prerequisite AST

```ts
type PrerequisiteAST =
  | string
  | { and: PrerequisiteAST[] }
  | { or: PrerequisiteAST[] }
  | { nOf: [number, PrerequisiteAST[]] };
```

## Graph Data

```ts
type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

type GraphNode = {
  id: string;
  type: "module" | "note";
  data: {
    courseCode?: string;
    courseName?: string;
    description?: string;
    semester?: string;
    availableSemesters?: number[];
    text?: string;
  };
  position: { x: number; y: number };
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  data?: { requirement?: "all" | "any" };
};
```

---

# Algorithms

## Recursive Prerequisite Traversal

Used to build the dependency graph from a target module.

```mermaid
flowchart TD
    A[Start with target module] --> B[Fetch module data]
    B --> C[Resolve structured prereqTree or fallback text]
    C --> D{Has prerequisites?}
    D -- No --> E[Return leaf node]
    D -- Yes --> F[Add prerequisite nodes]
    F --> G[Add edges to target]
    G --> H[Repeat recursively for each prerequisite]
    H --> I{Already visited?}
    I -- Yes --> J[Skip to prevent cycle]
    I -- No --> B
```

## Reverse Unlock Traversal

Used to build the Unlocks View.

```mermaid
flowchart TD
    A[Start with selected module] --> B[Read fulfillRequirements]
    B --> C[Fetch directly unlocked modules]
    C --> D[Add unlock nodes]
    D --> E[Add edges from selected module]
    E --> F[Continue BFS through unlocked modules]
    F --> G[Return unlock graph]
```

---

# Software Engineering Practices

## 1. Modular Architecture

NUS-Tree is divided into clear layers:

1. **Presentation Layer**

   Handles user interface, search, graph rendering, and interaction.

2. **Server/Data Layer**

   Handles NUSMods API requests, response normalization, and server-side abstractions.

3. **Business Logic Layer**

   Handles parsing, graph building, unlock traversal, and plan validation.

4. **Testing Layer**

   Uses API unit tests and Playwright smoke tests; dedicated component coverage is planned.

This separation makes the system easier to maintain and test.

---

## 2. Separation of Concerns

Each module has a narrow responsibility, so files are organised by responsibility:


| File / Component       | Responsibility                                      |
| ---------------------- | --------------------------------------------------- |
| `app/api/module/route.js` | Fetch and normalize NUSMods module data          |
| `hooks/usePrereqTree.js`  | Resolve prerequisite/unlock trees and build graphs |
| `lib/treeLayout.js`       | Arrange, align, and shuffle graph nodes           |
| `lib/treeStorage.js`      | Persist, export, import, and validate plans        |
| `app/Tree/page.js`        | Coordinate the React Flow planning workspace       |
| `StudyPlanModal.js`       | Summarise semesters and display planning warnings  |

---

## 3. Test-Driven Development for Parser Logic

The prerequisite parser is one of the highest-risk parts of the project because prerequisite strings may contain ambiguous natural language and logical conditions.

Structured prerequisite resolution is implemented, but dedicated resolver coverage remains planned.

Before implementing a parser case, we will define expected outputs for examples such as:

```text
CS2040
CS2040 and CS2100
CS2040 or CS2040S
CS2040 and (CS2100 or EE2024)
```

---

## 4. Version Control Strategy

We use the following Github flow for version control:

```mermaid
gitGraph
    commit id: "Initial setup"
    branch feature/api-integration
    checkout feature/api-integration
    commit id: "Add NUSMods API wrapper"
    commit id: "Normalize module data"
    checkout main
    merge feature/api-integration
    branch feature/graph-builder
    checkout feature/graph-builder
    commit id: "Add graph builder"
    commit id: "Render React Flow graph"
    checkout main
    merge feature/graph-builder
```

Branching rules:

* `main` branch is protected
* Features are developed on separate branches
* Pull requests are required before merging
* At least one peer review is required
* CI checks must pass before merging

---

# Testing Plan

NUS-Tree currently uses two automated testing layers, with component tests planned:

1. Unit testing with Node's built-in test runner
2. End-to-end smoke testing with Playwright
3. Planned component testing with React Testing Library

---

## Testing Strategy Overview

```mermaid
flowchart TB
    A[Unit Tests - node:test] --> D[Confidence in API logic]
    B[Planned Component Tests] --> E[Confidence in UI]
    C[E2E Tests - Playwright] --> F[Confidence in User Flow]

    D --> G[Safe Pull Request]
    E --> G
    F --> G
    G --> H[Merge to Main]
```

---

## Planned Unit Coverage

The current unit suite covers normalization and API-route errors in `tests/unit/moduleRoute.test.js`. The matrices below describe additional planned coverage.

### Component 1: Module API Route

| Test Case             | Input                             | Expected Result          | Pass Criteria             |
| --------------------- | --------------------------------- | ------------------------ | ------------------------- |
| Valid module response | Raw NUSMods JSON                  | Normalized module object | All required fields exist |
| Missing prerequisite  | Module with no prerequisite field | `prerequisite: null`     | Still works               |
| Missing semester data | Incomplete semester data          | Empty or fallback value  | Still works               |
| Invalid structure     | Malformed object                  | Error or safe fallback   | Error handled gracefully  |

### Component 2: Prerequisite Resolver

| Test Case        | Input                              | Expected Result   | Pass Criteria             |
| ---------------- | ---------------------------------- | ----------------- | ------------------------- |
| Simple module    | `CS2040`                           | Required leaf     | Module is included        |
| AND condition    | `{ and: [...] }`                   | All children      | Every child is included   |
| OR condition     | `{ or: [...] }`                    | Selected option   | Choice is preserved       |
| Nested condition | `{ and: [code, { or: [...] }] }`   | Grouped result    | Nesting remains accurate  |
| Missing tree     | Free-text prerequisite             | Fallback modules  | Resolver does not crash   |

### Component 3: Prerequisite Graph Traversal

| Test Case              | Input                     | Expected Result        | Pass Criteria      |
| ---------------------- | ------------------------- | ---------------------- | ------------------ |
| Single prerequisite    | Module with one prereq    | Two nodes, one edge    | Correct direction  |
| Multiple prerequisites | Module with two prereqs   | Three nodes, two edges | All edges present  |
| Shared prerequisite    | Two branches share module | One node reused        | No duplicate nodes |
| Empty prerequisite     | Module with no prereq     | One node               | No orphan edges    |
| Recursive graph        | Multi-level chain         | Full chain rendered    | Correct depth      |

### Component 4: Unlocks Traversal

| Test Case       | Input                          | Expected Result           | Pass Criteria                |
| --------------- | ------------------------------ | ------------------------- | ---------------------------- |
| Direct unlock   | Module required by another     | One unlock edge           | Correct reverse direction    |
| Indirect unlock | Multi-level unlock chain       | Full unlock path          | BFS returns expected modules |
| No unlocks      | Module not required elsewhere  | Single node / empty graph | No false modules             |
| Duplicate paths | Multiple routes to same module | One module node           | Deduplication works          |

### Component 5: Plan Import and Validation

| Test Case            | Input                               | Expected Result   | Pass Criteria             |
| -------------------- | ----------------------------------- | ----------------- | ------------------------- |
| Valid plan           | All prerequisites completed earlier | No warnings       | Correct validation        |
| Missing prerequisite | Required module absent              | Warning generated | Missing module identified |
| Wrong order          | Prereq planned after target         | Warning generated | Semester order checked    |
| Completed module     | Module already completed            | Mark completed    | Correct status            |

---

## Planned Component Testing: React Testing Library

### Component 1: `ModuleSearch`

| Behaviour           | Test Method        | Pass Criteria         |
| ------------------- | ------------------ | --------------------- |
| Renders input field | Render component   | Input visible         |
| Accepts module code | Simulate typing    | Input updates         |
| Submits search      | Simulate submit    | Callback triggered    |
| Normalizes casing   | Input `cs2040s`    | Search uses `CS2040S` |
| Handles empty input | Submit empty field | Error or no request   |

### Component 2: `ModuleCard`

| Behaviour               | Test Method              | Pass Criteria            |
| ----------------------- | ------------------------ | ------------------------ |
| Displays module code    | Render with mock data    | Code visible             |
| Displays title          | Render with mock data    | Title visible            |
| Displays description    | Render with mock data    | Description visible      |
| Handles no prerequisite | Render null prerequisite | Shows “No prerequisites” |
| Handles loading         | Render loading prop      | Loading state visible    |

### Component 3: `GraphCanvas`

| Behaviour     | Test Method            | Pass Criteria             |
| ------------- | ---------------------- | ------------------------- |
| Renders nodes | Pass mock nodes        | Nodes visible             |
| Renders edges | Pass mock edges        | Edges exist               |
| Empty graph   | Pass empty arrays      | Empty state visible       |
| Node click    | Simulate click         | Node detail callback runs |
| Graph update  | Rerender with new data | Old nodes replaced        |

### Component 4: `ViewToggle`

| Behaviour                 | Test Method    | Pass Criteria             |
| ------------------------- | -------------- | ------------------------- |
| Shows prerequisite mode   | Initial render | Correct label active      |
| Switches to unlock mode   | Click toggle   | Unlock mode active        |
| Calls handler             | Simulate click | Callback triggered        |
| Preserves selected module | Toggle view    | Selected module unchanged |

---

## End-to-End Testing: Playwright

The current suite contains navigation and workspace smoke tests. The feature-specific scenarios below remain planned.

### E2E Test 1: Valid Module Search

Steps:

1. Open the app
2. Enter `CS2040S`
3. Submit search
4. Wait for module data
5. Verify module details appear
6. Verify graph appears

Pass criteria:

* No page crash
* Module details visible
* Graph nodes visible
* Graph renders within acceptable time

### E2E Test 2: Invalid Module Code

Steps:

1. Open the app
2. Enter invalid module code
3. Submit search

Pass criteria:

* Error message shown
* App does not crash
* User can search again

### E2E Test 3: Prerequisite View to Unlocks View

Steps:

1. Search for a valid module
2. Wait for graph
3. Click Unlocks View toggle

Pass criteria:

* Unlock graph appears
* Graph changes from prerequisite mode
* No duplicate nodes appear

### E2E Test 4: NUSMods JSON Import

Steps:

1. Upload valid NUSMods JSON
2. Search for a module in the plan
3. Compare graph against planned modules

Pass criteria:

* JSON is parsed successfully
* Completed/planned modules are highlighted
* Missing prerequisites are flagged

---

## Performance Criteria

| Operation                 | Target                                       |
| ------------------------- | -------------------------------------------- |
| Module fetch              | Less than 1.5 seconds                        |
| One-level graph render    | Less than 2 seconds                          |
| Recursive graph expansion | Less than 3 seconds for typical module chain |
| View toggle               | Less than 300ms                              |
| JSON import validation    | Less than 3 seconds for typical plan         |

---

# CI/CD Plan

## CI/CD Overview

NUS-Tree uses GitHub Actions for CI and Vercel for deployment.

The goal of CI/CD is to ensure that all code merged into the main branch is:

* Tested
* Buildable
* Reviewable
* Safe to deploy

---

## CI/CD Flow

```mermaid
flowchart TD
    A[Developer pushes feature branch] --> B[Open Pull Request]
    B --> C[GitHub Actions Triggered]
    C --> D[Install Dependencies]
    D --> E[Run node:test Unit Tests]
    E --> F[Run Next.js Build]
    F --> G[Install Chromium]
    G --> H[Run Playwright E2E Tests]
    H --> J{All Checks Pass?}
    J -- No --> K[Block Merge]
    J -- Yes --> L[Peer Review]
    L --> M{Approved?}
    M -- No --> N[Request Changes]
    M -- Yes --> O[Merge to Main]
    O --> P[Deploy to Vercel]
```

---

## GitHub Actions Workflow

The repository includes a CI workflow at `.github/workflows/ci.yml`.
The current workflow runs:

* Install dependencies with `npm ci`.
* Run unit tests with `npm run test`.
* Build the Next.js app with `npm run build`.
* Install Chromium and run `npm run test:e2e`.

```bash
npm ci
npm run test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

---



# Milestone Scope

These scopes are retained as project history; current implementation status is summarized in the Feature Overview.

## Milestone 1: Technical Proof of Concept

Status: complete.

Expected scope:

* NUSMods API integration
* Module search
* Module information display
* Basic one-level prerequisite graph
* Initial README
* Initial testing plan
* Project log

## Milestone 2: Prototype

Status: complete, with broader automated coverage still being expanded.

Expected scope:

* Recursive dependency graph
* Improved graph UI
* Unlocks View
* Expanded automated testing
* CI setup

## Milestone 3: Extended System

Status: in progress. Logic resolution, plan import, and semester planning are implemented; recommendations and full planned coverage remain.

Expected scope:

* Logic resolver
* NUSMods JSON import
* Semester availability overlay
* Path recommendation engine
* Full testing and deployment

---

# Risk Analysis

| Risk                                        | Impact | Mitigation                                                 |
| ------------------------------------------- | ------ | ---------------------------------------------------------- |
| Structured prerequisite data may be absent  | High   | Fall back to conservative module-code extraction           |
| Graph becomes too large                     | Medium | Use collapsing, lazy loading, and memoization              |
| NUSMods API response changes                | Medium | Use normalization layer to isolate API changes             |
| Recursive traversal becomes slow            | Medium | Use caching and visited sets                               |
| Unlock data depends on upstream accuracy    | Medium | Use NUSMods `fulfillRequirements` and handle empty results  |
| JSON import format is inconsistent          | Medium | Validate schema and provide user-friendly errors           |
| Feature coverage remains incomplete         | Medium | Expand node:test and Playwright coverage progressively      |
| Team falls behind timeline                  | Medium | Track progress weekly and adjust scope early               |

---

# Setup Instructions

## Prerequisites

Install:

* Node.js 20+
* npm
* Git

## Clone Repository

```bash
git clone https://github.com/arav31/NUS-Tree.git
cd NUS-Tree
```

## Install Dependencies

```bash
npm ci
```

## Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Verification Commands

## Run Production Build

```bash
npm run build
```

## Testing Commands

### Run Unit Tests

```bash
npm run test
```

### Run End-to-End Tests

```bash
npx playwright install chromium
npm run test:e2e
```
