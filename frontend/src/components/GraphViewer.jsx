import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import svgPanZoom from 'svg-pan-zoom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, Roboto, Arial, sans-serif',
});

const GraphViewer = ({ skillGraph }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (skillGraph && graphRef.current) {
      graphRef.current.innerHTML = skillGraph;
      mermaid.run({ nodes: [graphRef.current] });
      // Wait for Mermaid to render SVG, then apply svg-pan-zoom
      setTimeout(() => {
        const svg = graphRef.current.querySelector('svg');
        if (svg) {
          svgPanZoom(svg, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.2,
            maxZoom: 5,
            panEnabled: true,
            dblClickZoomEnabled: false,
            mouseWheelZoomEnabled: true,
          });
        }
      }, 100);
    }
  }, [skillGraph]);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, background: '#23272f', borderRadius: 3 }}>
      <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
        Skill Graph
      </Typography>
      {skillGraph ? (
        skillGraph.startsWith('%% Error:') ? (
          <Typography variant="body2" color="error">
            Sorry, there was an error generating your skill graph. Please try again or adjust your skills/role.
          </Typography>
        ) : (
          <div
            ref={graphRef}
            className="mermaid"
            style={{ width: '100%', minHeight: 400, overflow: 'auto', cursor: 'default', background: '#181a20', borderRadius: 8 }}
            title="Scroll to zoom, drag to pan"
          />
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          Your skill graph will appear here once you select a role.
        </Typography>
      )}
    </Paper>
  );
};

export default GraphViewer;
