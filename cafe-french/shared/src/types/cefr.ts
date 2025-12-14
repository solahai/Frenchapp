// CEFR (Common European Framework of Reference) Types

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillType = 'listening' | 'speaking' | 'reading' | 'writing';

export interface CEFRCanDo {
  id: string;
  level: CEFRLevel;
  skill: SkillType;
  category: string;
  description: string;
  examples: string[];
  assessmentCriteria: string[];
}

export interface CEFRMicroGoal {
  id: string;
  canDoId: string;
  title: string;
  description: string;
  targetDays: number;
  activities: string[];
  successCriteria: {
    metric: string;
    threshold: number;
  }[];
}

export interface LevelProgress {
  level: CEFRLevel;
  overallProgress: number; // 0-100
  skillProgress: Record<SkillType, number>;
  canDosCompleted: string[];
  canDosInProgress: string[];
  estimatedTimeToNextLevel: number; // days
}

// CEFR Can-Do Statements Database
export const CEFR_CAN_DOS: Record<CEFRLevel, CEFRCanDo[]> = {
  A1: [
    {
      id: 'a1-l-1',
      level: 'A1',
      skill: 'listening',
      category: 'Understanding',
      description: 'I can understand familiar words and basic phrases about myself, my family, and immediate surroundings when people speak slowly and clearly.',
      examples: ['Understanding greetings', 'Understanding simple introductions', 'Following slow, clear announcements'],
      assessmentCriteria: ['Identifies key words', 'Understands basic questions', 'Follows simple instructions']
    },
    {
      id: 'a1-s-1',
      level: 'A1',
      skill: 'speaking',
      category: 'Interaction',
      description: 'I can interact in a simple way if the other person talks slowly and clearly and is prepared to help.',
      examples: ['Greeting someone', 'Introducing yourself', 'Asking/answering simple questions about personal details'],
      assessmentCriteria: ['Uses basic greetings', 'States name and nationality', 'Asks where someone is from']
    },
    {
      id: 'a1-s-2',
      level: 'A1',
      skill: 'speaking',
      category: 'Production',
      description: 'I can use simple phrases and sentences to describe where I live and people I know.',
      examples: ['Describing your home', 'Describing family members', 'Talking about daily routines'],
      assessmentCriteria: ['Uses basic vocabulary', 'Forms simple sentences', 'Pronounces clearly enough to be understood']
    },
    {
      id: 'a1-r-1',
      level: 'A1',
      skill: 'reading',
      category: 'Understanding',
      description: 'I can understand familiar names, words and very simple sentences, for example on notices and posters or in catalogues.',
      examples: ['Reading signs', 'Understanding simple forms', 'Reading basic menus'],
      assessmentCriteria: ['Recognizes key words', 'Understands simple sentences', 'Identifies basic information']
    },
    {
      id: 'a1-w-1',
      level: 'A1',
      skill: 'writing',
      category: 'Production',
      description: 'I can write a short, simple postcard. I can fill in forms with personal details.',
      examples: ['Writing a greeting card', 'Filling in registration forms', 'Writing your address'],
      assessmentCriteria: ['Writes personal information correctly', 'Uses basic sentence structure', 'Spells common words correctly']
    }
  ],
  A2: [
    {
      id: 'a2-l-1',
      level: 'A2',
      skill: 'listening',
      category: 'Understanding',
      description: 'I can understand phrases and high-frequency vocabulary related to personal and family information, shopping, local area, employment.',
      examples: ['Understanding directions', 'Following shopping transactions', 'Understanding appointment information'],
      assessmentCriteria: ['Grasps main points', 'Understands common expressions', 'Follows simple narratives']
    },
    {
      id: 'a2-s-1',
      level: 'A2',
      skill: 'speaking',
      category: 'Interaction',
      description: 'I can communicate in simple and routine tasks requiring a simple and direct exchange of information.',
      examples: ['Ordering in a café', 'Making appointments', 'Shopping for groceries'],
      assessmentCriteria: ['Handles routine exchanges', 'Asks for clarification', 'Expresses preferences']
    },
    {
      id: 'a2-s-2',
      level: 'A2',
      skill: 'speaking',
      category: 'Production',
      description: 'I can use a series of phrases and sentences to describe my family, living conditions, educational background, and present or recent job.',
      examples: ['Describing your job', 'Talking about your education', 'Describing daily activities'],
      assessmentCriteria: ['Links ideas with connectors', 'Describes routines', 'Gives reasons and explanations']
    },
    {
      id: 'a2-r-1',
      level: 'A2',
      skill: 'reading',
      category: 'Understanding',
      description: 'I can read very short, simple texts. I can find specific, predictable information in simple everyday material.',
      examples: ['Reading menus', 'Understanding timetables', 'Reading personal letters'],
      assessmentCriteria: ['Locates specific information', 'Understands main points', 'Follows simple instructions']
    },
    {
      id: 'a2-w-1',
      level: 'A2',
      skill: 'writing',
      category: 'Production',
      description: 'I can write short, simple notes and messages. I can write a very simple personal letter.',
      examples: ['Writing thank-you notes', 'Leaving messages', 'Writing about experiences'],
      assessmentCriteria: ['Uses appropriate format', 'Connects ideas', 'Uses common phrases correctly']
    }
  ],
  B1: [
    {
      id: 'b1-l-1',
      level: 'B1',
      skill: 'listening',
      category: 'Understanding',
      description: 'I can understand the main points of clear standard speech on familiar matters regularly encountered in work, school, leisure.',
      examples: ['Following discussions', 'Understanding news broadcasts', 'Comprehending audio guides'],
      assessmentCriteria: ['Identifies main ideas', 'Follows extended speech', 'Understands different accents']
    },
    {
      id: 'b1-s-1',
      level: 'B1',
      skill: 'speaking',
      category: 'Interaction',
      description: 'I can deal with most situations likely to arise whilst travelling in an area where the language is spoken.',
      examples: ['Handling unexpected situations', 'Explaining problems', 'Negotiating solutions'],
      assessmentCriteria: ['Initiates conversations', 'Handles complications', 'Expresses opinions']
    },
    {
      id: 'b1-s-2',
      level: 'B1',
      skill: 'speaking',
      category: 'Production',
      description: 'I can connect phrases in a simple way to describe experiences, events, dreams, hopes and ambitions.',
      examples: ['Telling stories', 'Describing plans', 'Explaining reasons'],
      assessmentCriteria: ['Uses varied vocabulary', 'Structures narratives', 'Expresses emotions']
    },
    {
      id: 'b1-r-1',
      level: 'B1',
      skill: 'reading',
      category: 'Understanding',
      description: 'I can understand texts that consist mainly of high-frequency everyday or job-related language.',
      examples: ['Reading articles', 'Understanding instructions', 'Following correspondence'],
      assessmentCriteria: ['Understands detailed descriptions', 'Identifies attitudes', 'Follows arguments']
    },
    {
      id: 'b1-w-1',
      level: 'B1',
      skill: 'writing',
      category: 'Production',
      description: 'I can write simple connected text on topics which are familiar or of personal interest.',
      examples: ['Writing essays', 'Describing events', 'Writing formal letters'],
      assessmentCriteria: ['Organizes paragraphs', 'Uses appropriate register', 'Expresses opinions clearly']
    }
  ],
  B2: [
    {
      id: 'b2-l-1',
      level: 'B2',
      skill: 'listening',
      category: 'Understanding',
      description: 'I can understand extended speech and lectures and follow complex lines of argument on familiar topics.',
      examples: ['Following lectures', 'Understanding documentaries', 'Comprehending debates'],
      assessmentCriteria: ['Follows complex arguments', 'Understands implicit meaning', 'Identifies speaker attitudes']
    },
    {
      id: 'b2-s-1',
      level: 'B2',
      skill: 'speaking',
      category: 'Interaction',
      description: 'I can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible.',
      examples: ['Participating in discussions', 'Debating issues', 'Handling professional conversations'],
      assessmentCriteria: ['Speaks fluently', 'Handles complex topics', 'Adapts to situations']
    },
    {
      id: 'b2-s-2',
      level: 'B2',
      skill: 'speaking',
      category: 'Production',
      description: 'I can present clear, detailed descriptions on a wide range of subjects related to my field of interest.',
      examples: ['Giving presentations', 'Explaining viewpoints', 'Analyzing topics'],
      assessmentCriteria: ['Structures presentations', 'Uses varied expressions', 'Supports arguments']
    },
    {
      id: 'b2-r-1',
      level: 'B2',
      skill: 'reading',
      category: 'Understanding',
      description: 'I can read articles and reports concerned with contemporary problems in which writers adopt particular attitudes or viewpoints.',
      examples: ['Reading newspapers', 'Analyzing opinions', 'Understanding technical texts'],
      assessmentCriteria: ['Identifies main conclusions', 'Recognizes significance', 'Understands nuance']
    },
    {
      id: 'b2-w-1',
      level: 'B2',
      skill: 'writing',
      category: 'Production',
      description: 'I can write clear, detailed text on a wide range of subjects related to my interests.',
      examples: ['Writing reports', 'Composing essays', 'Writing reviews'],
      assessmentCriteria: ['Synthesizes information', 'Develops arguments', 'Uses appropriate style']
    }
  ],
  C1: [
    {
      id: 'c1-l-1',
      level: 'C1',
      skill: 'listening',
      category: 'Understanding',
      description: 'I can understand extended speech even when it is not clearly structured and when relationships are only implied.',
      examples: ['Following films without subtitles', 'Understanding slang', 'Comprehending implicit meanings'],
      assessmentCriteria: ['Understands implied meaning', 'Recognizes stylistic features', 'Follows rapid speech']
    },
    {
      id: 'c1-s-1',
      level: 'C1',
      skill: 'speaking',
      category: 'Interaction',
      description: 'I can express myself fluently and spontaneously without much obvious searching for expressions.',
      examples: ['Professional discussions', 'Academic debates', 'Social conversations'],
      assessmentCriteria: ['Speaks effortlessly', 'Uses idiomatic expressions', 'Adapts style appropriately']
    },
    {
      id: 'c1-s-2',
      level: 'C1',
      skill: 'speaking',
      category: 'Production',
      description: 'I can present clear, detailed descriptions of complex subjects, integrating sub-themes and developing particular points.',
      examples: ['Academic presentations', 'Complex explanations', 'Nuanced arguments'],
      assessmentCriteria: ['Handles complex topics', 'Uses rhetorical devices', 'Maintains coherence']
    },
    {
      id: 'c1-r-1',
      level: 'C1',
      skill: 'reading',
      category: 'Understanding',
      description: 'I can understand long and complex factual and literary texts, appreciating distinctions of style.',
      examples: ['Reading literature', 'Understanding technical manuals', 'Analyzing complex articles'],
      assessmentCriteria: ['Appreciates style', 'Understands implicit attitudes', 'Recognizes discourse patterns']
    },
    {
      id: 'c1-w-1',
      level: 'C1',
      skill: 'writing',
      category: 'Production',
      description: 'I can express myself in clear, well-structured text, expressing points of view at some length.',
      examples: ['Writing essays', 'Composing formal letters', 'Writing reports'],
      assessmentCriteria: ['Uses complex structures', 'Maintains appropriate register', 'Develops ideas clearly']
    }
  ],
  C2: [
    {
      id: 'c2-l-1',
      level: 'C2',
      skill: 'listening',
      category: 'Understanding',
      description: 'I have no difficulty in understanding any kind of spoken language, whether live or broadcast, even when delivered at fast native speed.',
      examples: ['All media', 'Fast colloquial speech', 'Regional accents'],
      assessmentCriteria: ['Complete comprehension', 'Understands all varieties', 'Catches cultural references']
    },
    {
      id: 'c2-s-1',
      level: 'C2',
      skill: 'speaking',
      category: 'Interaction',
      description: 'I can take part effortlessly in any conversation or discussion and have a good familiarity with idiomatic expressions and colloquialisms.',
      examples: ['Any social situation', 'Professional contexts', 'Cultural discussions'],
      assessmentCriteria: ['Native-like fluency', 'Full idiomatic range', 'Complete cultural competence']
    },
    {
      id: 'c2-s-2',
      level: 'C2',
      skill: 'speaking',
      category: 'Production',
      description: 'I can present a clear, smoothly-flowing description or argument in a style appropriate to the context.',
      examples: ['Complex presentations', 'Nuanced arguments', 'Stylistically varied speech'],
      assessmentCriteria: ['Perfect command', 'Stylistic appropriateness', 'Complete accuracy']
    },
    {
      id: 'c2-r-1',
      level: 'C2',
      skill: 'reading',
      category: 'Understanding',
      description: 'I can read with ease virtually all forms of the written language, including abstract, structurally complex texts.',
      examples: ['Literature', 'Legal documents', 'Philosophical texts'],
      assessmentCriteria: ['Complete comprehension', 'Stylistic appreciation', 'Cultural understanding']
    },
    {
      id: 'c2-w-1',
      level: 'C2',
      skill: 'writing',
      category: 'Production',
      description: 'I can write clear, smoothly-flowing text in an appropriate style, complex letters, reports or articles.',
      examples: ['Academic papers', 'Creative writing', 'Professional documents'],
      assessmentCriteria: ['Perfect command', 'Stylistic mastery', 'Complete accuracy']
    }
  ]
};
