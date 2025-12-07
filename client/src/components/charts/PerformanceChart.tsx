import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { type Attempt } from '../../types/challenge.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PerformanceChartProps {
  attempts: Attempt[];
  challengeName: string;
  days: number | 'all';
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ attempts, challengeName, days }) => {

  // Group by Day and find Peak Score
  const chartData = useMemo(() => {
    // Filtering by date first
    const cutoffDate = new Date();
    if (days !== 'all') {
        cutoffDate.setDate(cutoffDate.getDate() - (typeof days === 'number' ? days : 30));
    }

    const filtered = attempts.filter(a => {
        const attemptDate = new Date(a.createdAt);
        return days === 'all' || attemptDate >= cutoffDate;
    });

    // Grouping by date in the standard year-mon-day format
    const groupedByDate: Record<string, number> = {};

    filtered.forEach(attempt => {
        const dateKey = new Date(attempt.createdAt).toLocaleDateString();
        // To keep it clean I am going to just take the max score of the day.
        if (!groupedByDate[dateKey] || attempt.score > groupedByDate[dateKey]) {
            groupedByDate[dateKey] = attempt.score;
        }
    });

    // Sort dates
    const labels = Object.keys(groupedByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const dataPoints = labels.map(date => groupedByDate[date]);

    return {
        labels,
        datasets: [
            {
                label: `Daily Peak Score (${challengeName})`,
                data: dataPoints,
                backgroundColor: '#0070c1',
                borderRadius: 4,
                hoverBackgroundColor: '#005a9e',
            },
        ],
    };
  }, [attempts, days, challengeName]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hiding legend for aesthetics
      title: {
          display: true,
          text: `Daily Peak Performance: ${challengeName}`,
          font: { size: 16 }
      },
      tooltip: {
          callbacks: {
              label: (context: any) => `Score: ${context.raw}`
          }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Score' }
      },
      x: {
        grid: { display: false } // Cleaner look
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
        {chartData.labels.length > 0 ? (
            <Bar options={options} data={chartData} />
        ) : (
            <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>
                No data for this time range.
            </div>
        )}
    </div>
  );
};

export default PerformanceChart;