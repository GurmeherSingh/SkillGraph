import React, { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

const ResumeUpload = ({ setParsedSkills }) => {
  const [selectedFile, setSelectedFile] = useState(null);
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
    <Paper elevation={3} sx={{ p: 3, mb: 3, background: '#23272f', borderRadius: 3 }}>
      <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
        Upload Resume (PDF only)
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <input type="file" accept=".pdf" onChange={handleFileChange} style={{ color: '#fff' }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Paper>
  );
};

export default ResumeUpload;
