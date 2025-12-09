import React from 'react';
import { type Attempt } from '../../../types/challenge.types';

const ReactionTimeTable: React.FC<{ attempts: Attempt[] }> = ({ attempts }) => (
  <table className="attempts-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Score</th>
        <th>Mode</th>
        <th>Speed</th>
        <th>NTPM</th>
        <th>Avg Accuracy</th>
      </tr>
    </thead>
    <tbody>
      {attempts.map(a => (
        <tr key={a._id}>
          <td>{new Date(a.createdAt).toLocaleDateString()}</td>
          <td>{a.score.toLocaleString()}</td>
          <td>{a.settings?.mode || 'Normal'}</td>
          <td>{a.settings?.speed || '-'}</td>
          <td>{a.ntpm}</td>
          <td>{a.averageClickAccuracy ? (a.averageClickAccuracy * 100).toFixed(1) + '%' : '-'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
export default ReactionTimeTable;