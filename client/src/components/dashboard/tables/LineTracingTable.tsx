import React from 'react';
import { type Attempt } from '../../../types/challenge.types';

const LineTracingTable: React.FC<{ attempts: Attempt[] }> = ({ attempts }) => (
  <table className="attempts-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Score</th>
        <th>Completion Time</th>
        <th>Distance</th>
        <th>Penalties</th>
      </tr>
    </thead>
    <tbody>
      {attempts.map(a => (
        <tr key={a._id}>
          <td>{new Date(a.createdAt).toLocaleDateString()}</td>
          <td>{a.score.toLocaleString()}</td>
          <td>{a.completionTime.toFixed(1)}s</td>
          <td>{(a.accuracy * 100).toFixed(1)}%</td> {/* Distance */}
          <td>{a.penalties ?? 0}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
export default LineTracingTable;