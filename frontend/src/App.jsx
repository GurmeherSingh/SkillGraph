import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ResumeUpload from './components/ResumeUpload';
import RoleSelector from './components/RoleSelector';
import GraphViewer from './components/GraphViewer';
import PlanViewer from './components/PlanViewer';
import ExportButton from './components/ExportButton';

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
    <div className="App">
      <header className="App-header">
        <h1>SkillGraph AI</h1>
      </header>
      <main>
        <div className="container">
          <div className="left-panel">
            <ResumeUpload setParsedSkills={setParsedSkills} />
            <RoleSelector onRoleSelect={handleRoleSelect} />
            <button onClick={generatePlan} disabled={!skillGaps}>Generate Study Plan</button>
          </div>
          <div className="right-panel">
            <GraphViewer skillGraph={skillGraph} />
            <PlanViewer studyPlan={studyPlan} />
            <ExportButton studyPlan={studyPlan} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
