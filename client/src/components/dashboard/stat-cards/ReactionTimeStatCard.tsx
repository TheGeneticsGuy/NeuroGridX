import React from 'react';
import { type StatCardProps } from '../../../config/challenges.config';

// This component only displays the Reaction Time Stats Challenge data.

const ReactionTimeStatCard: React.FC<StatCardProps> = ({ attempts }) => {
    const challengeAttempts = attempts.filter(a => a.challengeType === 'Reaction Time');

    if (challengeAttempts.length === 0) {
        return (        // I am still trying to determine what is the best way to show data. I kind of what to see Click Accuracy over
            <>
                <p>Personal Best: <span>N/A</span></p>
                <p>Average Score: <span>N/A</span></p>
                <p>Average Accuracy: <span>N/A</span></p>
                <p>Total Plays: <span>0</span></p>
            </>
        );
    }

    const scores = challengeAttempts.map(a => a.score);
    const personalBest = Math.max(...scores);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const avgClickAccuracy = challengeAttempts
        .map(a => a.averageClickAccuracy || 0)
        .reduce((a, b) => a + b, 0) / challengeAttempts.length;

    return (
        <>
            <p>Personal Best: <span>{personalBest.toLocaleString()}</span></p>
            <p>Average Score: <span>{Math.round(averageScore).toLocaleString()}</span></p>
            <p>Average Accuracy: <span>{(avgClickAccuracy * 100).toFixed(1)}%</span></p>
            <p>Total Plays: <span>{challengeAttempts.length}</span></p>
        </>
    );
};

export default ReactionTimeStatCard;