import { Startup, User } from "@/types";

export const SAMPLE_USERS: User[] = [
  {
    id: "user_nathan_smith",
    name: "Nathan Smith",
    username: "nathansmith",
    email: "nathan@example.com",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    bio: "Next.js Enthusiast & Educator. Building products for the modern web.",
    createdAt: "2023-01-15T08:00:00.000Z",
  },
  {
    id: "user_suyash_sharma",
    name: "Suyash Sharma",
    username: "yashbhardwaj56",
    email: "suyash@example.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    bio: "Full Stack Engineer & Startup Founder. Passionate about empowering the next generation of builders.",
    createdAt: "2023-02-10T10:00:00.000Z",
  },
  {
    id: "user_steven_smith",
    name: "Steven Smith",
    username: "stevensmith",
    email: "steven@example.com",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    bio: "Product Designer & Climate Tech Advocate. Making sustainability accessible.",
    createdAt: "2023-03-01T12:00:00.000Z",
  },
  {
    id: "user_elena_rostova",
    name: "Elena Rostova",
    username: "elenarostova",
    email: "elena@example.com",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    bio: "AI Researcher & Founder of Osmo AI. Helping remote teams communicate asynchronously.",
    createdAt: "2023-04-12T09:30:00.000Z",
  },
];

export const SAMPLE_STARTUPS: Startup[] = [
  {
    id: "startup-1",
    title: "YC Academy",
    slug: "yc-academy",
    description:
      "An online platform offering project-based learning for web developers, aimed at leveling up junior to mid-level developers by focusing on real-world applications.",
    category: "Education",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
    views: 894,
    authorId: "user_suyash_sharma",
    createdAt: "2024-10-05T14:20:00.000Z",
    pitch: `### Pitch details

**EcoCart / YC Academy** is an innovative project-based learning and developer empowerment platform designed for creators, learners, and builders looking to make a **positive industry impact**.

We connect modern web developers with real-world, enterprise-grade application architectures rather than toy tutorials.

By partnering with top software architects and engineering leads, we aim to eliminate tutorial hell and **promote practical engineering excellence**.

Our platform not only helps developers learn modern stacks like **Next.js 15, Neon Serverless PostgreSQL, and TypeScript**, but also offers features like:
- 🚀 **Interactive Code Sandboxes & Edge Playgrounds**
- 📊 **Real-time Performance Benchmarks & Linter Feedback**
- 🤝 **Peer Code Reviews and Mentorship Matching**
- 🏆 **Virtual Hackathons with Industry Sponsors**

YC Academy is built to **accelerate developer career trajectories**, making it faster for ambitious engineers to build production-ready applications.

Our mission is simple: **Learn by building, master by shipping, and shape the future of software engineering.**`,
  },
  {
    id: "startup-2",
    title: "EcoTrack",
    slug: "ecotrack",
    description:
      "A mobile app that helps users track and reduce their carbon footprint through mindful shopping and green delivery choices.",
    category: "Senior level",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80",
    views: 232,
    authorId: "user_steven_smith",
    createdAt: "2023-05-20T10:00:00.000Z",
    pitch: `### Pitch details

**EcoTrack** is a climate intelligence mobile application that analyzes digital purchases and daily commute habits to calculate precise carbon offsets.

#### The Problem
Millions of consumers want to reduce their environmental impact, but calculating emission footprints across disparate shopping apps is tedious and opaque.

#### The Solution
- **Automated Receipt Scanning**: Instant calculation of consumer product emissions.
- **Smart Recommendations**: Suggests local, eco-certified alternatives.
- **Gamified Milestones**: Rewards trees planted and local community cleanup participation.

We are currently raising our seed round to expand enterprise B2B corporate sustainability challenges.`,
  },
  {
    id: "startup-3",
    title: "LeadRocket",
    slug: "leadrocket",
    description:
      "Never miss a lead with instant Slack notifications and AI-powered lead scoring right as visitors land on your website.",
    category: "Education",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    views: 232,
    authorId: "user_steven_smith",
    createdAt: "2023-05-20T11:15:00.000Z",
    pitch: `### Pitch details

**LeadRocket** provides sales and growth teams with real-time Slack and Discord alerts whenever a high-intent enterprise prospect engages with pricing or documentation pages.

- Instant IP reverse lookup for Fortune 500 visitors
- Automated enrichment with LinkedIn and Apollo data
- One-click Slack response bot for AE assignment`,
  },
  {
    id: "startup-4",
    title: "Osmo AI",
    slug: "osmo-ai",
    description:
      "Have real 1:1 conversations that bring support, insights, and new opportunities through voice-native asynchronous AI avatars.",
    category: "EdTech",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    views: 232,
    authorId: "user_elena_rostova",
    createdAt: "2023-05-20T13:40:00.000Z",
    pitch: `### Pitch details

**Osmo AI** creates hyper-realistic, low-latency conversational AI agents for founders, educators, and mentors.

Instead of scheduling calendar links for introductory chats, users can converse with your AI twin 24/7 with zero lag and perfect context retention.`,
  },
  {
    id: "startup-5",
    title: "Geovaine",
    slug: "geovaine",
    description:
      "A mobile app that helps users track, manage, and coordinate team operations with real-time spatial telemetry.",
    category: "Management",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop&q=80",
    views: 232,
    authorId: "user_nathan_smith",
    createdAt: "2023-05-20T15:20:00.000Z",
    pitch: `### Pitch details

**Geovaine** delivers field operational intelligence for logistics and distributed maintenance teams.`,
  },
  {
    id: "startup-6",
    title: "DevFlow Studio",
    slug: "devflow-studio",
    description:
      "Collaborative cloud IDE with instant edge preview deployments, paired AI code review, and automated test generators.",
    category: "Tech",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    views: 419,
    authorId: "user_nathan_smith",
    createdAt: "2024-01-18T09:00:00.000Z",
    pitch: `### Pitch details

**DevFlow Studio** reimagines team software development in the browser with sub-second environment spinups.`,
  },
];
