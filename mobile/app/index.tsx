import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'

import Logo from '../src/assets/nlw-spacetime-logo.svg'
import { api } from '../src/lib/api'

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint:
    'https://github.com/settings/connections/applications/d49543075aafbb011c66',
}

export default function App() {
  const router = useRouter()

  const [, response, signInWithGithub] = useAuthRequest(
    {
      clientId: 'd49543075aafbb011c66',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        scheme: 'nlwspacetime.app',
      }),
    },
    discovery,
  )

  // Função que lida com o código de autorização
  async function handleGithubOauthCode(code: string) {
    const response = await api.post('/register', {
      code,
    })
    const { token } = response.data

    await SecureStore.setItemAsync('token', token)
    router.push('/memories')
  }

  // Obtem o codigo de autorização
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params

      handleGithubOauthCode(code)
    }
  }, [response])

  // Renderiza o app
  return (
    <View className="relative flex-1 items-center px-16 py-10">
      {/* Logo e texto */}

      <View className="flex-1 justify-center items-center gap-6">
        <Logo />
        <View className="space-y-2">
          <Text className="text-center font-title text-3xl leading-light text-gray-50">
            Sua cápsula do tempo
          </Text>
          <Text className="text-center font-body text-lg leading-relaxed text-gray-100">
            Colecione momentos marcantes da sua jornada e compartilhe (se
            quiser) com o mundo!
          </Text>
        </View>

        {/* Botao de login */}

        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-full bg-green-500 px-5 py-3"
          onPress={() => signInWithGithub()}
        >
          <Text className="font-alt text-lg uppercase text-black">
            COMECE A UTILIZAR
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rodapé */}

      <Text className="text-center font-body text-lg leading-relaxed text-gray-200">
        Feito com 💜 no NLW da Rocketseat
      </Text>
    </View>
  )
}
