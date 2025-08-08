import React from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const ExportButton = ({ studyPlan }) => {
  const handleExport = async () => {
    if (!studyPlan) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/export_plan_pdf',
        { study_plan: studyPlan },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'study_plan.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, background: '#23272f', borderRadius: 3, textAlign: 'center' }}>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleExport}
        disabled={!studyPlan}
        sx={{ fontWeight: 600 }}
      >
        Export to PDF
      </Button>
      {!studyPlan && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Generate a study plan to enable export.
        </Typography>
      )}
    </Paper>
  );
};

export default ExportButton;
