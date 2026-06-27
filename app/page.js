export default function Home() {
  return (
    <main className="page">
      {/* 1. Overview Section */}
      <section className="intro">
        <h1>NUS Tree(🚧WIP🚧)</h1>
        <p className="summary">
          An interactive platform to visualize academic pathways and explore connections within the NUS ecosystem.
        </p>
      </section>

      {/* 2. Getting Started Section */}
      <section className="guide">
        <h2>Getting Started (🚧 Work in Progress 🚧)</h2>
        <p>Follow these steps to navigate the tree:</p>
        <ul>
          <li><strong>Explore:</strong> Browse nodes to see subject relationships.</li>
          <li><strong>Customize:</strong> Use the sidebar to filter your specific major.</li>
          <li><strong>Connect:</strong> Export your path to share with peers.</li>
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
      </section>
    </main>
  );
}
