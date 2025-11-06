// Mock Data for AGI Dashboard
// This file contains all mock data and TypeScript types for the landing page

export type StatusType = "solved" | "partial" | "unsolved";

export type ActivityType =
  | "breakthrough"
  | "setback"
  | "deployment"
  | "research"
  | "funding"
  | "technology";

export interface Capability {
  id: string;
  name: string;
  icon: string;
  progress: number;
  status: StatusType;
  strongAreas: Array<{ name: string; progress: number }>;
  keyGaps: Array<{ name: string; progress: number }>;
  jobsProtected: number;
  description: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  url?: string;
  timestamp: string;
  author: {
    username: string;
    avatar?: string;
  };
  upvotes: number;
  comments: number;
  tags: string[];
}

export interface UserProfile {
  username: string;
  points: number;
  trustLevel: string;
  avatar?: string;
}

export interface Stats {
  reports: number;
  experts: number;
  papers: number;
  jobsSafe: number;
}

export interface InterestCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

// Mock Capabilities Data
export const mockCapabilities: Capability[] = [
  {
    id: "perception",
    name: "Perception",
    icon: "Eye",
    progress: 75,
    status: "partial",
    strongAreas: [
      { name: "Image recognition", progress: 95 },
      { name: "Object detection", progress: 90 },
      { name: "Scene understanding", progress: 85 },
    ],
    keyGaps: [
      { name: "3D spatial reasoning", progress: 60 },
      { name: "Edge cases", progress: 45 },
    ],
    jobsProtected: 2300000,
    description: "Visual and sensory understanding capabilities",
  },
  {
    id: "reasoning",
    name: "Reasoning",
    icon: "Brain",
    progress: 60,
    status: "partial",
    strongAreas: [
      { name: "Logical deduction", progress: 75 },
      { name: "Pattern recognition", progress: 80 },
      { name: "Mathematical reasoning", progress: 70 },
    ],
    keyGaps: [
      { name: "Common sense reasoning", progress: 40 },
      { name: "Causal reasoning", progress: 35 },
    ],
    jobsProtected: 4500000,
    description: "Logical thinking and problem-solving abilities",
  },
  {
    id: "language",
    name: "Language Understanding",
    icon: "MessageSquare",
    progress: 85,
    status: "partial",
    strongAreas: [
      { name: "Text generation", progress: 92 },
      { name: "Translation", progress: 88 },
      { name: "Summarization", progress: 85 },
    ],
    keyGaps: [
      { name: "Deep comprehension", progress: 65 },
      { name: "Contextual nuance", progress: 55 },
    ],
    jobsProtected: 1800000,
    description: "Natural language processing and generation",
  },
  {
    id: "manipulation",
    name: "Dexterous Manipulation",
    icon: "Hand",
    progress: 35,
    status: "unsolved",
    strongAreas: [
      { name: "Simple grasping", progress: 60 },
      { name: "Structured tasks", progress: 55 },
    ],
    keyGaps: [
      { name: "Fine motor control", progress: 30 },
      { name: "Soft object handling", progress: 25 },
      { name: "Tool improvisation", progress: 15 },
    ],
    jobsProtected: 8200000,
    description: "Physical manipulation and fine motor skills",
  },
  {
    id: "planning",
    name: "Long-term Planning",
    icon: "Target",
    progress: 45,
    status: "unsolved",
    strongAreas: [
      { name: "Short-term planning", progress: 70 },
      { name: "Constrained optimization", progress: 65 },
    ],
    keyGaps: [
      { name: "Multi-year planning", progress: 20 },
      { name: "Uncertainty handling", progress: 35 },
      { name: "Goal adaptation", progress: 30 },
    ],
    jobsProtected: 3100000,
    description: "Strategic thinking and future planning",
  },
];

// Mock Activity Feed Data
export const mockActivities: Activity[] = [
  {
    id: "activity-1",
    type: "breakthrough",
    title: "Breakthrough in vision capabilities",
    description:
      "DeepMind's Gemini 2.0 achieves 95% on ImageNet, surpassing human baseline for the first time. This represents a significant milestone in computer vision.",
    url: "https://deepmind.google/discover/blog/",
    timestamp: "2h",
    author: {
      username: "sarah_researcher",
      avatar: undefined,
    },
    upvotes: 234,
    comments: 56,
    tags: ["Perception", "Computer Vision"],
  },
  {
    id: "activity-2",
    type: "setback",
    title: "Figure 02 disappoints in real-world tests",
    description:
      "Latest humanoid robot struggles with basic household tasks, highlighting the gap between controlled demos and real-world deployment. Can't handle unstructured environments.",
    url: undefined,
    timestamp: "5h",
    author: {
      username: "robotics_watcher",
    },
    upvotes: 567,
    comments: 123,
    tags: ["Manipulation", "Robotics"],
  },
  {
    id: "activity-3",
    type: "research",
    title: "New paper on causal reasoning shows promise",
    description:
      "MIT researchers demonstrate 40% improvement in causal inference tasks using novel architecture. Could unlock better reasoning capabilities.",
    url: "https://arxiv.org",
    timestamp: "8h",
    author: {
      username: "ai_papers_daily",
    },
    upvotes: 189,
    comments: 34,
    tags: ["Reasoning", "Research"],
  },
  {
    id: "activity-4",
    type: "deployment",
    title: "OpenAI deploys GPT-5 with improved planning",
    description:
      "New model shows significant gains in multi-step problem solving and long-term planning tasks. Available via API starting today.",
    url: undefined,
    timestamp: "12h",
    author: {
      username: "openai_updates",
    },
    upvotes: 892,
    comments: 234,
    tags: ["Planning", "Language"],
  },
  {
    id: "activity-5",
    type: "funding",
    title: "$500M invested in robotics startup",
    description:
      "Physical Intelligence raises massive round to build general-purpose robots. Focus on dexterous manipulation and household tasks.",
    url: undefined,
    timestamp: "1d",
    author: {
      username: "vc_tracker",
    },
    upvotes: 445,
    comments: 87,
    tags: ["Manipulation", "Funding"],
  },
  {
    id: "activity-6",
    type: "technology",
    title: "Tesla Optimus Gen 3 unveiled",
    description:
      "New generation shows improved hand dexterity and movement speed. Still far from general-purpose household robot.",
    url: undefined,
    timestamp: "1d",
    author: {
      username: "tech_news_bot",
    },
    upvotes: 723,
    comments: 156,
    tags: ["Manipulation", "Robotics"],
  },
  {
    id: "activity-7",
    type: "research",
    title: "Stanford study: AI still fails at common sense",
    description:
      "Comprehensive evaluation reveals large gaps in everyday reasoning tasks that humans find trivial. Models struggle with physical intuition.",
    url: "https://arxiv.org",
    timestamp: "2d",
    author: {
      username: "academic_ai",
    },
    upvotes: 334,
    comments: 91,
    tags: ["Reasoning", "Research"],
  },
  {
    id: "activity-8",
    type: "breakthrough",
    title: "Real-time translation reaches human parity",
    description:
      "Meta's new translation model achieves human-level performance across 100+ languages. Game-changer for global communication.",
    url: undefined,
    timestamp: "2d",
    author: {
      username: "meta_ai",
    },
    upvotes: 612,
    comments: 78,
    tags: ["Language", "Translation"],
  },
  {
    id: "activity-9",
    type: "deployment",
    title: "Amazon deploys 1000 warehouse robots",
    description:
      "New robots handle package sorting and loading with 90% accuracy. Still requires human oversight for exceptions.",
    url: undefined,
    timestamp: "3d",
    author: {
      username: "logistics_insider",
    },
    upvotes: 289,
    comments: 45,
    tags: ["Manipulation", "Deployment"],
  },
  {
    id: "activity-10",
    type: "setback",
    title: "Self-driving cars still struggle in rain",
    description:
      "Multiple incidents reported with autonomous vehicles in adverse weather. Perception systems fail with poor visibility.",
    url: undefined,
    timestamp: "3d",
    author: {
      username: "autonomous_watch",
    },
    upvotes: 478,
    comments: 134,
    tags: ["Perception", "Autonomous"],
  },
];

// Mock Stats
export const mockStats: Stats = {
  reports: 1234,
  experts: 234,
  papers: 5678,
  jobsSafe: 10200000,
};

// Mock User Profile
export const mockUserProfile: UserProfile = {
  username: "researcher_sarah",
  points: 234,
  trustLevel: "Trusted",
  avatar: undefined,
};

// Mock Interest Cards
export const mockInterestCards: InterestCard[] = [
  {
    id: "worker",
    title: "Worker",
    icon: "Briefcase",
    description: "Check if your job is safe from AI automation",
    ctaText: "Explore →",
    ctaLink: "/jobs",
  },
  {
    id: "developer",
    title: "Developer",
    icon: "Code",
    description: "Compare AI models & tools for your projects",
    ctaText: "Compare →",
    ctaLink: "/technologies",
  },
  {
    id: "business",
    title: "Business",
    icon: "Building2",
    description: "Buy robots & automation solutions",
    ctaText: "Browse →",
    ctaLink: "/organizations",
  },
];

// Mock Overall AGI Progress
export const mockAGIProgress = {
  overall: 45,
  lastUpdated: "2 hours ago",
  lastUpdatedBy: "researcher_sarah",
  contributors: 1234,
  expertForecasts: 234,
  reports: 5678,
};

// Mock Search Results
export interface SearchResult {
  id: string;
  title: string;
  type: "capability" | "job" | "technology" | "organization";
  url: string;
  description?: string;
}

export const generateMockSearchResults = (
  query: string,
): {
  capabilities: SearchResult[];
  jobs: SearchResult[];
  technologies: SearchResult[];
  total: number;
} => {
  const lowerQuery = query.toLowerCase();

  // Filter capabilities
  const capabilities = mockCapabilities
    .filter((cap) => cap.name.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map((cap) => ({
      id: cap.id,
      title: cap.name,
      type: "capability" as const,
      url: `/capabilities/${cap.id}`,
      description: cap.description,
    }));

  // Mock job results
  const allJobs = [
    {
      id: "plumber",
      title: "Plumber",
      description: "Manual dexterity required",
    },
    {
      id: "electrician",
      title: "Electrician",
      description: "Complex problem-solving",
    },
    {
      id: "surgeon",
      title: "Surgeon",
      description: "Precision and decision-making",
    },
    {
      id: "software-dev",
      title: "Software Developer",
      description: "Code generation tasks",
    },
    { id: "designer", title: "Designer", description: "Creative visual work" },
  ];

  const jobs = allJobs
    .filter((job) => job.title.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map((job) => ({
      id: job.id,
      title: job.title,
      type: "job" as const,
      url: `/jobs/${job.id}`,
      description: job.description,
    }));

  // Mock technology results
  const allTech = [
    { id: "gpt4", title: "GPT-4", description: "Language model by OpenAI" },
    { id: "gemini", title: "Gemini", description: "Multimodal AI by Google" },
    { id: "claude", title: "Claude", description: "AI assistant by Anthropic" },
    { id: "llama", title: "Llama", description: "Open source LLM by Meta" },
  ];

  const technologies = allTech
    .filter((tech) => tech.title.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .map((tech) => ({
      id: tech.id,
      title: tech.title,
      type: "technology" as const,
      url: `/technologies/${tech.id}`,
      description: tech.description,
    }));

  return {
    capabilities,
    jobs,
    technologies,
    total: capabilities.length + jobs.length + technologies.length,
  };
};
