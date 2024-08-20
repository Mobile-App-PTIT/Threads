import { Stack } from "expo-router";
import React from "react";

import '../../global.css';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="LoginScreen" />
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="RegisterScreen" />
    </Stack>
  );
}
