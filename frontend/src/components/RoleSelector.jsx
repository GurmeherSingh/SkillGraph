import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';

const RoleSelector = ({ onRoleSelect }) => {
  const [customRole, setCustomRole] = useState("");
  const [selected, setSelected] = useState("");

  const handleSelect = (event) => {
    setSelected(event.target.value);
    onRoleSelect(event.target.value);
  };

  const handleCustomRoleChange = (event) => {
    setCustomRole(event.target.value);
  };

  const handleCustomRoleSubmit = (e) => {
    e.preventDefault();
    if (customRole.trim()) {
      setSelected("");
      onRoleSelect(customRole.trim());
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, background: '#23272f', borderRadius: 3 }}>
      <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
        Select Target Role
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="role-select-label" sx={{ color: '#90caf9' }}>Choose a role</InputLabel>
        <Select
          labelId="role-select-label"
          value={selected}
          label="Choose a role"
          onChange={handleSelect}
          sx={{ color: '#fff', background: '#23272f' }}
        >
          <MenuItem value="">Select a role...</MenuItem>
          <MenuItem value="swe-google">Software Engineer at Google</MenuItem>
          <MenuItem value="data-scientist-netflix">Data Scientist at Netflix</MenuItem>
          <MenuItem value="ml-engineer-openai">ML Engineer at OpenAI</MenuItem>
        </Select>
      </FormControl>
      <Box component="form" onSubmit={handleCustomRoleSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          id="customRole"
          label="Or enter a custom role"
          variant="outlined"
          value={customRole}
          onChange={handleCustomRoleChange}
          placeholder="e.g. Frontend Developer at Spotify"
          sx={{ flex: 1, background: '#23272f' }}
          InputLabelProps={{ style: { color: '#90caf9' } }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 600 }}>
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default RoleSelector;
