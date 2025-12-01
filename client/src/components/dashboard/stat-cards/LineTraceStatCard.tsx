import React from 'react';
import { type StatCardProps } from '../../../types/challenge.types';

const LineTracingStatCard: React.FC<StatCardProps> = ({ attempts }) => {
    const tracingAttempts = attempts.filter(a => a.challengeType === 'Line Tracing');

    if (tracingAttempts.length === 0) {
        return (
            <>
                <p>Fastest Time: <span>N/A</span></p>
                <p>Best Accuracy: <span>N/A</span></p>
                <p>Avg Penalties: <span>N/A</span></p>
                <p>Total Plays: <span>0</span></p>
            </>
        );
    }

    // Calculate stats
    const times = tracingAttempts.map(a => a.score > 0 ? (120 - ((a.score - 1000)/50)) : null).filter(t => t !== null) as number[];
    const fastestTime = times.length > 0 ? Math.min(...times).toFixed(2) + 's' : 'N/A';

    const accuracies = tracingAttempts.map(a => a.accuracy);
    const bestAccuracy = (Math.max(...accuracies) * 100).toFixed(1) + '%';

    // I am going to reuse ntpm field for consistency with reaction time for penalties count
    const penalties = tracingAttempts.map(a => a.ntpm || 0);
    const avgPenalties = (penalties.reduce((a, b) => a + b, 0) / tracingAttempts.length).toFixed(1);

    return (
        <>
            <p>Fastest Time: <span>{fastestTime}</span></p>
            <p>Best Accuracy: <span>{bestAccuracy}</span></p>
            <p>Avg Penalties: <span>{avgPenalties}</span></p>
            <p>Total Plays: <span>{tracingAttempts.length}</span></p>
        </>
    );
};

export default LineTracingStatCard;