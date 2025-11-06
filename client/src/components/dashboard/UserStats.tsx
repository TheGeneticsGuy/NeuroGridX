import React from 'react';
import StatCard from './StatCard';
import { challenges, type Attempt } from '../../config/challenges.config';
import './UserStats.css';

interface UserStatsProps {
    attempts: Attempt[];
}

const UserStats: React.FC<UserStatsProps> = ({ attempts }) => {
    return (
        <div className="stats-grid">
            {challenges.map((config) => (
                <StatCard key={config.key} config={config} attempts={attempts} />
            ))}
        </div>
    );
};

export default UserStats;