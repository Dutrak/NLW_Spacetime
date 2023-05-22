import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function AuthRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    // validação do codigo de autorização gerado pelo github
    const bodySchema = z.object({
      code: z.string(),
    })

    // Acessando o código de autorização
    const { code } = bodySchema.parse(request.body)

    // requisição do token de acesso a partir do código de autorização
    const acessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )

    // geração do token de acesso e busca dos dados do usuário
    const { access_token } = acessTokenResponse.data
    const UserResponse = await axios.get('https://api.github.com/user', {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    })

    // validação dos dados do usuário
    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    // criação do objeto de dados do usuário
    const userInfo = userSchema.parse(UserResponse.data)

    // busca do usuário no banco de dados
    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })

    // criação do usuário no banco de dados caso não exista
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    // geração do token de acesso JWT (JSON Web Token)
    // Obs: O Token JWT é público, então não deve ser utilizado para armazenar dados sensíveis
    const token = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '30 days',
      },
    )

    // retorno dos dados do usuário
    return {
      token,
    }
  })
}
