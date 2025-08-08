import React, { useState } from 'react';
import axios from 'axios';

const ResumeUpload = ({ setParsedSkills }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTextChange = (event) => {
    setPastedText(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedFile && !pastedText) {
      alert('Please upload a file or paste resume text.');
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    } else {
      const blob = new Blob([pastedText], { type: 'text/plain' });
      formData.append('file', blob, 'resume.txt');
    }

    try {
      const response = await axios.post('http://localhost:8000/parse_resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setParsedSkills(response.data);
      alert('Resume parsed successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to parse resume.');
    }
  };

  return (
    <div>
      <h2>Upload Resume</h2>
      <input type="file" onChange={handleFileChange} />
      <textarea
        placeholder="Or paste your resume here..."
        value={pastedText}
        onChange={handleTextChange}
      ></textarea>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default ResumeUpload;
