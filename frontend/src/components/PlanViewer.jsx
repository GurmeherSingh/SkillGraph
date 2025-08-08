import React from 'react';

const PlanViewer = ({ studyPlan }) => {
  return (
    <div>
      <h2>Your 6-Month Study Roadmap</h2>
      {studyPlan ? (
        <div className="study-plan">
          {Object.entries(studyPlan).map(([week, details]) => (
            <div key={week} className="plan-module">
              <h3>{week}</h3>
              <p><strong>Focus:</strong> {details.focus}</p>
              <p><strong>Time Commitment:</strong> {details.time_commitment}</p>
              <h4>Resources:</h4>
              <ul>
                {details.resources.map((resource, index) => (
                  <li key={index}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      {resource.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>Your study plan will appear here once generated.</p>
      )}
    </div>
  );
};

export default PlanViewer;
