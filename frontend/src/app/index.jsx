import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen";

export default function Index() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <NavigationContainer independent={true}>
      {isLogin ? <HomeScreen /> : <LoginScreen />}
    </NavigationContainer>
  );
}
