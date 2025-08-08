import React, { useState } from 'react';
import axios from 'axios';
import ResumeUpload from './components/ResumeUpload';
import RoleSelector from './components/RoleSelector';
import GraphViewer from './components/GraphViewer';
import PlanViewer from './components/PlanViewer';
import ExportButton from './components/ExportButton';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

function App() {
  const [parsedSkills, setParsedSkills] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [skillGaps, setSkillGaps] = useState(null);
  const [skillGraph, setSkillGraph] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);

  const handleRoleSelect = async (targetRole) => {
    if (!parsedSkills) {
      alert('Please parse a resume first.');
      return;
    }
    setSelectedRole(targetRole);
    try {
      const response = await axios.post('http://localhost:8000/compare_skills', {
        current_skills: parsedSkills.skills,
        target_role: targetRole,
      });
      setSkillGaps(response.data.skill_gaps);
      setSkillGraph(response.data.skill_graph);
    } catch (error) {
      console.error('Error comparing skills:', error);
      alert('Failed to compare skills.');
    }
  };

  const generatePlan = async () => {
    if (!skillGaps) {
      alert('Please compare skills first to identify gaps.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/generate_plan', {
        skill_gaps: skillGaps,
      });
      setStudyPlan(response.data.study_plan);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate study plan.');
    }
  };


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: darkTheme.palette.background.paper }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
            <Box flex={1} minWidth={320}>
              <Typography variant="h3" color="primary" gutterBottom fontWeight={700}>
                SkillGraph AI
              </Typography>
              <ResumeUpload setParsedSkills={setParsedSkills} />
              <RoleSelector onRoleSelect={handleRoleSelect} />
              <Button
                variant="contained"
                color="primary"
                onClick={generatePlan}
                disabled={!skillGaps}
                sx={{ mt: 2, fontWeight: 600 }}
              >
                Generate Study Plan
              </Button>
            </Box>
            <Box flex={2} minWidth={320}>
              <GraphViewer skillGraph={skillGraph} />
              <PlanViewer studyPlan={studyPlan} />
              <ExportButton studyPlan={studyPlan} />
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
