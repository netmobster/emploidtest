import { 
  Briefcase, 
  Code, 
  Megaphone, 
  Palette, 
  FileText, 
  Globe, 
  PenTool, 
  Users, 
  BarChart3, 
  Headphones,
  LucideIcon
} from "lucide-react";

export interface Role {
  id: string;
  title: string;
  category: string;
  icon: LucideIcon;
  description: string;
}

export const ROLES: Role[] = [
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Tech/Startup",
    icon: Briefcase,
    description: "Lead product strategy and roadmap development",
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Tech",
    icon: Code,
    description: "Build and maintain software applications",
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    category: "All Industries",
    icon: Megaphone,
    description: "Drive brand awareness and growth campaigns",
  },
  {
    id: "ux-ui-designer",
    title: "UX/UI Designer",
    category: "Tech/Media",
    icon: Palette,
    description: "Design intuitive and beautiful user experiences",
  },
  {
    id: "content-strategist",
    title: "Content Strategist",
    category: "Media/Startup",
    icon: FileText,
    description: "Plan and oversee content creation and distribution",
  },
  {
    id: "web-designer",
    title: "Web Designer",
    category: "Tech/Media",
    icon: Globe,
    description: "Create visually stunning and functional websites",
  },
  {
    id: "copywriter",
    title: "Copywriter",
    category: "Content",
    icon: PenTool,
    description: "Craft compelling copy that converts",
  },
  {
    id: "executive-assistant",
    title: "Executive Assistant",
    category: "All Industries",
    icon: Users,
    description: "Support executives with high-level administrative tasks",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Tech/Startup",
    icon: BarChart3,
    description: "Transform data into actionable insights",
  },
  {
    id: "customer-support",
    title: "Customer Support",
    category: "All Industries",
    icon: Headphones,
    description: "Deliver exceptional customer experiences",
  },
];

export type UserType = "employer" | "candidate";

export interface SampleJob {
  id: string;
  roleId: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  type: "Full-time" | "Part-time" | "Contract";
  remote: "Remote" | "Hybrid" | "Onsite";
  description: string;
  logo: string;
}

export const SAMPLE_JOBS: SampleJob[] = [
  // Product Manager
  { id: "pm-1", roleId: "product-manager", company: "TechFlow", title: "Senior Product Manager", location: "San Francisco, CA", salary: "$150K - $180K", type: "Full-time", remote: "Hybrid", description: "Lead product strategy for our AI-powered platform", logo: "🚀" },
  { id: "pm-2", roleId: "product-manager", company: "FinanceHub", title: "Product Manager", location: "New York, NY", salary: "$130K - $160K", type: "Full-time", remote: "Remote", description: "Drive innovation in fintech products", logo: "💰" },
  { id: "pm-3", roleId: "product-manager", company: "HealthTech Co", title: "Product Lead", location: "Boston, MA", salary: "$140K - $170K", type: "Full-time", remote: "Onsite", description: "Transform healthcare through product innovation", logo: "🏥" },
  
  // Software Engineer
  { id: "se-1", roleId: "software-engineer", company: "CloudNine", title: "Full Stack Engineer", location: "Seattle, WA", salary: "$160K - $200K", type: "Full-time", remote: "Remote", description: "Build scalable cloud infrastructure", logo: "☁️" },
  { id: "se-2", roleId: "software-engineer", company: "GameStudio", title: "Backend Engineer", location: "Austin, TX", salary: "$140K - $175K", type: "Full-time", remote: "Hybrid", description: "Create next-gen gaming experiences", logo: "🎮" },
  { id: "se-3", roleId: "software-engineer", company: "DataFlow", title: "Senior Developer", location: "Denver, CO", salary: "$150K - $185K", type: "Full-time", remote: "Remote", description: "Build data pipelines at scale", logo: "📊" },
  
  // Marketing Manager
  { id: "mm-1", roleId: "marketing-manager", company: "BrandBoost", title: "Growth Marketing Manager", location: "Los Angeles, CA", salary: "$100K - $130K", type: "Full-time", remote: "Hybrid", description: "Drive user acquisition and retention", logo: "📈" },
  { id: "mm-2", roleId: "marketing-manager", company: "EcoGoods", title: "Marketing Director", location: "Portland, OR", salary: "$120K - $150K", type: "Full-time", remote: "Remote", description: "Lead sustainable brand marketing", logo: "🌿" },
  { id: "mm-3", roleId: "marketing-manager", company: "StartupX", title: "Head of Marketing", location: "Miami, FL", salary: "$110K - $140K", type: "Full-time", remote: "Onsite", description: "Build marketing from the ground up", logo: "⚡" },
  
  // UX/UI Designer
  { id: "ux-1", roleId: "ux-ui-designer", company: "DesignLab", title: "Senior UX Designer", location: "San Francisco, CA", salary: "$130K - $160K", type: "Full-time", remote: "Remote", description: "Create beautiful, intuitive experiences", logo: "🎨" },
  { id: "ux-2", roleId: "ux-ui-designer", company: "AppWorks", title: "Product Designer", location: "New York, NY", salary: "$120K - $150K", type: "Full-time", remote: "Hybrid", description: "Design mobile-first experiences", logo: "📱" },
  { id: "ux-3", roleId: "ux-ui-designer", company: "CreativeFlow", title: "UI/UX Lead", location: "Chicago, IL", salary: "$125K - $155K", type: "Full-time", remote: "Remote", description: "Lead design system evolution", logo: "✨" },
  
  // Content Strategist
  { id: "cs-1", roleId: "content-strategist", company: "MediaPulse", title: "Content Strategy Lead", location: "New York, NY", salary: "$95K - $120K", type: "Full-time", remote: "Hybrid", description: "Shape content across all channels", logo: "📝" },
  { id: "cs-2", roleId: "content-strategist", company: "TechBlog Inc", title: "Senior Content Strategist", location: "San Francisco, CA", salary: "$100K - $130K", type: "Full-time", remote: "Remote", description: "Create thought leadership content", logo: "💡" },
  { id: "cs-3", roleId: "content-strategist", company: "BrandVoice", title: "Content Director", location: "Austin, TX", salary: "$110K - $140K", type: "Full-time", remote: "Remote", description: "Define brand voice and content strategy", logo: "🎯" },
  
  // Web Designer
  { id: "wd-1", roleId: "web-designer", company: "PixelPerfect", title: "Senior Web Designer", location: "Los Angeles, CA", salary: "$90K - $115K", type: "Full-time", remote: "Remote", description: "Design stunning web experiences", logo: "🌐" },
  { id: "wd-2", roleId: "web-designer", company: "AgencyOne", title: "Web Design Lead", location: "Seattle, WA", salary: "$95K - $120K", type: "Full-time", remote: "Hybrid", description: "Lead client web projects", logo: "🎪" },
  { id: "wd-3", roleId: "web-designer", company: "StartupHub", title: "Webflow Designer", location: "Denver, CO", salary: "$85K - $110K", type: "Contract", remote: "Remote", description: "Build no-code marketing sites", logo: "⚙️" },
  
  // Copywriter
  { id: "cw-1", roleId: "copywriter", company: "AdCraft", title: "Senior Copywriter", location: "New York, NY", salary: "$85K - $110K", type: "Full-time", remote: "Hybrid", description: "Write compelling ad campaigns", logo: "✍️" },
  { id: "cw-2", roleId: "copywriter", company: "SaaSify", title: "Product Copywriter", location: "San Francisco, CA", salary: "$90K - $115K", type: "Full-time", remote: "Remote", description: "Craft SaaS product messaging", logo: "💻" },
  { id: "cw-3", roleId: "copywriter", company: "BrandWords", title: "Creative Copywriter", location: "Chicago, IL", salary: "$80K - $100K", type: "Full-time", remote: "Remote", description: "Tell brand stories that convert", logo: "📖" },
  
  // Executive Assistant
  { id: "ea-1", roleId: "executive-assistant", company: "VentureCapital Co", title: "Executive Assistant to CEO", location: "San Francisco, CA", salary: "$90K - $120K", type: "Full-time", remote: "Onsite", description: "Support high-growth startup CEO", logo: "👔" },
  { id: "ea-2", roleId: "executive-assistant", company: "GlobalCorp", title: "Senior Executive Assistant", location: "New York, NY", salary: "$85K - $110K", type: "Full-time", remote: "Hybrid", description: "Support C-suite leadership team", logo: "🏢" },
  { id: "ea-3", roleId: "executive-assistant", company: "TechGiant", title: "Executive Business Partner", location: "Seattle, WA", salary: "$95K - $125K", type: "Full-time", remote: "Hybrid", description: "Strategic support for VP Engineering", logo: "🔧" },
  
  // Data Analyst
  { id: "da-1", roleId: "data-analyst", company: "InsightsCo", title: "Senior Data Analyst", location: "Boston, MA", salary: "$100K - $130K", type: "Full-time", remote: "Remote", description: "Turn data into business strategy", logo: "📉" },
  { id: "da-2", roleId: "data-analyst", company: "RetailTech", title: "Business Intelligence Analyst", location: "Chicago, IL", salary: "$90K - $115K", type: "Full-time", remote: "Hybrid", description: "Analyze retail performance data", logo: "🛒" },
  { id: "da-3", roleId: "data-analyst", company: "FinData", title: "Financial Data Analyst", location: "New York, NY", salary: "$110K - $140K", type: "Full-time", remote: "Onsite", description: "Model financial market trends", logo: "💹" },
  
  // Customer Support
  { id: "sup-1", roleId: "customer-support", company: "HelpDesk Pro", title: "Customer Success Manager", location: "Austin, TX", salary: "$70K - $90K", type: "Full-time", remote: "Remote", description: "Ensure customer satisfaction and retention", logo: "🤝" },
  { id: "sup-2", roleId: "customer-support", company: "SaaSSupport", title: "Senior Support Specialist", location: "Denver, CO", salary: "$60K - $80K", type: "Full-time", remote: "Remote", description: "Provide expert technical support", logo: "🎧" },
  { id: "sup-3", roleId: "customer-support", company: "E-Commerce Plus", title: "Support Team Lead", location: "Phoenix, AZ", salary: "$75K - $95K", type: "Full-time", remote: "Hybrid", description: "Lead and mentor support team", logo: "⭐" },
];

export interface GameQuestion {
  id: string;
  question: string;
  type: "single" | "multiple" | "scale";
  options?: string[];
  category: "skills" | "culture";
}

// Skills/Experience Questions for Employers (What they're looking for)
export const EMPLOYER_SKILLS_QUESTIONS: GameQuestion[] = [
  {
    id: "work-arrangement",
    question: "What work arrangement do you offer?",
    type: "single",
    options: ["Fully Remote", "Hybrid (2-3 days)", "Onsite Only", "Flexible"],
    category: "skills",
  },
  {
    id: "travel-requirement",
    question: "How much travel is required?",
    type: "single",
    options: ["None", "Occasional (1-2x/month)", "Regular (Weekly)", "Frequent (50%+)"],
    category: "skills",
  },
  {
    id: "experience-level",
    question: "What experience level are you seeking?",
    type: "single",
    options: ["Entry Level (0-2 years)", "Mid Level (3-5 years)", "Senior (6-10 years)", "Executive (10+ years)"],
    category: "skills",
  },
  {
    id: "education",
    question: "Education requirement?",
    type: "single",
    options: ["No Degree Required", "Bachelor's Preferred", "Bachelor's Required", "Advanced Degree"],
    category: "skills",
  },
  {
    id: "team-size",
    question: "What's your team size?",
    type: "single",
    options: ["Solo/Founder", "Small (2-10)", "Medium (11-50)", "Large (50+)"],
    category: "skills",
  },
  {
    id: "work-style",
    question: "Preferred work style?",
    type: "single",
    options: ["Independent", "Collaborative", "Mix of Both", "Highly Structured"],
    category: "skills",
  },
  {
    id: "communication",
    question: "Communication preference?",
    type: "single",
    options: ["Async (Slack/Email)", "Sync (Meetings)", "Balanced Mix", "Documentation-First"],
    category: "skills",
  },
  {
    id: "pace",
    question: "Work pace environment?",
    type: "single",
    options: ["Fast-Paced Startup", "Moderate Growth", "Steady & Stable", "Project-Based Sprints"],
    category: "skills",
  },
  {
    id: "decision-making",
    question: "Decision-making style?",
    type: "single",
    options: ["Autonomous", "Consensus-Based", "Top-Down", "Data-Driven"],
    category: "skills",
  },
  {
    id: "growth-focus",
    question: "Growth opportunity focus?",
    type: "single",
    options: ["Technical Skills", "Leadership Path", "Cross-Functional", "Specialization"],
    category: "skills",
  },
  {
    id: "deadline-style",
    question: "How do you handle deadlines?",
    type: "single",
    options: ["Strict Deadlines", "Flexible Timelines", "Sprint-Based", "Goal-Oriented"],
    category: "skills",
  },
  {
    id: "feedback-frequency",
    question: "Feedback frequency?",
    type: "single",
    options: ["Daily Check-ins", "Weekly 1:1s", "Bi-weekly Reviews", "Quarterly"],
    category: "skills",
  },
  {
    id: "tech-stack",
    question: "Technical environment?",
    type: "single",
    options: ["Cutting Edge", "Modern & Stable", "Legacy Systems", "Mixed"],
    category: "skills",
  },
  {
    id: "learning-support",
    question: "Learning & development support?",
    type: "single",
    options: ["Conference Budget", "Course Subscriptions", "Mentorship Program", "All of the Above"],
    category: "skills",
  },
  {
    id: "personality-trait",
    question: "Key personality trait you value most?",
    type: "single",
    options: ["Problem Solver", "Creative Thinker", "Strong Communicator", "Detail-Oriented"],
    category: "skills",
  },
];

// Culture Questions for Employers
export const EMPLOYER_CULTURE_QUESTIONS: GameQuestion[] = [
  {
    id: "company-stage",
    question: "What's your company stage?",
    type: "single",
    options: ["Pre-Seed/Seed", "Series A/B", "Growth Stage", "Enterprise"],
    category: "culture",
  },
  {
    id: "work-life-balance",
    question: "Work-life balance philosophy?",
    type: "single",
    options: ["Hustle Culture", "Balanced", "Family-First", "Results-Only"],
    category: "culture",
  },
  {
    id: "office-vibe",
    question: "Office/team vibe?",
    type: "single",
    options: ["Professional & Formal", "Casual & Fun", "Mission-Driven", "Creative & Quirky"],
    category: "culture",
  },
  {
    id: "social-activities",
    question: "Team social activities?",
    type: "single",
    options: ["Weekly Events", "Monthly Gatherings", "Quarterly Offsites", "Optional & Organic"],
    category: "culture",
  },
  {
    id: "diversity",
    question: "DEI commitment level?",
    type: "single",
    options: ["Active Initiatives", "Growing Focus", "Standard Policies", "Building Foundation"],
    category: "culture",
  },
  {
    id: "benefits-priority",
    question: "Top benefit you offer?",
    type: "single",
    options: ["Equity/Stock", "Health & Wellness", "Unlimited PTO", "Learning Budget"],
    category: "culture",
  },
  {
    id: "leadership-style",
    question: "Leadership style?",
    type: "single",
    options: ["Servant Leadership", "Visionary", "Democratic", "Coaching"],
    category: "culture",
  },
  {
    id: "innovation",
    question: "Innovation approach?",
    type: "single",
    options: ["Move Fast, Break Things", "Calculated Risks", "Steady Innovation", "Industry Standard"],
    category: "culture",
  },
  {
    id: "transparency",
    question: "Company transparency level?",
    type: "single",
    options: ["Open Book (Full)", "Key Metrics Shared", "Need-to-Know", "Traditional"],
    category: "culture",
  },
  {
    id: "conflict-resolution",
    question: "How conflicts are resolved?",
    type: "single",
    options: ["Direct Conversation", "Mediated Discussion", "Manager Escalation", "HR Process"],
    category: "culture",
  },
  {
    id: "recognition",
    question: "How do you recognize achievements?",
    type: "single",
    options: ["Public Praise", "Bonuses/Rewards", "Career Advancement", "All of the Above"],
    category: "culture",
  },
  {
    id: "meetings",
    question: "Meeting culture?",
    type: "single",
    options: ["Meeting-Heavy", "Minimal Meetings", "Structured Stand-ups", "As-Needed"],
    category: "culture",
  },
  {
    id: "failure-attitude",
    question: "Attitude toward failure?",
    type: "single",
    options: ["Fail Fast, Learn", "Careful Planning", "Blame-Free Post-mortems", "Prevention Focus"],
    category: "culture",
  },
  {
    id: "mission-importance",
    question: "How central is company mission?",
    type: "single",
    options: ["Core to Everything", "Guiding Principle", "Background Context", "Business-First"],
    category: "culture",
  },
  {
    id: "fun-factor",
    question: "Fun at work priority?",
    type: "single",
    options: ["High Priority", "Natural & Organic", "Work-Focused", "Celebrate Wins"],
    category: "culture",
  },
];

// Candidate questions mirror employer questions for matching
export const CANDIDATE_SKILLS_QUESTIONS: GameQuestion[] = [
  {
    id: "work-arrangement",
    question: "What work arrangement do you prefer?",
    type: "single",
    options: ["Fully Remote", "Hybrid (2-3 days)", "Onsite Only", "Flexible"],
    category: "skills",
  },
  {
    id: "travel-willingness",
    question: "How much are you willing to travel?",
    type: "single",
    options: ["None", "Occasional (1-2x/month)", "Regular (Weekly)", "Frequently (50%+)"],
    category: "skills",
  },
  {
    id: "experience-level",
    question: "What's your experience level?",
    type: "single",
    options: ["Entry Level (0-2 years)", "Mid Level (3-5 years)", "Senior (6-10 years)", "Executive (10+ years)"],
    category: "skills",
  },
  {
    id: "education",
    question: "Your highest education?",
    type: "single",
    options: ["No Degree", "Bachelor's Degree", "Master's Degree", "PhD/Doctorate"],
    category: "skills",
  },
  {
    id: "team-size-pref",
    question: "Preferred team size?",
    type: "single",
    options: ["Solo/Small Startup", "Small (2-10)", "Medium (11-50)", "Large (50+)"],
    category: "skills",
  },
  {
    id: "work-style",
    question: "Your work style?",
    type: "single",
    options: ["Independent", "Collaborative", "Mix of Both", "Highly Structured"],
    category: "skills",
  },
  {
    id: "communication",
    question: "Communication preference?",
    type: "single",
    options: ["Async (Slack/Email)", "Sync (Meetings)", "Balanced Mix", "Documentation-First"],
    category: "skills",
  },
  {
    id: "pace",
    question: "Preferred work pace?",
    type: "single",
    options: ["Fast-Paced Startup", "Moderate Growth", "Steady & Stable", "Project-Based Sprints"],
    category: "skills",
  },
  {
    id: "decision-making",
    question: "How do you prefer to make decisions?",
    type: "single",
    options: ["Autonomously", "Through Consensus", "With Clear Direction", "Data-Driven"],
    category: "skills",
  },
  {
    id: "growth-focus",
    question: "What growth matters most to you?",
    type: "single",
    options: ["Technical Skills", "Leadership Path", "Cross-Functional", "Deep Specialization"],
    category: "skills",
  },
  {
    id: "deadline-style",
    question: "How do you handle deadlines?",
    type: "single",
    options: ["Thrive Under Pressure", "Prefer Buffer Time", "Sprint-Based Work", "Goal-Oriented"],
    category: "skills",
  },
  {
    id: "feedback-frequency",
    question: "How often do you want feedback?",
    type: "single",
    options: ["Daily Check-ins", "Weekly 1:1s", "Bi-weekly Reviews", "Quarterly"],
    category: "skills",
  },
  {
    id: "tech-environment",
    question: "Preferred tech environment?",
    type: "single",
    options: ["Cutting Edge", "Modern & Stable", "Legacy Systems OK", "Any"],
    category: "skills",
  },
  {
    id: "learning-style",
    question: "How do you learn best?",
    type: "single",
    options: ["Conferences & Events", "Online Courses", "Mentorship", "Self-Directed"],
    category: "skills",
  },
  {
    id: "strength",
    question: "Your greatest strength?",
    type: "single",
    options: ["Problem Solving", "Creative Thinking", "Communication", "Attention to Detail"],
    category: "skills",
  },
];

export const CANDIDATE_CULTURE_QUESTIONS: GameQuestion[] = [
  {
    id: "company-stage",
    question: "Preferred company stage?",
    type: "single",
    options: ["Early Startup", "Growth Stage", "Established", "Enterprise"],
    category: "culture",
  },
  {
    id: "work-life-balance",
    question: "Work-life balance preference?",
    type: "single",
    options: ["All-In Hustle", "Balanced", "Family-First", "Results-Only"],
    category: "culture",
  },
  {
    id: "office-vibe",
    question: "Preferred team vibe?",
    type: "single",
    options: ["Professional & Formal", "Casual & Fun", "Mission-Driven", "Creative & Quirky"],
    category: "culture",
  },
  {
    id: "social-activities",
    question: "Social activities preference?",
    type: "single",
    options: ["Love Weekly Events", "Monthly is Good", "Quarterly Offsites", "Optional Only"],
    category: "culture",
  },
  {
    id: "diversity-importance",
    question: "How important is DEI to you?",
    type: "single",
    options: ["Critical Priority", "Very Important", "Somewhat Important", "Not a Factor"],
    category: "culture",
  },
  {
    id: "benefits-priority",
    question: "Most important benefit?",
    type: "single",
    options: ["Equity/Stock", "Health & Wellness", "Unlimited PTO", "Learning Budget"],
    category: "culture",
  },
  {
    id: "leadership-pref",
    question: "Preferred leadership style?",
    type: "single",
    options: ["Supportive & Serving", "Visionary & Bold", "Democratic", "Coaching & Mentoring"],
    category: "culture",
  },
  {
    id: "risk-tolerance",
    question: "Your risk tolerance?",
    type: "single",
    options: ["Love Taking Risks", "Calculated Risks", "Prefer Stability", "Play It Safe"],
    category: "culture",
  },
  {
    id: "transparency-need",
    question: "How much transparency do you need?",
    type: "single",
    options: ["Full Open Book", "Key Metrics", "Role-Relevant Info", "Task-Focused"],
    category: "culture",
  },
  {
    id: "conflict-style",
    question: "How do you handle conflict?",
    type: "single",
    options: ["Direct Conversation", "Prefer Mediation", "Manager Support", "Formal Process"],
    category: "culture",
  },
  {
    id: "recognition-pref",
    question: "How do you prefer recognition?",
    type: "single",
    options: ["Public Praise", "Private Acknowledgment", "Bonuses/Rewards", "Career Growth"],
    category: "culture",
  },
  {
    id: "meeting-tolerance",
    question: "Meeting tolerance?",
    type: "single",
    options: ["Love Meetings", "Minimal Please", "Structured Stand-ups", "As-Needed Only"],
    category: "culture",
  },
  {
    id: "failure-comfort",
    question: "Comfort with failure?",
    type: "single",
    options: ["Fail Fast Mindset", "Learn from Mistakes", "Prefer Prevention", "Risk-Averse"],
    category: "culture",
  },
  {
    id: "mission-importance",
    question: "How important is company mission?",
    type: "single",
    options: ["Must Be Passionate", "Nice to Have", "Secondary Factor", "Just Want Good Work"],
    category: "culture",
  },
  {
    id: "fun-at-work",
    question: "Fun at work importance?",
    type: "single",
    options: ["Essential", "Nice to Have", "Work is Work", "Celebrate Wins Only"],
    category: "culture",
  },
];
