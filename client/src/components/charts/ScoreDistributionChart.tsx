import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ScoreDistributionProps {
  attempts: any[]; // User attempts
}

const ScoreDistributionChart: React.FC<ScoreDistributionProps> = ({ attempts }) => {
  // Get scores for "Reaction Time"
  const reactionAttempts = attempts.filter(a => a.challengeType === 'Reaction Time');
  const scores = reactionAttempts.map(a => a.score);

  const chartData = {
    labels: reactionAttempts.map((_, i) => `Attempt ${i + 1}`),
    datasets: [
      {
        label: 'Reaction Time Score',
        data: scores,
        backgroundColor: '#2ecc71',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Score History' },
    },
  };

  return <Bar options={options} data={chartData} />;
};

export default ScoreDistributionChart;