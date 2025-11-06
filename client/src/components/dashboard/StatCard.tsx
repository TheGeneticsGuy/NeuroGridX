import React from 'react';
import { Link } from 'react-router-dom';
import { type ChallengeConfig, type Attempt } from '../../config/challenges.config';
import './UserStats.css';

// This will be my Generic StatCard wrapper for all my stat cards

interface GenericStatCardProps {
    config: ChallengeConfig;
    attempts: Attempt[];
}

const StatCard: React.FC<GenericStatCardProps> = ({ config, attempts }) => {
    const { name, path, StatCardComponent, isEnabled } = config;

    return (
        <div className={`stat-card ${!isEnabled ? 'upcoming' : ''}`}>
            <h3>{name}</h3>
            <div className="stat-card-body">
                <StatCardComponent attempts={attempts} />
            </div>
            {isEnabled && (
                <div className="stat-card-footer">
                    <Link to={path} className="play-button">Play Challenge</Link>
                </div>
            )}
        </div>
    );
};

export default StatCard;