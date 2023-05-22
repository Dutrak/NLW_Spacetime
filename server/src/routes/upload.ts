// Objetivo: Arquivo de rotas para upload de arquivos
// Exemplo de uso: http://localhost:3000/upload

// Importação de dependências
import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { FastifyInstance } from 'fastify'
import { pipeline } from 'node:stream'
import { createWriteStream } from 'node:fs'
import { promisify } from 'node:util'

// Criação de uma função para utilizar o pipeline do Node.js com async/await
const pump = promisify(pipeline)

// Função para upload de arquivos no disco local (não recomendado para produção)
// Em produção, utilizar um serviço de armazenamento de arquivos como Amazon S3, Google Cloud Storage, Cloudfare R2 ou outros
export async function UploadRoutes(app: FastifyInstance) {
  // Rota para upload de arquivos com limite de 5MB
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fileSize: 5_242_880, // 5MB
      },
    })

    // Retorna erro 400 caso  não seja enviado nenhum arquivo
    if (!upload) {
      return reply.status(400).send()
    }

    // Regras de validação de arquivo
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isMimeTypeValid = mimeTypeRegex.test(upload.mimetype)

    // Retorna erro 400 caso o arquivo não seja uma imagem ou vídeo (seguindo o mimetype definido na regex acima)
    if (!isMimeTypeValid) {
      return reply.status(400).send()
    }

    // Gera um ID único para o arquivo (utilizando o RandomUUID) e concatena com a extensão do arquivo (retirada do extname do Node.js)
    const fileID = randomUUID()
    const extension = extname(upload.filename)
    const fileName = fileID.concat(extension)

    // Cria um stream de escrita para o arquivo utilizando o writeStream do Node.js
    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads/', fileName),
    )

    // Faz o upload do arquivo para o disco local utilizando o pipeline do Node.js
    await pump(upload.file, writeStream)

    // Gera a URL completa do arquivo e retorna para o usuário
    const fullURL = request.protocol.concat('://').concat(request.hostname)
    const fileURL = new URL(`/uploads/${fileName}`, fullURL).toString()
    return { fileURL }
  })
}
