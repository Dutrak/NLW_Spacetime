import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { MemoriesRoutes } from './routes/memories'
import { AuthRoutes } from './routes/auth'
import { UploadRoutes } from './routes/upload'
import { resolve } from 'node:path'

const app = fastify()

// Registro do plugin de upload de arquivos multipart
app.register(multipart)

// Registrar locais estáticos e de acesso público
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

// Register routes
app.register(UploadRoutes)
app.register(AuthRoutes)
app.register(MemoriesRoutes)

app.register(cors, {
  origin: true, // Permite que qualquer origem acesse a API, recomendado apenas para desenvolvimento, no caso de produção, é recomendado definir uma lista de origens permitidas
})

app.register(jwt, {
  secret: 'spacetime', // Chave secreta para assinar o token
})

// Start the server
app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => console.log('Server is running on http://localhost:3333'))
