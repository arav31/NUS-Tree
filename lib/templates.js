import { edgeStyle } from './treeFlowConfig';

function moduleNode(id, courseName, position, opts = {}) {
  return {
    id,
    type: 'module',
    position,
    data: {
      courseCode: id,
      courseName,
      color: opts.color || '#e0f7fa',
      textColor: opts.textColor || '#111827',
      description: opts.description || '',
      semester: opts.semester || ''
    }
  };
}

function edge(source, target, requirement = 'all') {
  return {
    id: `${source}-${target}`,
    source,
    target,
    data: { requirement },
    style: edgeStyle(requirement)
  };
}

export const templates = [
  {
    id: 'ai-pathway',
    title: 'BComp AI Pathway',
    description: 'A standard AI specialization track through the CS core and machine learning modules.',
    tags: ['CS', 'AI', 'Year 1-3'],
    nodes: [
      moduleNode('CS1010S', 'Programming Methodology', { x: 0, y: 0 }, { color: '#ffeb3b', semester: 'Y1S1' }),
      moduleNode('MA1521', 'Calculus for Computing', { x: 0, y: 160 }, { semester: 'Y1S1' }),
      moduleNode('CS2040S', 'Data Structures and Algorithms', { x: 280, y: 0 }, { semester: 'Y1S2' }),
      moduleNode('CS2109S', 'Introduction to AI and Machine Learning', { x: 560, y: 80 }, { semester: 'Y2S1' }),
      moduleNode('CS3244', 'Machine Learning', { x: 840, y: 80 }, { semester: 'Y2S2' }),
      moduleNode('CS4243', 'Computer Vision and Pattern Recognition', { x: 1120, y: 80 }, { semester: 'Y3S1' }),
    ],
    edges: [
      edge('CS1010S', 'CS2040S'),
      edge('CS2040S', 'CS2109S'),
      edge('MA1521', 'CS2109S'),
      edge('CS2109S', 'CS3244'),
      edge('CS3244', 'CS4243'),
    ],
  },
  {
    id: 'bio-info',
    title: 'Bioinformatics Minor',
    description: 'Pairs core programming modules with life science foundations for a computational biology focus.',
    tags: ['Bio', 'Computing', 'Minor'],
    nodes: [
      moduleNode('LSM1301', 'General Biology', { x: 0, y: 0 }, { semester: 'Y1S1' }),
      moduleNode('CS1010', 'Programming Methodology', { x: 0, y: 160 }, { color: '#ffeb3b', semester: 'Y1S1' }),
      moduleNode('LSM2103', 'Genetics', { x: 280, y: 0 }, { semester: 'Y1S2' }),
      moduleNode('CS2220', 'Introduction to Computational Biology', { x: 560, y: 80 }, { semester: 'Y2S1' }),
    ],
    edges: [
      edge('LSM1301', 'LSM2103'),
      edge('LSM2103', 'CS2220'),
      edge('CS1010', 'CS2220'),
    ],
  },
];
