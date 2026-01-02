import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating blogs with cover images...')

    // Update "What the F is an MCP Server!"
    await prisma.blog.update({
        where: { slug: 'what-the-f-is-an-mcp-server' },
        data: { coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000' } // Generic AI/Tech image
    })

    // Update "HashMap" post
    await prisma.blog.update({
        where: { slug: 'diving-into-hashmap' },
        data: { coverImage: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1000' } // Code image
    })

    console.log('Blogs updated!')
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
