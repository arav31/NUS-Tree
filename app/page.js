'use client';
import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('CS2040S');
  const [module, setModule] = useState(null);
  const [error, setError] = useState('');

  async function findModule(event) {
    event.preventDefault();
    setError('');
    setModule(null);

    const response = await fetch(`/api/module?code=${encodeURIComponent(code)}`);
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'No such module, are you searching for an NTU Mod?');
      return;
    }
    setModule(data);
  }

  return (
    <main className="page">
      {/* 1. Overview Section */}
      <section className="intro">
        <h2>NUS Tree: Welcome to Your Academic Planner! 🥳 (🚧WIP🚧)</h2>
        <p className="summary">
          Hello! We're here to help you map out your journey at the National University of Singapore. Whether you're planning your AI specialization or coordinating your minor, this tool is designed to make your academic path clear and manageable.
        </p>
      </section>

      {/* 2. Getting Started Section */}
      <section className="guide">
        <h2>Getting Started (🚧 Work in Progress 🚧)</h2>
        <ul>
          <li><strong>Infinite Canvas:</strong> Pan and zoom using your mouse or trackpad to explore your entire roadmap freely.</li>
          <li><strong>Auto-Alignment Engines:</strong> Use "Auto Topo Sort" to visualize dependencies or "Auto Align Grid" to keep your workspace tidy.</li>
          <li><strong>Node Selection:</strong> Click any module or note to highlight it and reveal its details in the bottom panel.</li>
          <li><strong>Adding Modules:</strong> Open the "Add Module" modal to input course details like code, name, description, and your target semester.</li>
          <li><strong>Adding Notes:</strong> Create sticky notes to jot down reminders, internship deadlines, or general study tips.</li>
          <li><strong>Dynamic Editing:</strong> You can update any course at any time. Just click a module and select "Edit" in the bottom panel to change details or reassign its semester.</li>
          <li><strong>Smart Arrows:</strong> Arrows indicate prerequisites, showing you exactly what needs to be completed before moving forward.</li>
          <li><strong>Dependency Spotlight:</strong> When you click a course, red animated arrows highlight your prerequisites, and green animated arrows show the future courses you are unlocking.</li>
          <li><strong>Reset View:</strong> Click the empty background to clear your highlights and return to the full view.</li>
          <li><strong>Semester Assignments:</strong> Assign each course to a specific semester (Y1S1 through Y4S2) to track your long-term progress.</li>
          <li><strong>Study Plan Popup:</strong> Click "View Study Plan" to see a clean, organized table of your entire 4-year schedule.(🚧WIP🚧)</li>
          <li><strong>Community Gallery:</strong> Visit the "Explore" page to browse, preview, and clone pre-made roadmaps—like the BComp AI Pathway—to get a head start.(🚧WIP🚧)</li>
        </ul>
      </section>

      {/* 3. Resources Section */}
      <section className="resources">
        <h2>Resources (🚧 Work in Progress 🚧)</h2>
        <div className="actions">
          <a href="https://nusmods.com/courses?sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4" target="_blank" rel="noreferrer">
            NUS Mods | Courses
          </a>
          <a href="https://www.comp.nus.edu.sg/programmes/ug/cs/curr/" target="_blank" rel="noreferrer">
            CS Degree Requirments
          </a>
        </div>
        <form onSubmit={findModule}>
          <label htmlFor="module-code">Module code</label>
          <input
            id="module-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="CS2040S"
          />
          <button type="submit">Load from NUSMods</button>
        </form>
        {error && <p role="alert">{error}</p>}
        {module && (
          <article>
            <h3>{module.moduleCode}: {module.title}</h3>
            <p>{module.description}</p>
            <p><strong>Prerequisite:</strong> {module.prerequisite || 'None'}</p>
            <p><strong>Semesters:</strong> {module.semesterData.join(', ') || 'Not listed'}</p>
          </article>
        )}
      </section>
    </main>
  );
}
