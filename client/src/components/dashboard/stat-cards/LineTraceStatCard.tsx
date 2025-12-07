import React from 'react';
import { type StatCardProps } from '../../../types/challenge.types';

const LineTracingStatCard: React.FC<StatCardProps> = ({ attempts }) => {
    // Filter attempts for this specific challenge
    const tracingAttempts = attempts.filter(a => a.challengeType === 'Line Tracing');

    if (tracingAttempts.length === 0) {
        return (
            <>
                <p>Personal Best: <span>N/A</span></p>
                <p>Average Score: <span>N/A</span></p>
                <p>Average Distance: <span>N/A</span></p>
                <p>Total Plays: <span>0</span></p>
            </>
        );
    }

    // Personal Best Score
    const scores = tracingAttempts.map(a => a.score);
    const highestScore = Math.max(...scores).toLocaleString();

    // Average Score
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = Math.round(totalScore / tracingAttempts.length).toLocaleString();

    // Average Distance (Accuracy)
    // In our DB, 'accuracy' field stores the progress (0.0 to 1.0)
    const accuracies = tracingAttempts.map(a => a.accuracy);
    const totalAccuracy = accuracies.reduce((a, b) => a + b, 0);
    const averageDistance = ((totalAccuracy / tracingAttempts.length) * 100).toFixed(1) + '%';

    return (
        <>
            <p>Personal Best: <span>{highestScore}</span></p>
            <p>Average Score: <span>{averageScore}</span></p>
            <p>Average Distance: <span>{averageDistance}</span></p>
            <p>Total Plays: <span>{tracingAttempts.length}</span></p>
        </>
    );
};

export default LineTracingStatCard;