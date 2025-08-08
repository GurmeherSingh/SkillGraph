import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';

const PlanViewer = ({ studyPlan }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, background: '#23272f', borderRadius: 3 }}>
      <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
        Your 6-Month Study Roadmap
      </Typography>
      {studyPlan ? (
        <Box className="study-plan" sx={{ mt: 2 }}>
          {Object.entries(studyPlan).map(([week, details]) => (
            <Paper key={week} elevation={1} sx={{ p: 2, mb: 2, background: '#1a1d22', borderRadius: 2 }}>
              <Typography variant="h6" color="primary" fontWeight={500} gutterBottom>
                {week}
              </Typography>
              <Chip label={details.focus} color="info" sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Time Commitment:</strong> {details.time_commitment}
              </Typography>
              <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>Resources:</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {details.resources.map((resource, index) => (
                  <li key={index}>
                    <Link href={resource.url} target="_blank" rel="noopener" underline="hover" color="secondary">
                      {resource.name}
                    </Link>
                  </li>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Your study plan will appear here once generated.
        </Typography>
      )}
    </Paper>
  );
};

export default PlanViewer;
