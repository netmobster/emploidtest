import { Category } from './questions';

export interface Badge {
  id: Category;
  name: string;
  title: string;
  vibe: string;
  description: string;
  wins: string[];
  watchOuts: string[];
  bestMatch: string;
}

export const badges: Record<Category, Badge> = {
  autonomy: {
    id: 'autonomy',
    name: 'The Architect',
    title: 'The Architect',
    vibe: 'High-trust, self-directed execution.',
    description: 'You are at your best when you own the \'How.\' You don\'t need a map; you need the keys to the car. Your biggest frustration is being told how to do a job you already know how to do.',
    wins: [
      'Exceptional at remote work',
      'Complex problem-solving',
      'Building systems from scratch',
    ],
    watchOuts: [
      'Can unintentionally isolate themselves',
      'May appear \'unreachable\' to teammates who crave collaboration',
    ],
    bestMatch: 'A leader who manages by outcomes, not by hours.',
  },
  impact: {
    id: 'impact',
    name: 'The Catalyst',
    title: 'The Catalyst',
    vibe: 'Mission-first, big-picture growth.',
    description: 'You are fueled by the \'Why.\' You can handle stress and long hours as long as you believe the mission is changing the world. You\'d rather take a big swing and miss than play it safe on a project that doesn\'t matter.',
    wins: [
      'High resilience during \'crunch time\'',
      'Vision-setting',
      'Finding innovative shortcuts to goals',
    ],
    watchOuts: [
      'Can suffer from burnout if the \'Why\' becomes unclear',
      'May get bored with repetitive maintenance tasks',
    ],
    bestMatch: 'A company with a \'Moonshot\' mission and high transparency.',
  },
  collaboration: {
    id: 'collaboration',
    name: 'The Glue',
    title: 'The Glue',
    vibe: 'Shared success and relational energy.',
    description: 'You are the heartbeat of the team. You believe that how the work gets done together is just as important as what gets done. You thrive in huddles and find solo work draining.',
    wins: [
      'Building high-performing culture',
      'Unblocking team communication',
      'Mentoring others',
    ],
    watchOuts: [
      'May struggle in 100% siloed/remote roles',
      'Can feel drained in \'cutthroat\' competitive environments',
    ],
    bestMatch: 'Agile teams and \'We-first\' organizations.',
  },
  security: {
    id: 'security',
    name: 'The Rock',
    title: 'The Rock',
    vibe: 'Reliable, structured, and sustainable.',
    description: 'You are the master of the \'Blueprint.\' You value clarity, boundaries, and reliability. You thrive when expectations are clear, allowing you to execute with high precision without the fear of the goalposts moving.',
    wins: [
      'Creating scalable processes',
      'Risk mitigation',
      'Maintaining high quality under pressure',
    ],
    watchOuts: [
      'Can be paralyzed by \'chaos for chaos\' sake\'',
      'Struggles with constant pivot-culture without a clear transition plan',
    ],
    bestMatch: 'Established firms or startups in the \'Scale-up\' phase with clear hierarchies.',
  },
  recognition: {
    id: 'recognition',
    name: 'The Ambassador',
    title: 'The Ambassador',
    vibe: 'Feedback-driven and high-visibility.',
    description: 'You are fueled by visibility and feedback. You aren\'t \'vain\'—you are simply performance-driven. Knowing that your specific contribution is seen and celebrated is what keeps your tank full for the next challenge.',
    wins: [
      'Public-facing roles',
      'High-output individual contributions',
      'Raising the bar for excellence',
    ],
    watchOuts: [
      'If feedback is only negative or absent, engagement will drop faster than any other archetype',
    ],
    bestMatch: 'Performance-based cultures where wins are tracked and celebrated.',
  },
};
