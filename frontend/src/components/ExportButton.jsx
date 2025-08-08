import React from 'react';
import axios from 'axios';

const ExportButton = ({ studyPlan }) => {
  const handleExport = async () => {
    if (!studyPlan) {
      alert('No study plan to export.');
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
      alert('Failed to export PDF.');
    }
  };

  return (
    <div>
      <button onClick={handleExport} disabled={!studyPlan}>
        Export to PDF
      </button>
    </div>
  );
};

export default ExportButton;
