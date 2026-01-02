import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Clear existing projects to avoid duplicates during dev
    await prisma.project.deleteMany({})

    const projects = [
        {
            title: 'DWMS Platform',
            description: 'Decision Workflow Management System automating pre-trade workflows for ESG funds. Built with Java Spring Boot and Angular, utilizing ElasticSearch for high-performance searching. Replaced vendor products to save costs and improve integration.',
            type: 'professional',
            imageUrl: '/images/projects/dwms.jpg', // Placeholder
            techStack: JSON.stringify(['Java', 'Spring Boot', 'Angular', 'ElasticSearch', 'PowerBI']),
            links: JSON.stringify({}),
            startDate: new Date('2021-08-01'),
            status: 'published',
            isFeatured: true
        },
        {
            title: 'Verity RMS Engagement Platform',
            description: 'ESG engagement platform collecting data from various sources using Python rules and reporting via PowerBI. Streamlined the decision research cycle.',
            type: 'professional',
            imageUrl: '/images/projects/verity.jpg', // Placeholder
            techStack: JSON.stringify(['Python', 'Data Processing', 'PowerBI']),
            links: JSON.stringify({}),
            startDate: new Date('2021-08-01'),
            status: 'published',
            isFeatured: true
        },
        {
            title: 'UD Prime',
            description: 'E-commerce style insurance application. Designed using microservices architecture on OpenShift with Kafka for lifecycle management. Handled high-scale product adding and checkout workflows.',
            type: 'professional',
            imageUrl: '/images/projects/udprime.jpg',
            techStack: JSON.stringify(['Java', 'Angular', 'Kafka', 'OpenShift', 'Microservices']),
            links: JSON.stringify({}),
            startDate: new Date('2019-06-01'),
            endDate: new Date('2021-08-01'),
            status: 'published',
            isFeatured: false
        },
        {
            title: 'DG Drive',
            description: 'Storage drive application allowing massive document/receipt uploads and retrieval via generated IDs. Built with RESTful web services and OpenAPI specs for easy client integration.',
            type: 'professional',
            imageUrl: '/images/projects/dgdrive.jpg',
            techStack: JSON.stringify(['Java', 'Angular', 'MySQL', 'REST API']),
            links: JSON.stringify({}),
            startDate: new Date('2017-03-01'),
            endDate: new Date('2019-06-01'),
            status: 'published',
            isFeatured: false
        }
    ]

    for (const project of projects) {
        await prisma.project.create({
            data: project
        })
    }

    console.log('Resume projects seeded!')
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
