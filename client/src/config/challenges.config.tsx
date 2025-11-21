import React from 'react';
import ReactionTimeStatCard from '../components/dashboard/stat-cards/ReactionTimeStatCard';
// import LineTraceStatCard from '../components/dashboard/stat-cards/LineTraceStatCard';
// import DragAndDropStatCard from '../components/dashboard/stat-cards/DragAndDropStatCard';
// FUTRE CHALLENGE IMPORTS //

// Attempt data (fore type safety)
export interface Attempt {
    _id: string;
    challengeType: string;
    score: number;
    accuracy: number;
    ntpm?: number;
    averageClickAccuracy?: number;
    createdAt: string;
    settings?: { // Optional because some might just leave it as default
      mode: 'Normal' | 'Advanced';
      speed?: 'Normal' | 'Medium' | 'Fast';
    };
}

// Every Challenge stat card component will receive
export interface StatCardProps {
    attempts: Attempt[];
    showPlayButton?: boolean; // bool to control visibility as I want it visible on User Dashboard but not on challenge window
}

// Just a single challenge config
export interface ChallengeConfig {
    key: string; // Unique "key" like 'reaction-time'
    name: string; // The display name
    path: string; // The URL path to the challenge (just the route)
    StatCardComponent: React.FC<StatCardProps>; // Reference to the sub-component of the challenges group
    isEnabled: boolean; // Might use - just to enable/disable challenge
}

// Central "table reference" of all challenges in the app - This makes it easy to add them here.
export const challenges: ChallengeConfig[] = [
    {
        key: 'reaction-time',
        name: 'Reaction Time',
        path: '/challenges/reaction-time',
        StatCardComponent: ReactionTimeStatCard,
        isEnabled: true,
    },
    {
        key: 'line-tracing',
        name: 'Line Tracing',
        path: '/challenges/line-tracing',
        StatCardComponent: ({ attempts: _}) => <div>Coming Soon!</div>, // TODO: Pending build
        isEnabled: false,
    },
    {
        key: 'velocity-control',
        name: 'Velocity Control',
        path: '/challenges/velocity-control',
        StatCardComponent: ({ attempts: _ }) => <div>Coming Soon!</div>,
        isEnabled: false,
    }
];