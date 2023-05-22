import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function MemoriesRoutes(app: FastifyInstance) {
  // Verifica se o usuário está autenticado
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  // Route to get all memories
  app.get('/memories', async (request) => {
    await request.jwtVerify()
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt:
          memory.content.length > 115
            ? memory.content.substring(0, 115).concat('...')
            : memory.content,
        isPublic: memory.isPublic,
        createdAt: memory.createdAt,
      }
    })
  })

  // Route to get a single memory
  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    // Verifica se o usuário tem acesso a memória, se não tiver retorna 401
    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  // Route to create a new memory
  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })

    return memory
  })

  // Route to update a memory
  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string().url(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { id } = paramsSchema.parse(request.params)
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    // Verifica se o usuário é o dono a memória, se não for  retorna 401
    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },

      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  // Route to delete a memory
  app.delete('/memories/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
