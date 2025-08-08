import React, { useState } from 'react';


const RoleSelector = ({ onRoleSelect }) => {
  const [customRole, setCustomRole] = useState("");

  const handleSelect = (event) => {
    onRoleSelect(event.target.value);
  };

  const handleCustomRoleChange = (event) => {
    setCustomRole(event.target.value);
  };

  const handleCustomRoleSubmit = (e) => {
    e.preventDefault();
    if (customRole.trim()) {
      onRoleSelect(customRole.trim());
    }
  };

  return (
    <div>
      <h2>Select Target Role</h2>
      <select onChange={handleSelect}>
        <option value="">Select a role...</option>
        <option value="swe-google">Software Engineer at Google</option>
        <option value="data-scientist-netflix">Data Scientist at Netflix</option>
        <option value="ml-engineer-openai">ML Engineer at OpenAI</option>
      </select>
      <form onSubmit={handleCustomRoleSubmit} style={{ marginTop: '12px' }}>
        <label htmlFor="customRole">Or enter a custom role:</label>
        <input
          id="customRole"
          type="text"
          value={customRole}
          onChange={handleCustomRoleChange}
          placeholder="e.g. Frontend Developer at Spotify"
          style={{ marginLeft: '8px' }}
        />
        <button type="submit" style={{ marginLeft: '8px' }}>Submit</button>
      </form>
    </div>
  );
};

export default RoleSelector;
