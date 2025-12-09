import React from 'react';

export interface Attempt {
    _id: string;
    challengeType: string;
    score: number;
    accuracy: number;
    ntpm?: number;
    averageClickAccuracy?: number;
    createdAt: string;
    completionTime: number;
    penalties?: number;
    settings?: {
      mode: 'Normal' | 'Advanced';
      speed?: 'Normal' | 'Medium' | 'Fast';
    };
}

export interface StatCardProps {
    attempts: Attempt[];
    showPlayButton?: boolean;
}

export interface ChallengeConfig {
    key: string;
    name: string;
    path: string;
    StatCardComponent: React.FC<StatCardProps>;
    isEnabled: boolean;
}