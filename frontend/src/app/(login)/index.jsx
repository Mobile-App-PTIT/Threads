import React from "react";
import {
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  TouchableOpacity,
  ToastAndroid
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

import { useRouter } from "expo-router";
import { useState } from "react";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log(email, password);
    ToastAndroid.show("Login Successful", ToastAndroid.LONG, ToastAndroid.BOTTOM);
  };

  const handleRegisterScreen = () => {
    router.push("/(register)");
  };

  return (
    <SafeAreaView className="flex-1 bg-black items-center">
      <View className="mt-[120px]">
        <Image
          className="w-[120px] h-[120px] object-contain"
          source={require("@/src/assets/images/Threads-app-logo-white-png-transparent.png")}
        />
      </View>

      <KeyboardAvoidingView>
        <View className="items-center justify-center">
          <Text className="font-bold mt-7 text-xl text-white">
            Login to your Account
          </Text>
        </View>
        <View className="mt-10 gap-3">
          <View className="gap-8">
            <View className="flex-row items-center gap-2 border-[1px] border-white py-1 rounded-lg">
              <MaterialIcons
                className=" ml-2"
                name="email"
                size={24}
                color="white"
              />
              <TextInput
                className="w-[300px] h-[40px] text-white"
                placeholder="Enter your email"
                placeholderTextColor="white"
                value={email}
                onChangeText={(e) => {
                  setEmail(e);
                }}
              />
            </View>
            <View className="flex-row items-center gap-2 border-[1px] border-white py-1 rounded-lg">
              <AntDesign
                className="ml-2"
                name="lock1"
                size={24}
                color="white"
              />
              <TextInput
                className="w-[300px] h-[40px] text-white"
                placeholder="Enter your password"
                placeholderTextColor="white"
                secureTextEntry={true}
                value={password}
                onChangeText={(e) => {
                  setPassword(e);
                }}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white">Keep me logged in</Text>
            <Text className="text-blue-400">Forgot Password</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogin} className="w-[200px] h-[60px] bg-white p-4 mt-[120px] mx-auto rounded-xl items-center justify-center">
          <Text className="text-center text-black font-bold text-lg">
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-5" onPress={handleRegisterScreen}>
          <Text className="text-white text-center text-lg">
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
