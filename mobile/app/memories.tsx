import { View, TouchableOpacity, ScrollView, Image, Text } from 'react-native'
import Logo from '../src/assets/nlw-spacetime-logo.svg'
import { Link, useRouter } from 'expo-router'
import Icon from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import { api } from '../src/lib/api'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'

dayjs.locale(ptBr)

interface Memory {
  coverUrl: string
  id: string
  excerpt: string
  createdAt: string
}

export default function Memories() {
  const { bottom, top } = useSafeAreaInsets()
  const router = useRouter()

  const [memories, setMemories] = useState<Memory[]>([])

  async function SignOut() {
    await SecureStore.deleteItemAsync('token')

    router.push('/')
  }

  async function LoadMemory() {
    const token = await SecureStore.getItemAsync('token')

    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setMemories(response.data)
  }

  useEffect(() => {
    LoadMemory()
  })

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="flex-row items-center justify-between mt-6">
        <Logo />
        <View className="flex-row gap-2">
          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            onPress={SignOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-6 space-y-10">
        {memories.map((Memory) => {
          return (
            <View key={Memory.id} className="space-y-4">
              <View className="flex-row items-center gap-2">
                <View className="h-px w-5 bg-gray-50" />
                <Text className="font-body text-sm text-gray-100">
                  {dayjs(Memory.createdAt).format('D[ de ]MMMM[,] YYYY')}
                </Text>
              </View>
              <Image
                source={{ uri: Memory.coverUrl }}
                className="aspect-video w-full rounded-lg"
                alt=""
              />
              <Text className="font-body text-gray-100 text-base leading-relaxed">
                {Memory.excerpt}
              </Text>
              <Link href="/memories/id" asChild>
                <TouchableOpacity className="flex-row items-center gap-2">
                  {Memory.excerpt.length > 115 ? (
                    <>
                      <Text className="font-body text-gray-200 text-sm">
                        Ler mais
                      </Text>
                      <Icon name="arrow-right" size={16} color="#9e9ea0" />
                    </>
                  ) : null}
                </TouchableOpacity>
              </Link>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
