import React from 'react';
import './UserStats.css';

interface Attempt {
    challengeType: string;
    score: number;
    // TODO: Add Additional Relevant info - 
}

interface UserStatsProps {
    attempts: Attempt[];
}

const UserStats: React.FC<UserStatsProps> = ({ attempts }) => {

    const calculateStats = (challengeName: string) => {
        const challengeAttempts = attempts.filter(a => a.challengeType === challengeName);

        if (challengeAttempts.length === 0) {
            return { personalBest: 'N/A', averageScore: 'N/A', plays: 0 };
        }

        const scores = challengeAttempts.map(a => a.score);
        const personalBest = Math.max(...scores);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        return {
            personalBest: personalBest.toLocaleString(),
            averageScore: Math.round(averageScore).toLocaleString(),
            plays: challengeAttempts.length
        };
    };

    const reactionTimeStats = calculateStats('Reaction Time'); // Renamed for clarity

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <h3>Reaction Time</h3>
                <p>Personal Best: <span>{reactionTimeStats.personalBest}</span></p>
                <p>Average Score: <span>{reactionTimeStats.averageScore}</span></p>
                <p>Total Plays: <span>{reactionTimeStats.plays}</span></p>
            </div>
            <div className="stat-card upcoming">
                <h3>Line Tracing</h3>
                <p>Coming Soon!</p>
            </div>
            <div className="stat-card upcoming">
                <h3>Velocity Control</h3>
                <p>Coming Soon!</p>
            </div>
        </div>
    );
};

export default UserStats;