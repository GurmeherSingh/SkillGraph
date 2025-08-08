import React, { useEffect } from 'react';
import mermaid from 'mermaid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
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
    <Paper elevation={3} sx={{ p: 3, mb: 3, background: '#23272f', borderRadius: 3 }}>
      <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
        Skill Graph
      </Typography>
      {skillGraph ? (
        <div className="mermaid">{skillGraph}</div>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Your skill graph will appear here once you select a role.
        </Typography>
      )}
    </Paper>
  );
};

export default GraphViewer;
