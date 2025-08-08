import React from 'react';

const RoleSelector = ({ onRoleSelect }) => {
  const handleSelect = (event) => {
    onRoleSelect(event.target.value);
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
    </div>
  );
};

export default RoleSelector;
