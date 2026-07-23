'use client';
import { useState } from 'react';
import Link from 'next/link';

const features = [
  { title: 'Infinite Canvas', description: 'Pan and zoom with your mouse or trackpad to explore your entire roadmap freely.' },
  { title: 'Auto-Alignment', description: 'Use "Auto Topo Sort" to visualize dependencies or "Auto Align Grid" to keep your workspace tidy.' },
  { title: 'Node Selection', description: 'Click any module or note to highlight it and reveal its details in the bottom panel.' },
  { title: 'Add Modules', description: 'Add a module manually, or load one straight from NUSMods with its prerequisites resolved automatically.' },
  { title: 'Sticky Notes', description: 'Jot down reminders, internship deadlines, or general study tips right on the canvas.' },
  { title: 'Dynamic Editing', description: 'Click a module and select "Edit" to update its details, color, or semester at any time.' },
  { title: 'Smart Arrows', description: 'Arrows indicate prerequisites, showing exactly what needs to be completed before moving forward.' },
  { title: 'Dependency Spotlight', description: 'Click a course to highlight its prerequisites in red and the courses it unlocks in green.' },
  { title: 'Semester Assignments', description: 'Assign each course to a specific semester (Y1S1 through Y4S2) to track your long-term progress.' },
  { title: 'Study Plan Summary', description: 'See a clean, organized table of your entire 4-year schedule.', soon: true },
  { title: 'Community Gallery', description: 'Browse, preview, and clone pre-made roadmaps like the BComp AI Pathway to get a head start.', soon: true },
];

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
      <section className="hero">
        <p className="badge">Beta · Built for NUS Students</p>
        <h1>Plan your NUS degree, visually.</h1>
        <p className="summary">
          Map out prerequisites, semesters, and electives on an interactive canvas.
          Whether you&apos;re planning an AI specialization or coordinating a minor,
          NUS Tree keeps your academic path clear and manageable.
        </p>
        <div className="actions">
          <Link href="/Tree">Open My Tree</Link>
          <Link href="/Explore">Browse Templates</Link>
        </div>
      </section>

      <section className="features">
        <h2>Getting Started</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <h3>
                {feature.title}
                {feature.soon && <span className="tag-soon">Soon</span>}
              </h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="resources">
        <h2>Resources</h2>
        <div className="resources-grid">
          <div className="resource-links">
            <a className="resource-link" href="https://nusmods.com/courses?sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4" target="_blank" rel="noreferrer">
              NUS Mods | Courses
            </a>
            <a className="resource-link" href="https://www.comp.nus.edu.sg/programmes/ug/cs/curr/" target="_blank" rel="noreferrer">
              CS Degree Requirements
            </a>
          </div>

          <div className="lookup-card">
            <h3>Quick Module Lookup</h3>
            <form className="lookup-form" onSubmit={findModule}>
              <label htmlFor="module-code" className="visually-hidden">Module code</label>
              <input
                id="module-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="CS2040S"
              />
              <button type="submit">Look up</button>
            </form>
            {error && <p role="alert" className="lookup-error">{error}</p>}
            {module && (
              <article className="lookup-result">
                <h3>{module.moduleCode}: {module.title}</h3>
                <p>{module.description}</p>
                <p><strong>Prerequisite:</strong> {module.prerequisite || 'None'}</p>
                <p><strong>Semesters:</strong> {module.semesterData.join(', ') || 'Not listed'}</p>
              </article>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
