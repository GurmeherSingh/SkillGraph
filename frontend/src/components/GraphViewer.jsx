import React, { useEffect } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'monospace',
});

const GraphViewer = ({ skillGraph }) => {
  useEffect(() => {
    if (skillGraph) {
      const mermaidContainer = document.querySelector('.mermaid');
      if (mermaidContainer) {
        mermaidContainer.innerHTML = skillGraph;
        mermaid.run({
            nodes: document.querySelectorAll('.mermaid'),
        });
      }
    }
  }, [skillGraph]);

  return (
    <div>
      <h2>Skill Graph</h2>
      {skillGraph ? (
        <div className="mermaid">{skillGraph}</div>
      ) : (
        <p>Your skill graph will appear here once you select a role.</p>
      )}
    </div>
  );
};

export default GraphViewer;
