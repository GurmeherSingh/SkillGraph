import React, { useState } from 'react';
import axios from 'axios';

const ResumeUpload = ({ setParsedSkills }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      setSelectedFile(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleTextChange = (event) => {
    setPastedText(event.target.value);
  };

  const handleSubmit = async () => {
    setSuccess("");
    if (!selectedFile) {
      setError("Please upload a PDF resume.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/parse_resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setParsedSkills(response.data);
      setError("");
      setSuccess("Resume parsed successfully!");
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError(error.response?.data?.detail || 'Failed to parse resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Resume (PDF only)</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: '8px' }}>{success}</div>}
      <button onClick={handleSubmit} style={{ marginTop: '12px' }} disabled={loading}>
        {loading ? 'Uploading...' : 'Submit'}
      </button>
      {loading && (
        <div style={{ marginTop: '12px' }}>
          <span role="status" aria-live="polite">Parsing resume, please wait...</span>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
