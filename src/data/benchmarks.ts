import { Category } from './questions';

export interface Benchmark {
  id: string;
  name: string;
  scores: Record<Category, number>;
}

export const benchmarks: Benchmark[] = [
  {
    id: 'startup-founder',
    name: 'The Startup Founder',
    scores: {
      impact: 10,
      autonomy: 9,
      recognition: 6,
      security: 2,
      collaboration: 5,
    },
  },
  {
    id: 'corporate-leader',
    name: 'The Corporate Leader',
    scores: {
      security: 9,
      collaboration: 8,
      recognition: 7,
      impact: 5,
      autonomy: 4,
    },
  },
  {
    id: 'creative-director',
    name: 'The Creative Director',
    scores: {
      autonomy: 10,
      recognition: 9,
      collaboration: 6,
      impact: 6,
      security: 3,
    },
  },
];
