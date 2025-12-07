import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ActivityChartProps {
  data: { _id: string; count: number }[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d._id),
    datasets: [
      {
        label: 'Attempts per Day',
        data: data.map(d => d.count),
        borderColor: '#646cff',
        backgroundColor: 'rgba(100, 108, 255, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '30-Day Activity' },
    },
  };

  return <Line options={options} data={chartData} />;
};

export default ActivityChart;