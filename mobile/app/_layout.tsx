// Importa as fontes
import { BaiJamjuree_400Regular } from '@expo-google-fonts/bai-jamjuree'
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'

// Importa os componentes
import React, { useEffect, useState } from 'react'
import blurpng from '../src/assets/bg-blur.png'
import Stripes from '../src/assets/stripes.svg'
import { styled } from 'nativewind'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ImageBackground } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// Declara o Stripe Lateral
const StyledStripes = styled(Stripes)

export default function Layout() {
  const [isUserAuthenticated, SetUserAuthenticated] = useState<null | boolean>(
    null,
  )

  useEffect(() => {
    SecureStore.getItemAsync('token').then((token) => {
      SetUserAuthenticated(!!token)
    })
  }, [])

  // Carrega as fontes
  const [hasLoadedFonts] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    BaiJamjuree_400Regular,
  })

  // retorna null enquanto as fontes não carregam
  if (!hasLoadedFonts) {
    return <SplashScreen />
  }

  return (
    <ImageBackground
      source={blurpng}
      className="relative flex-1 bg-gray-900"
      imageStyle={{ position: 'absolute', left: '-100%' }}
    >
      <StyledStripes className="absolute left-2 top-11" />
      <StatusBar style="light" translucent />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" redirect={isUserAuthenticated} />
        <Stack.Screen name="memories" />
        <Stack.Screen name="new" />
      </Stack>
    </ImageBackground>
  )
}
