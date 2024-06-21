import React from 'react';
import './Logs.css';

const Logs = ({ logEntries }) => {
  return (
    <div className="logs">
      <h2>Logs</h2>
      <ul>
        {logEntries.map((entry, index) => (
          <li key={index}>
            {entry.time} - {entry.action}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Logs;
