import React from 'react';
import StatCard from './StatCard';
import { challenges } from '../../config/challenges.config';
import { type Attempt } from '../../types/challenge.types'
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