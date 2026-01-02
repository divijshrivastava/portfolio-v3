import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Clearing existing data...')
    await prisma.blog.deleteMany({})
    await prisma.project.deleteMany({})

    const projects = [
        {
            title: "Decision Workflow Management System",
            description: "Real-time trading platform managing equity and fixed income decision lifecycles. Replaced costly FactSet RMS (thousands USD per user license) with scalable in-house solution.",
            type: "professional",
            imageUrl: "/images/projects/dwms.jpg",
            techStack: JSON.stringify(["Java", "Spring Boot", "Angular", "Elasticsearch", "DB2"]),
            links: JSON.stringify({ website: "https://divij.tech/project/dwms" }), // Placeholder link
            status: "published",
            isFeatured: true
        },
        {
            title: "Custom Portfolio - ESG Analytics",
            description: "ESG portfolio management platform enabling portfolio managers to create customized portfolios with sustainability projections. Led team of 5 engineers from concept to production.",
            type: "professional",
            imageUrl: "/images/projects/esg.jpg",
            techStack: JSON.stringify(["Angular", "Spring Boot", "Java", "Python", "DB2", "PowerBI", "Autosys"]),
            links: JSON.stringify({}),
            status: "published",
            isFeatured: true
        },
        {
            title: "Insurance Product Lifecycle Platform",
            description: "E-commerce-style insurance platform with cart management and checkout flow. Migrated millions of XML records from relational database to MongoDB.",
            type: "professional",
            imageUrl: "/images/projects/insurance.jpg",
            techStack: JSON.stringify(["Spring Boot", "Angular", "Kafka", "MongoDB", "Jenkins", "ElectricFlow", "OpenShift"]),
            links: JSON.stringify({}),
            status: "published",
            isFeatured: true
        },
        {
            title: "Habit Tracker",
            description: "A full-stack habit tracking web application with a mobile-first design. Features include calendar-based habit visualization, streak tracking, and OAuth authentication.",
            type: "coding",
            imageUrl: "/images/projects/habit.jpg",
            techStack: JSON.stringify(["React", "Node.js", "Express", "MongoDB Atlas", "Vercel", "Fly.io"]),
            links: JSON.stringify({ github: "https://github.com/divij/habit-tracker" }),
            status: "published",
            isFeatured: false
        },
        {
            title: "Monkey Chat",
            description: "A real-time messaging application built with React and Node.js/Express. Supports one-on-one and group conversations, image sharing, and online presence using Socket.io.",
            type: "coding",
            imageUrl: "/images/projects/chat.jpg",
            techStack: JSON.stringify(["React", "Node.js", "Express", "Socket.io", "PostgreSQL", "Redis", "Render"]),
            links: JSON.stringify({ github: "https://github.com/divij/monkey-chat" }),
            status: "published",
            isFeatured: false
        }
    ]

    const blogs = [
        {
            title: "What the F is an MCP Server!",
            slug: "what-the-f-is-an-mcp-server",
            summary: "You have to be living under a rock if your life hasn't been touched by AI. But for the AI to interact with you, it needs to talk to the 'systems'. This is where MCP comes in.",
            content: `# What the F is an MCP Server!

You have to be living under a rock if your life hasn't been touched by AI. But for the AI to interact with you, it needs to talk to the 'systems'. This is where MCP comes in.

[Content placeholder for full article...]`,
            readTime: 5,
            status: "published",
            createdAt: new Date("2025-12-26")
        },
        {
            title: "Understanding Notifications through Publisher-Subscriber design pattern and Java",
            slug: "understanding-notifications-pub-sub-java",
            summary: "Notification is a very common word nowadays. But do you know the principle behind this model? This post explores the Pub-Sub pattern using Java.",
            content: `# Understanding Notifications

Notification is a very common word nowadays directly linked with our mobile phones. But do you know the principle behind this model?

[Content placeholder for full article...]`,
            readTime: 8,
            status: "published",
            createdAt: new Date("2023-03-07")
        },
        {
            title: "Diving into HashMap!",
            slug: "diving-into-hashmap",
            summary: "HashMap is probably one of the most important collections in Java ecosystem. This post dives deep into how it works internally.",
            content: `# Diving into HashMap

HashMap is probably one of the most important collections in Java ecosystem. Let's see how it works internally.

[Content placeholder...]`,
            readTime: 10,
            status: "published",
            createdAt: new Date("2022-12-18")
        },
        {
            title: "CSS Notes You Should Keep Handy : Part 1",
            slug: "css-notes-part-1",
            summary: "Cascading Style Sheets or CSS in short was initially introduced to make websites lively. Here are some notes to keep handy.",
            content: `# CSS Notes

Cascading Style Sheets or CSS in short was initially introduced to make websites lively.

[Content placeholder...]`,
            readTime: 4,
            status: "published",
            createdAt: new Date("2022-11-30")
        },
        {
            title: "Git for beginners!",
            slug: "git-for-beginners",
            summary: "Git is one of the most useful tools in Software Development. Here's a guide for beginners.",
            content: `# Git for beginners

Git is one of the most useful tools in Software Development that has helped thousands of developers collaborate.

[Content placeholder...]`,
            readTime: 6,
            status: "published",
            createdAt: new Date("2022-11-29")
        }
    ]

    console.log('Seeding projects...')
    for (const project of projects) {
        await prisma.project.create({ data: project })
    }

    console.log('Seeding blogs...')
    for (const blog of blogs) {
        await prisma.blog.create({ data: blog })
    }

    console.log('Data seeded successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
