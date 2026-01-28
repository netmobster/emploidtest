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
  cityId: string;
}

// New York Roles (original 10)
// Cities with readable names
export const CITIES = [
  { id: "new-york", name: "New York, NY" },
  { id: "toronto", name: "Toronto, ON" },
  { id: "los-angeles", name: "Los Angeles, CA" },
  { id: "chicago", name: "Chicago, IL" },
  { id: "san-francisco", name: "San Francisco, CA" },
  { id: "boston", name: "Boston, MA" },
  { id: "seattle", name: "Seattle, WA" },
  { id: "austin", name: "Austin, TX" },
  { id: "denver", name: "Denver, CO" },
  { id: "miami", name: "Miami, FL" },
];

// Test account IDs for development
export const TEST_EMPLOYER_ID = "ce451f07-c95e-453d-98ec-0a5099260939";
export const TEST_CANDIDATE_ID = "8edb0fa6-9d73-4c12-b1ee-079ca970f5f5";

export const ROLES: Role[] = [
  // NEW YORK ROLES
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Tech/Startup",
    icon: Briefcase,
    description: "Lead product strategy and roadmap development",
    cityId: "new-york",
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Tech",
    icon: Code,
    description: "Build and maintain software applications",
    cityId: "new-york",
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    category: "All Industries",
    icon: Megaphone,
    description: "Drive brand awareness and growth campaigns",
    cityId: "new-york",
  },
  {
    id: "ux-ui-designer",
    title: "UX/UI Designer",
    category: "Tech/Media",
    icon: Palette,
    description: "Design intuitive and beautiful user experiences",
    cityId: "new-york",
  },
  {
    id: "content-strategist",
    title: "Content Strategist",
    category: "Media/Startup",
    icon: FileText,
    description: "Plan and oversee content creation and distribution",
    cityId: "new-york",
  },
  {
    id: "web-designer",
    title: "Web Designer",
    category: "Tech/Media",
    icon: Globe,
    description: "Create visually stunning and functional websites",
    cityId: "new-york",
  },
  {
    id: "copywriter",
    title: "Copywriter",
    category: "Content",
    icon: PenTool,
    description: "Craft compelling copy that converts",
    cityId: "new-york",
  },
  {
    id: "executive-assistant",
    title: "Executive Assistant",
    category: "All Industries",
    icon: Users,
    description: "Support executives with high-level administrative tasks",
    cityId: "new-york",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Tech/Startup",
    icon: BarChart3,
    description: "Transform data into actionable insights",
    cityId: "new-york",
  },
  {
    id: "customer-support",
    title: "Customer Support",
    category: "All Industries",
    icon: Headphones,
    description: "Deliver exceptional customer experiences",
    cityId: "new-york",
  },

  // TORONTO ROLES
  {
    id: "product-manager-to",
    title: "Product Manager",
    category: "Tech/Fintech",
    icon: Briefcase,
    description: "Drive product innovation in Canada's tech hub",
    cityId: "toronto",
  },
  {
    id: "software-engineer-to",
    title: "Software Developer",
    category: "Tech",
    icon: Code,
    description: "Build cutting-edge applications for Canadian markets",
    cityId: "toronto",
  },
  {
    id: "marketing-manager-to",
    title: "Marketing Manager",
    category: "All Industries",
    icon: Megaphone,
    description: "Lead multi-channel marketing strategies",
    cityId: "toronto",
  },
  {
    id: "ux-ui-designer-to",
    title: "UX/UI Designer",
    category: "Tech/Media",
    icon: Palette,
    description: "Create user-centered digital experiences",
    cityId: "toronto",
  },
  {
    id: "content-strategist-to",
    title: "Content Strategist",
    category: "Media/Startup",
    icon: FileText,
    description: "Develop content strategies for diverse audiences",
    cityId: "toronto",
  },
  {
    id: "web-designer-to",
    title: "Web Designer",
    category: "Tech/Media",
    icon: Globe,
    description: "Design responsive, accessible web experiences",
    cityId: "toronto",
  },
  {
    id: "copywriter-to",
    title: "Copywriter",
    category: "Content",
    icon: PenTool,
    description: "Write persuasive copy for Canadian brands",
    cityId: "toronto",
  },
  {
    id: "executive-assistant-to",
    title: "Executive Assistant",
    category: "All Industries",
    icon: Users,
    description: "Provide strategic support to senior leadership",
    cityId: "toronto",
  },
  {
    id: "data-analyst-to",
    title: "Data Analyst",
    category: "Tech/Finance",
    icon: BarChart3,
    description: "Analyze data for business intelligence insights",
    cityId: "toronto",
  },
  {
    id: "customer-support-to",
    title: "Customer Support",
    category: "All Industries",
    icon: Headphones,
    description: "Provide bilingual customer service excellence",
    cityId: "toronto",
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

  // TORONTO JOBS
  // Product Manager - Toronto
  { id: "pm-to-1", roleId: "product-manager-to", company: "Shopify", title: "Senior Product Manager", location: "Toronto, ON", salary: "CAD $140K - $170K", type: "Full-time", remote: "Hybrid", description: "Lead product strategy for merchant tools", logo: "🛍️" },
  { id: "pm-to-2", roleId: "product-manager-to", company: "Wealthsimple", title: "Product Manager", location: "Toronto, ON", salary: "CAD $120K - $150K", type: "Full-time", remote: "Remote", description: "Build the future of financial services", logo: "💎" },
  { id: "pm-to-3", roleId: "product-manager-to", company: "RBC Ventures", title: "Product Lead", location: "Toronto, ON", salary: "CAD $130K - $160K", type: "Full-time", remote: "Hybrid", description: "Drive innovation in banking products", logo: "🏦" },

  // Software Developer - Toronto
  { id: "se-to-1", roleId: "software-engineer-to", company: "Constellation Software", title: "Full Stack Developer", location: "Toronto, ON", salary: "CAD $130K - $165K", type: "Full-time", remote: "Hybrid", description: "Build enterprise software solutions", logo: "⭐" },
  { id: "se-to-2", roleId: "software-engineer-to", company: "Clio", title: "Backend Developer", location: "Toronto, ON", salary: "CAD $120K - $150K", type: "Full-time", remote: "Remote", description: "Scale legal tech platform infrastructure", logo: "⚖️" },
  { id: "se-to-3", roleId: "software-engineer-to", company: "Hootsuite", title: "Senior Developer", location: "Toronto, ON", salary: "CAD $140K - $175K", type: "Full-time", remote: "Remote", description: "Build social media management tools", logo: "🦉" },

  // Marketing Manager - Toronto
  { id: "mm-to-1", roleId: "marketing-manager-to", company: "TouchBistro", title: "Growth Marketing Manager", location: "Toronto, ON", salary: "CAD $95K - $120K", type: "Full-time", remote: "Hybrid", description: "Drive restaurant tech adoption", logo: "🍽️" },
  { id: "mm-to-2", roleId: "marketing-manager-to", company: "Ritual", title: "Marketing Director", location: "Toronto, ON", salary: "CAD $110K - $140K", type: "Full-time", remote: "Hybrid", description: "Lead consumer marketing strategy", logo: "📱" },
  { id: "mm-to-3", roleId: "marketing-manager-to", company: "League", title: "Head of Marketing", location: "Toronto, ON", salary: "CAD $120K - $150K", type: "Full-time", remote: "Remote", description: "Build health benefits marketing", logo: "💚" },

  // UX/UI Designer - Toronto
  { id: "ux-to-1", roleId: "ux-ui-designer-to", company: "Koho", title: "Senior Product Designer", location: "Toronto, ON", salary: "CAD $120K - $150K", type: "Full-time", remote: "Remote", description: "Design fintech user experiences", logo: "💳" },
  { id: "ux-to-2", roleId: "ux-ui-designer-to", company: "Tulip", title: "UX Designer", location: "Toronto, ON", salary: "CAD $95K - $120K", type: "Full-time", remote: "Hybrid", description: "Create retail technology interfaces", logo: "🌷" },
  { id: "ux-to-3", roleId: "ux-ui-designer-to", company: "Ada", title: "UI/UX Lead", location: "Toronto, ON", salary: "CAD $130K - $160K", type: "Full-time", remote: "Remote", description: "Design AI chatbot experiences", logo: "🤖" },

  // Content Strategist - Toronto
  { id: "cs-to-1", roleId: "content-strategist-to", company: "Clearco", title: "Content Strategy Lead", location: "Toronto, ON", salary: "CAD $90K - $115K", type: "Full-time", remote: "Hybrid", description: "Shape fintech content narrative", logo: "📊" },
  { id: "cs-to-2", roleId: "content-strategist-to", company: "Benevity", title: "Senior Content Strategist", location: "Toronto, ON", salary: "CAD $95K - $120K", type: "Full-time", remote: "Remote", description: "Create corporate giving content", logo: "🎁" },
  { id: "cs-to-3", roleId: "content-strategist-to", company: "Points", title: "Content Director", location: "Toronto, ON", salary: "CAD $100K - $130K", type: "Full-time", remote: "Hybrid", description: "Lead loyalty program content", logo: "✈️" },

  // Web Designer - Toronto
  { id: "wd-to-1", roleId: "web-designer-to", company: "Unbounce", title: "Senior Web Designer", location: "Toronto, ON", salary: "CAD $90K - $115K", type: "Full-time", remote: "Remote", description: "Design landing page experiences", logo: "🎯" },
  { id: "wd-to-2", roleId: "web-designer-to", company: "Freshbooks", title: "Web Design Lead", location: "Toronto, ON", salary: "CAD $95K - $120K", type: "Full-time", remote: "Hybrid", description: "Lead accounting software web design", logo: "📒" },
  { id: "wd-to-3", roleId: "web-designer-to", company: "Vena Solutions", title: "Webflow Designer", location: "Toronto, ON", salary: "CAD $85K - $105K", type: "Contract", remote: "Remote", description: "Build financial planning web presence", logo: "📈" },

  // Copywriter - Toronto
  { id: "cw-to-1", roleId: "copywriter-to", company: "Faire", title: "Senior Copywriter", location: "Toronto, ON", salary: "CAD $85K - $110K", type: "Full-time", remote: "Hybrid", description: "Write B2B marketplace copy", logo: "🏪" },
  { id: "cw-to-2", roleId: "copywriter-to", company: "Top Hat", title: "Product Copywriter", location: "Toronto, ON", salary: "CAD $80K - $100K", type: "Full-time", remote: "Remote", description: "Craft edtech product messaging", logo: "🎓" },
  { id: "cw-to-3", roleId: "copywriter-to", company: "Nuvei", title: "Creative Copywriter", location: "Toronto, ON", salary: "CAD $75K - $95K", type: "Full-time", remote: "Hybrid", description: "Write payment solutions content", logo: "💰" },

  // Executive Assistant - Toronto
  { id: "ea-to-1", roleId: "executive-assistant-to", company: "OMERS", title: "Executive Assistant to CEO", location: "Toronto, ON", salary: "CAD $95K - $125K", type: "Full-time", remote: "Hybrid", description: "Support pension fund CEO", logo: "🏛️" },
  { id: "ea-to-2", roleId: "executive-assistant-to", company: "TMX Group", title: "Senior Executive Assistant", location: "Toronto, ON", salary: "CAD $85K - $110K", type: "Full-time", remote: "Onsite", description: "Support stock exchange leadership", logo: "📈" },
  { id: "ea-to-3", roleId: "executive-assistant-to", company: "Manulife", title: "Executive Business Partner", location: "Toronto, ON", salary: "CAD $90K - $120K", type: "Full-time", remote: "Hybrid", description: "Strategic support for insurance VP", logo: "🛡️" },

  // Data Analyst - Toronto
  { id: "da-to-1", roleId: "data-analyst-to", company: "TD Bank", title: "Senior Data Analyst", location: "Toronto, ON", salary: "CAD $100K - $130K", type: "Full-time", remote: "Hybrid", description: "Analyze banking customer insights", logo: "🏦" },
  { id: "da-to-2", roleId: "data-analyst-to", company: "Loblaw Digital", title: "Business Intelligence Analyst", location: "Toronto, ON", salary: "CAD $90K - $115K", type: "Full-time", remote: "Hybrid", description: "Analyze retail performance data", logo: "🛒" },
  { id: "da-to-3", roleId: "data-analyst-to", company: "Element Fleet", title: "Financial Data Analyst", location: "Toronto, ON", salary: "CAD $95K - $120K", type: "Full-time", remote: "Remote", description: "Model fleet management trends", logo: "🚗" },

  // Customer Support - Toronto
  { id: "sup-to-1", roleId: "customer-support-to", company: "1Password", title: "Customer Success Manager", location: "Toronto, ON", salary: "CAD $80K - $100K", type: "Full-time", remote: "Remote", description: "Ensure security product adoption", logo: "🔐" },
  { id: "sup-to-2", roleId: "customer-support-to", company: "Loom", title: "Senior Support Specialist", location: "Toronto, ON", salary: "CAD $70K - $85K", type: "Full-time", remote: "Remote", description: "Provide video platform support", logo: "🎥" },
  { id: "sup-to-3", roleId: "customer-support-to", company: "Clearbanc", title: "Support Team Lead", location: "Toronto, ON", salary: "CAD $85K - $105K", type: "Full-time", remote: "Hybrid", description: "Lead fintech support team", logo: "💸" },
];

export interface Candidate {
  id: string;
  roleId: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  experience: string;
  salary: string;
  bio: string;
  skills: string[];
  education: string;
  availability: "Immediately" | "2 weeks" | "1 month" | "Flexible";
  remote: "Remote" | "Hybrid" | "Onsite" | "Flexible";
}

export const SAMPLE_CANDIDATES: Candidate[] = [
  // Product Managers
  { id: "c-pm-1", roleId: "product-manager", name: "Sarah Chen", avatar: "👩‍💼", title: "Senior Product Manager", location: "San Francisco, CA", experience: "7 years", salary: "$160K - $190K", bio: "Passionate about building products that solve real problems. Led product teams at two successful startups through Series B.", skills: ["Product Strategy", "Agile/Scrum", "Data Analysis", "User Research", "Roadmapping"], education: "MBA, Stanford University", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-pm-2", roleId: "product-manager", name: "Marcus Johnson", avatar: "👨‍💼", title: "Product Manager", location: "New York, NY", experience: "4 years", salary: "$130K - $155K", bio: "Former software engineer turned PM. Brings technical depth to product decisions and loves mentoring junior PMs.", skills: ["Technical PM", "SQL", "A/B Testing", "Stakeholder Management", "PRDs"], education: "BS Computer Science, MIT", availability: "1 month", remote: "Remote" },
  { id: "c-pm-3", roleId: "product-manager", name: "Emily Rodriguez", avatar: "👩‍🦰", title: "Associate Product Manager", location: "Austin, TX", experience: "2 years", salary: "$100K - $120K", bio: "Fast learner with a background in UX design. Excited about consumer products and growth-stage startups.", skills: ["User Experience", "Wireframing", "Competitive Analysis", "Jira", "Customer Interviews"], education: "BA Design, RISD", availability: "Immediately", remote: "Flexible" },
  
  // Software Engineers
  { id: "c-se-1", roleId: "software-engineer", name: "Alex Kim", avatar: "👨‍💻", title: "Senior Full Stack Engineer", location: "Seattle, WA", experience: "8 years", salary: "$180K - $220K", bio: "Full stack engineer with expertise in React, Node.js, and AWS. Open source contributor and tech speaker.", skills: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "GraphQL"], education: "MS Computer Science, University of Washington", availability: "1 month", remote: "Remote" },
  { id: "c-se-2", roleId: "software-engineer", name: "Priya Patel", avatar: "👩‍💻", title: "Backend Engineer", location: "Boston, MA", experience: "5 years", salary: "$150K - $175K", bio: "Specializing in distributed systems and microservices. Previously at a major fintech company scaling payment systems.", skills: ["Python", "Go", "Kubernetes", "Redis", "gRPC", "System Design"], education: "BS Computer Engineering, Georgia Tech", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-se-3", roleId: "software-engineer", name: "Jordan Lee", avatar: "🧑‍💻", title: "Frontend Developer", location: "Denver, CO", experience: "3 years", salary: "$120K - $145K", bio: "Passionate about creating beautiful, accessible web experiences. Active in the React community.", skills: ["React", "Vue.js", "CSS/Tailwind", "Accessibility", "Performance Optimization"], education: "Bootcamp Graduate, General Assembly", availability: "Immediately", remote: "Remote" },
  
  // Marketing Managers
  { id: "c-mm-1", roleId: "marketing-manager", name: "Jessica Wang", avatar: "👩‍🎤", title: "Growth Marketing Lead", location: "Los Angeles, CA", experience: "6 years", salary: "$120K - $145K", bio: "Data-driven marketer with experience scaling startups from seed to Series C. Expert in paid acquisition and retention.", skills: ["Paid Ads", "Analytics", "SEO/SEM", "Marketing Automation", "Budget Management"], education: "BA Marketing, UCLA", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-mm-2", roleId: "marketing-manager", name: "David Thompson", avatar: "👨‍🎨", title: "Brand Marketing Manager", location: "Chicago, IL", experience: "5 years", salary: "$100K - $125K", bio: "Creative strategist who builds memorable brand experiences. Background in agency and in-house roles.", skills: ["Brand Strategy", "Content Marketing", "Social Media", "Influencer Marketing", "Creative Direction"], education: "BFA Advertising, School of Visual Arts", availability: "1 month", remote: "Remote" },
  { id: "c-mm-3", roleId: "marketing-manager", name: "Amanda Foster", avatar: "👩‍💼", title: "Digital Marketing Specialist", location: "Miami, FL", experience: "3 years", salary: "$80K - $100K", bio: "Focused on B2B SaaS marketing with strong analytics background. Love experimenting with new channels.", skills: ["Google Ads", "LinkedIn Ads", "HubSpot", "Email Marketing", "Conversion Optimization"], education: "BS Business, University of Florida", availability: "Immediately", remote: "Flexible" },
  
  // UX/UI Designers
  { id: "c-ux-1", roleId: "ux-ui-designer", name: "Nina Kowalski", avatar: "👩‍🎨", title: "Senior Product Designer", location: "San Francisco, CA", experience: "7 years", salary: "$150K - $180K", bio: "End-to-end product designer with a passion for design systems. Led design at two YC startups.", skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Design Thinking"], education: "MFA Design, Parsons", availability: "1 month", remote: "Remote" },
  { id: "c-ux-2", roleId: "ux-ui-designer", name: "Tyler Brooks", avatar: "👨‍🎨", title: "UX Designer", location: "Portland, OR", experience: "4 years", salary: "$110K - $135K", bio: "User advocate who combines research with beautiful interfaces. Specializes in mobile-first design.", skills: ["User Testing", "Figma", "Sketch", "Mobile Design", "Interaction Design"], education: "BA Cognitive Science, UC Berkeley", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-ux-3", roleId: "ux-ui-designer", name: "Maya Singh", avatar: "👩‍🦱", title: "UI Designer", location: "New York, NY", experience: "2 years", salary: "$85K - $105K", bio: "Visual designer with a keen eye for aesthetics and micro-interactions. Loves creating delightful experiences.", skills: ["Visual Design", "Illustration", "Motion Design", "Figma", "After Effects"], education: "BFA Graphic Design, Pratt Institute", availability: "Immediately", remote: "Flexible" },
  
  // Content Strategists
  { id: "c-cs-1", roleId: "content-strategist", name: "Rachel Green", avatar: "👩‍✈️", title: "Head of Content", location: "New York, NY", experience: "8 years", salary: "$130K - $155K", bio: "Built content teams from scratch at multiple startups. Expert in SEO-driven content and thought leadership.", skills: ["Content Strategy", "SEO", "Editorial Management", "Brand Voice", "Content Operations"], education: "MA Journalism, Columbia University", availability: "1 month", remote: "Remote" },
  { id: "c-cs-2", roleId: "content-strategist", name: "Chris Martinez", avatar: "👨‍🏫", title: "Content Strategist", location: "Austin, TX", experience: "5 years", salary: "$95K - $115K", bio: "Storyteller at heart with a data-driven approach. Specializes in B2B tech content that converts.", skills: ["Technical Writing", "Analytics", "WordPress", "Video Content", "Content Distribution"], education: "BA English, University of Texas", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-cs-3", roleId: "content-strategist", name: "Sophie Turner", avatar: "👩‍🎓", title: "Junior Content Strategist", location: "Denver, CO", experience: "2 years", salary: "$70K - $85K", bio: "Creative writer transitioning into strategy. Passionate about making complex topics accessible.", skills: ["Copywriting", "Social Media", "Research", "Canva", "Newsletter Management"], education: "BA Communications, CU Boulder", availability: "Immediately", remote: "Remote" },
  
  // Web Designers
  { id: "c-wd-1", roleId: "web-designer", name: "Lucas Anderson", avatar: "👨‍🎤", title: "Senior Web Designer", location: "Los Angeles, CA", experience: "6 years", salary: "$110K - $135K", bio: "Webflow expert who builds stunning, performant marketing sites. Portfolio includes Fortune 500 clients.", skills: ["Webflow", "Figma", "HTML/CSS", "Animation", "Responsive Design"], education: "BFA Web Design, Art Center", availability: "2 weeks", remote: "Remote" },
  { id: "c-wd-2", roleId: "web-designer", name: "Emma Wilson", avatar: "👩‍🎨", title: "Web Designer", location: "Seattle, WA", experience: "4 years", salary: "$90K - $110K", bio: "Combines creativity with conversion optimization. Love creating sites that look great and perform.", skills: ["WordPress", "Elementor", "Adobe Suite", "UI Design", "A/B Testing"], education: "BS Graphic Design, SCAD", availability: "1 month", remote: "Hybrid" },
  { id: "c-wd-3", roleId: "web-designer", name: "Jake Morris", avatar: "🧑‍🎨", title: "Junior Web Designer", location: "Austin, TX", experience: "1 year", salary: "$65K - $80K", bio: "Self-taught designer eager to grow. Strong foundation in modern design tools and CSS.", skills: ["Figma", "Framer", "Tailwind CSS", "JavaScript Basics", "Brand Design"], education: "Self-taught / Online Courses", availability: "Immediately", remote: "Flexible" },
  
  // Copywriters
  { id: "c-cw-1", roleId: "copywriter", name: "Olivia Hayes", avatar: "👩‍🦳", title: "Senior Copywriter", location: "New York, NY", experience: "7 years", salary: "$100K - $125K", bio: "Award-winning copywriter with agency and in-house experience. Specializes in brand voice and campaigns.", skills: ["Brand Copywriting", "Advertising", "Storytelling", "Script Writing", "Creative Concepts"], education: "BA Creative Writing, NYU", availability: "1 month", remote: "Hybrid" },
  { id: "c-cw-2", roleId: "copywriter", name: "Ben Carter", avatar: "👨‍🦲", title: "Conversion Copywriter", location: "San Francisco, CA", experience: "4 years", salary: "$90K - $110K", bio: "Direct response copywriter focused on SaaS. My copy has generated millions in revenue.", skills: ["Landing Pages", "Email Sequences", "A/B Testing", "UX Writing", "Sales Pages"], education: "BS Marketing, USC", availability: "2 weeks", remote: "Remote" },
  { id: "c-cw-3", roleId: "copywriter", name: "Zoe Adams", avatar: "👩‍🎤", title: "Content Writer", location: "Chicago, IL", experience: "2 years", salary: "$65K - $80K", bio: "Versatile writer comfortable with blogs, social, and long-form content. Quick turnaround without sacrificing quality.", skills: ["Blog Writing", "Social Copy", "SEO Writing", "Research", "Editing"], education: "BA Journalism, Northwestern", availability: "Immediately", remote: "Remote" },
  
  // Executive Assistants
  { id: "c-ea-1", roleId: "executive-assistant", name: "Michelle Rivera", avatar: "👩‍💼", title: "Executive Business Partner", location: "San Francisco, CA", experience: "10 years", salary: "$110K - $140K", bio: "Supported C-suite executives at tech giants and startups. Expert at managing complex calendars and travel.", skills: ["Calendar Management", "Travel Coordination", "Event Planning", "Confidentiality", "Project Management"], education: "BA Business Administration, San Jose State", availability: "1 month", remote: "Hybrid" },
  { id: "c-ea-2", roleId: "executive-assistant", name: "Daniel Kim", avatar: "👨‍💼", title: "Executive Assistant", location: "New York, NY", experience: "5 years", salary: "$80K - $100K", bio: "Detail-oriented EA who anticipates needs before they arise. Strong background in finance and legal environments.", skills: ["Microsoft Office", "Expense Management", "Meeting Coordination", "Document Preparation", "Stakeholder Communication"], education: "AS Business, Borough of Manhattan CC", availability: "2 weeks", remote: "Onsite" },
  { id: "c-ea-3", roleId: "executive-assistant", name: "Ashley Brown", avatar: "👩‍🦰", title: "Administrative Assistant", location: "Boston, MA", experience: "2 years", salary: "$55K - $70K", bio: "Organized and proactive admin ready to grow into an EA role. Great with technology and learning new tools.", skills: ["Google Workspace", "Scheduling", "Data Entry", "Customer Service", "Office Management"], education: "BA Communications, Boston University", availability: "Immediately", remote: "Flexible" },
  
  // Data Analysts
  { id: "c-da-1", roleId: "data-analyst", name: "Kevin Zhang", avatar: "👨‍🔬", title: "Senior Data Analyst", location: "Boston, MA", experience: "6 years", salary: "$120K - $145K", bio: "Transform complex data into actionable insights. Experience in e-commerce, fintech, and healthcare analytics.", skills: ["SQL", "Python", "Tableau", "Statistical Analysis", "Data Modeling"], education: "MS Statistics, Harvard", availability: "1 month", remote: "Remote" },
  { id: "c-da-2", roleId: "data-analyst", name: "Lisa Nguyen", avatar: "👩‍🔬", title: "Business Analyst", location: "Chicago, IL", experience: "4 years", salary: "$95K - $115K", bio: "Bridge between business and data teams. Strong communication skills and ability to translate insights for executives.", skills: ["Excel", "Power BI", "SQL", "Business Intelligence", "Reporting"], education: "BS Economics, University of Chicago", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-da-3", roleId: "data-analyst", name: "Ryan O'Brien", avatar: "🧑‍💻", title: "Junior Data Analyst", location: "Denver, CO", experience: "1 year", salary: "$70K - $85K", bio: "Recent graduate passionate about data storytelling. Strong foundation in statistics and visualization.", skills: ["Python", "R", "Google Sheets", "Data Visualization", "Basic ML"], education: "BS Data Science, CU Denver", availability: "Immediately", remote: "Remote" },
  
  // Customer Support
  { id: "c-sup-1", roleId: "customer-support", name: "Jennifer Lopez", avatar: "👩‍🎧", title: "Customer Success Manager", location: "Austin, TX", experience: "5 years", salary: "$85K - $105K", bio: "Passionate about customer advocacy and retention. Reduced churn by 40% at previous company.", skills: ["Account Management", "Zendesk", "Salesforce", "Onboarding", "Upselling"], education: "BA Psychology, UT Austin", availability: "2 weeks", remote: "Remote" },
  { id: "c-sup-2", roleId: "customer-support", name: "Michael Scott", avatar: "👨‍🎧", title: "Technical Support Specialist", location: "Seattle, WA", experience: "3 years", salary: "$65K - $80K", bio: "Tech-savvy support professional who can troubleshoot complex issues and explain solutions simply.", skills: ["Technical Troubleshooting", "Intercom", "Documentation", "API Support", "Bug Reporting"], education: "AS Computer Science, Seattle Central", availability: "1 month", remote: "Hybrid" },
  { id: "c-sup-3", roleId: "customer-support", name: "Sarah Miller", avatar: "👩‍💻", title: "Support Representative", location: "Phoenix, AZ", experience: "1 year", salary: "$45K - $55K", bio: "Friendly and patient support rep with excellent written communication. Quick learner ready to grow.", skills: ["Live Chat", "Email Support", "CRM", "Problem Solving", "Multitasking"], education: "BA Communications, ASU", availability: "Immediately", remote: "Flexible" },

  // TORONTO CANDIDATES
  // Product Managers - Toronto
  { id: "c-pm-to-1", roleId: "product-manager-to", name: "Aisha Patel", avatar: "👩‍💼", title: "Senior Product Manager", location: "Toronto, ON", experience: "8 years", salary: "CAD $150K - $180K", bio: "Led product teams at Shopify and Wealthsimple. Expert in fintech and e-commerce product development.", skills: ["Product Strategy", "Agile/Scrum", "Fintech", "E-commerce", "Stakeholder Management"], education: "MBA, Rotman School of Management", availability: "1 month", remote: "Hybrid" },
  { id: "c-pm-to-2", roleId: "product-manager-to", name: "James Chen", avatar: "👨‍💼", title: "Product Manager", location: "Toronto, ON", experience: "5 years", salary: "CAD $120K - $145K", bio: "Former developer with strong technical background. Passionate about building products that scale.", skills: ["Technical PM", "SQL", "API Design", "User Research", "Data Analytics"], education: "BCS, University of Waterloo", availability: "2 weeks", remote: "Remote" },
  { id: "c-pm-to-3", roleId: "product-manager-to", name: "Priya Sharma", avatar: "👩‍🦰", title: "Associate Product Manager", location: "Toronto, ON", experience: "2 years", salary: "CAD $85K - $105K", bio: "Rising PM with consulting background. Strong analytical skills and customer empathy.", skills: ["Market Research", "Competitive Analysis", "Jira", "Presentation Skills", "Customer Interviews"], education: "BComm, McGill University", availability: "Immediately", remote: "Flexible" },

  // Software Developers - Toronto
  { id: "c-se-to-1", roleId: "software-engineer-to", name: "Wei Zhang", avatar: "👨‍💻", title: "Senior Full Stack Developer", location: "Toronto, ON", experience: "9 years", salary: "CAD $160K - $195K", bio: "Full stack developer with expertise in React, Node.js, and cloud architecture. Active open source contributor.", skills: ["React", "TypeScript", "Node.js", "AWS", "MongoDB", "GraphQL"], education: "MASc Computer Engineering, University of Toronto", availability: "1 month", remote: "Remote" },
  { id: "c-se-to-2", roleId: "software-engineer-to", name: "Fatima Hassan", avatar: "👩‍💻", title: "Backend Developer", location: "Toronto, ON", experience: "6 years", salary: "CAD $135K - $165K", bio: "Specialized in distributed systems and microservices. Previously scaled payment systems at Stripe.", skills: ["Python", "Go", "Kubernetes", "PostgreSQL", "gRPC", "System Design"], education: "BSc Computer Science, University of Waterloo", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-se-to-3", roleId: "software-engineer-to", name: "Liam O'Connor", avatar: "🧑‍💻", title: "Frontend Developer", location: "Toronto, ON", experience: "3 years", salary: "CAD $100K - $125K", bio: "Passionate about accessible, performant web experiences. Active in Toronto tech community.", skills: ["React", "Next.js", "CSS/Tailwind", "Accessibility", "Testing"], education: "Diploma, Lighthouse Labs", availability: "Immediately", remote: "Remote" },

  // Marketing Managers - Toronto
  { id: "c-mm-to-1", roleId: "marketing-manager-to", name: "Sophie Tremblay", avatar: "👩‍🎤", title: "Growth Marketing Lead", location: "Toronto, ON", experience: "7 years", salary: "CAD $110K - $140K", bio: "Bilingual marketer with experience scaling Canadian startups. Expert in CAC optimization.", skills: ["Paid Acquisition", "Analytics", "SEO/SEM", "Marketing Automation", "French/English"], education: "BCom Marketing, HEC Montreal", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-mm-to-2", roleId: "marketing-manager-to", name: "Marcus Williams", avatar: "👨‍🎨", title: "Brand Marketing Manager", location: "Toronto, ON", experience: "5 years", salary: "CAD $95K - $120K", bio: "Creative strategist with agency experience. Built brand campaigns for major Canadian retailers.", skills: ["Brand Strategy", "Content Marketing", "Social Media", "Campaign Management", "Creative Direction"], education: "BFA, OCAD University", availability: "1 month", remote: "Remote" },
  { id: "c-mm-to-3", roleId: "marketing-manager-to", name: "Emma Thompson", avatar: "👩‍💼", title: "Digital Marketing Specialist", location: "Toronto, ON", experience: "3 years", salary: "CAD $75K - $95K", bio: "Data-driven marketer specializing in B2B SaaS. Certified in all major ad platforms.", skills: ["Google Ads", "LinkedIn Ads", "HubSpot", "Email Marketing", "Conversion Optimization"], education: "BA Communications, York University", availability: "Immediately", remote: "Flexible" },

  // UX/UI Designers - Toronto
  { id: "c-ux-to-1", roleId: "ux-ui-designer-to", name: "Olivia Kim", avatar: "👩‍🎨", title: "Senior Product Designer", location: "Toronto, ON", experience: "8 years", salary: "CAD $140K - $170K", bio: "End-to-end product designer with a passion for inclusive design. Led design at multiple Canadian unicorns.", skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Accessibility"], education: "MDes, Emily Carr University", availability: "1 month", remote: "Remote" },
  { id: "c-ux-to-2", roleId: "ux-ui-designer-to", name: "David Okafor", avatar: "👨‍🎨", title: "UX Designer", location: "Toronto, ON", experience: "4 years", salary: "CAD $100K - $125K", bio: "User advocate combining research with beautiful interfaces. Specializes in financial product design.", skills: ["User Testing", "Figma", "Sketch", "Fintech UX", "Interaction Design"], education: "HBSc, University of Toronto", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-ux-to-3", roleId: "ux-ui-designer-to", name: "Maya Rodriguez", avatar: "👩‍🦱", title: "UI Designer", location: "Toronto, ON", experience: "2 years", salary: "CAD $80K - $100K", bio: "Visual designer with a keen eye for motion design. Creates delightful micro-interactions.", skills: ["Visual Design", "Illustration", "Motion Design", "Figma", "After Effects"], education: "BDes, Sheridan College", availability: "Immediately", remote: "Flexible" },

  // Content Strategists - Toronto
  { id: "c-cs-to-1", roleId: "content-strategist-to", name: "Rachel Wong", avatar: "👩‍✈️", title: "Head of Content", location: "Toronto, ON", experience: "9 years", salary: "CAD $125K - $155K", bio: "Built content teams at Canadian tech companies. Expert in multilingual content strategy.", skills: ["Content Strategy", "SEO", "Editorial Management", "Bilingual Content", "Content Operations"], education: "MA Journalism, Ryerson University", availability: "1 month", remote: "Remote" },
  { id: "c-cs-to-2", roleId: "content-strategist-to", name: "Nathan Lee", avatar: "👨‍🏫", title: "Content Strategist", location: "Toronto, ON", experience: "5 years", salary: "CAD $90K - $115K", bio: "Storyteller with data-driven approach. Specializes in fintech and healthcare content.", skills: ["Technical Writing", "Analytics", "WordPress", "Video Content", "Content Distribution"], education: "BA English, University of British Columbia", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-cs-to-3", roleId: "content-strategist-to", name: "Chloe Martin", avatar: "👩‍🎓", title: "Junior Content Strategist", location: "Toronto, ON", experience: "2 years", salary: "CAD $65K - $80K", bio: "Creative writer transitioning into strategy. Passionate about accessible communication.", skills: ["Copywriting", "Social Media", "Research", "Canva", "Newsletter Management"], education: "BA Communications, Carleton University", availability: "Immediately", remote: "Remote" },

  // Web Designers - Toronto
  { id: "c-wd-to-1", roleId: "web-designer-to", name: "Alex Morrison", avatar: "👨‍🎤", title: "Senior Web Designer", location: "Toronto, ON", experience: "7 years", salary: "CAD $105K - $130K", bio: "Webflow expert building stunning marketing sites for Canadian tech companies.", skills: ["Webflow", "Figma", "HTML/CSS", "Animation", "Responsive Design"], education: "BDes, George Brown College", availability: "2 weeks", remote: "Remote" },
  { id: "c-wd-to-2", roleId: "web-designer-to", name: "Jessica Park", avatar: "👩‍🎨", title: "Web Designer", location: "Toronto, ON", experience: "4 years", salary: "CAD $85K - $105K", bio: "Combines creativity with conversion optimization. Experienced with Canadian e-commerce brands.", skills: ["Shopify", "WordPress", "Adobe Suite", "UI Design", "A/B Testing"], education: "BDes, OCAD University", availability: "1 month", remote: "Hybrid" },
  { id: "c-wd-to-3", roleId: "web-designer-to", name: "Jordan Singh", avatar: "🧑‍🎨", title: "Junior Web Designer", location: "Toronto, ON", experience: "1 year", salary: "CAD $60K - $75K", bio: "Self-taught designer with strong Figma and Framer skills. Building portfolio with local startups.", skills: ["Figma", "Framer", "Tailwind CSS", "JavaScript Basics", "Brand Design"], education: "Self-taught / BrainStation", availability: "Immediately", remote: "Flexible" },

  // Copywriters - Toronto
  { id: "c-cw-to-1", roleId: "copywriter-to", name: "Lauren Bennett", avatar: "👩‍🦳", title: "Senior Copywriter", location: "Toronto, ON", experience: "8 years", salary: "CAD $95K - $120K", bio: "Award-winning copywriter with agency experience. Specializes in bilingual Canadian campaigns.", skills: ["Brand Copywriting", "Advertising", "Storytelling", "French/English", "Creative Concepts"], education: "BA Creative Writing, University of Victoria", availability: "1 month", remote: "Hybrid" },
  { id: "c-cw-to-2", roleId: "copywriter-to", name: "Daniel Cho", avatar: "👨‍🦲", title: "Conversion Copywriter", location: "Toronto, ON", experience: "4 years", salary: "CAD $85K - $105K", bio: "Direct response copywriter for Canadian SaaS. Focused on landing pages and email funnels.", skills: ["Landing Pages", "Email Sequences", "A/B Testing", "UX Writing", "Sales Pages"], education: "BCom, Queen's University", availability: "2 weeks", remote: "Remote" },
  { id: "c-cw-to-3", roleId: "copywriter-to", name: "Mia Taylor", avatar: "👩‍🎤", title: "Content Writer", location: "Toronto, ON", experience: "2 years", salary: "CAD $60K - $75K", bio: "Versatile writer comfortable with blogs, social, and long-form content for diverse Canadian audiences.", skills: ["Blog Writing", "Social Copy", "SEO Writing", "Research", "Editing"], education: "BA Journalism, Carleton University", availability: "Immediately", remote: "Remote" },

  // Executive Assistants - Toronto
  { id: "c-ea-to-1", roleId: "executive-assistant-to", name: "Victoria Chen", avatar: "👩‍💼", title: "Executive Business Partner", location: "Toronto, ON", experience: "11 years", salary: "CAD $105K - $135K", bio: "Supported C-suite at major Canadian banks and tech companies. Expert in complex stakeholder management.", skills: ["Calendar Management", "Travel Coordination", "Event Planning", "Confidentiality", "Project Management"], education: "BA Business, Western University", availability: "1 month", remote: "Hybrid" },
  { id: "c-ea-to-2", roleId: "executive-assistant-to", name: "Robert Kim", avatar: "👨‍💼", title: "Executive Assistant", location: "Toronto, ON", experience: "5 years", salary: "CAD $75K - $95K", bio: "Detail-oriented EA with experience in finance and legal sectors. Bilingual English/Korean.", skills: ["Microsoft Office", "Expense Management", "Meeting Coordination", "Document Preparation", "Multilingual"], education: "BA Business, Ryerson University", availability: "2 weeks", remote: "Onsite" },
  { id: "c-ea-to-3", roleId: "executive-assistant-to", name: "Ashley Nguyen", avatar: "👩‍🦰", title: "Administrative Assistant", location: "Toronto, ON", experience: "2 years", salary: "CAD $50K - $65K", bio: "Organized and proactive admin ready to grow. Tech-savvy with experience in startup environments.", skills: ["Google Workspace", "Scheduling", "Data Entry", "Customer Service", "Slack/Notion"], education: "BA Communications, York University", availability: "Immediately", remote: "Flexible" },

  // Data Analysts - Toronto
  { id: "c-da-to-1", roleId: "data-analyst-to", name: "Michael Zhang", avatar: "👨‍🔬", title: "Senior Data Analyst", location: "Toronto, ON", experience: "7 years", salary: "CAD $115K - $145K", bio: "Transform complex financial data into insights. Experience with Big Five banks and fintech.", skills: ["SQL", "Python", "Tableau", "Statistical Analysis", "Financial Modeling"], education: "MSc Statistics, University of Toronto", availability: "1 month", remote: "Remote" },
  { id: "c-da-to-2", roleId: "data-analyst-to", name: "Sarah Ahmed", avatar: "👩‍🔬", title: "Business Analyst", location: "Toronto, ON", experience: "4 years", salary: "CAD $90K - $110K", bio: "Bridge between business and data teams. Strong communication for executive presentations.", skills: ["Excel", "Power BI", "SQL", "Business Intelligence", "Reporting"], education: "BCom, Schulich School of Business", availability: "2 weeks", remote: "Hybrid" },
  { id: "c-da-to-3", roleId: "data-analyst-to", name: "Tyler Robinson", avatar: "🧑‍💻", title: "Junior Data Analyst", location: "Toronto, ON", experience: "1 year", salary: "CAD $65K - $80K", bio: "Recent graduate passionate about data storytelling. Strong foundation in Python and visualization.", skills: ["Python", "R", "Google Sheets", "Data Visualization", "Basic ML"], education: "BSc Data Science, McMaster University", availability: "Immediately", remote: "Remote" },

  // Customer Support - Toronto
  { id: "c-sup-to-1", roleId: "customer-support-to", name: "Amanda Lee", avatar: "👩‍🎧", title: "Customer Success Manager", location: "Toronto, ON", experience: "6 years", salary: "CAD $85K - $105K", bio: "Passionate about customer advocacy. Reduced churn by 35% at previous fintech company.", skills: ["Account Management", "Zendesk", "Salesforce", "Onboarding", "Bilingual"], education: "BA Psychology, McGill University", availability: "2 weeks", remote: "Remote" },
  { id: "c-sup-to-2", roleId: "customer-support-to", name: "Chris Patel", avatar: "👨‍🎧", title: "Technical Support Specialist", location: "Toronto, ON", experience: "4 years", salary: "CAD $65K - $80K", bio: "Tech-savvy support professional with SaaS experience. Great at explaining complex issues simply.", skills: ["Technical Troubleshooting", "Intercom", "Documentation", "API Support", "JIRA"], education: "Diploma, Seneca College", availability: "1 month", remote: "Hybrid" },
  { id: "c-sup-to-3", roleId: "customer-support-to", name: "Nicole Brown", avatar: "👩‍💻", title: "Support Representative", location: "Toronto, ON", experience: "1 year", salary: "CAD $45K - $55K", bio: "Friendly and patient support rep. Fluent in English and French for Canadian customer base.", skills: ["Live Chat", "Email Support", "CRM", "Problem Solving", "Bilingual"], education: "BA Communications, University of Ottawa", availability: "Immediately", remote: "Flexible" },
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
