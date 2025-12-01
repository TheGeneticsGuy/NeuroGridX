import ReactionTimeStatCard from '../components/dashboard/stat-cards/ReactionTimeStatCard';
// import LineTraceStatCard from '../components/dashboard/stat-cards/LineTraceStatCard';
// import DragAndDropStatCard from '../components/dashboard/stat-cards/DragAndDropStatCard';
import { type ChallengeConfig } from '../types/challenge.types';
// FUTRE CHALLENGE IMPORTS //


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
        // StatCardComponent: LineTraceStatCard,
        StatCardComponent: ({ attempts: _}) => <div>Coming Soon!</div>, // TODO: Pending build
        isEnabled: false,
    },
    {
        key: 'velocity-control',
        name: 'Velocity Control',
        path: '/challenges/velocity-control',
        // StatCardComponent: DragAndDropStatCard,
        StatCardComponent: ({ attempts: _ }) => <div>Coming Soon!</div>,
        isEnabled: false,
    }
];