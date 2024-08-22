import React, { useState } from "react";
import {
  Text,
  SafeAreaView,
  Image,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = () => {
    console.log(email, password, name);
  };

  const handleLoginScreen = () => {
    router.push("/(login)");
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
            Register to your Account
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
            <View className="flex-row items-center gap-2 border-[1px] border-white py-1 rounded-lg">
              <Ionicons className='ml-2' name="person" size={24} color="white" />
              <TextInput
                className="w-[300px] h-[40px] text-white"
                placeholder="Enter your name"
                placeholderTextColor="white"
                value={name}
                onChangeText={(e) => {
                  setName(e);
                }}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          className="w-[200px] h-[60px] bg-white p-4 mt-[120px] mx-auto rounded-xl items-center justify-center"
        >
          <Text className="text-center text-black font-bold text-lg">
            Register
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-5" onPress={handleLoginScreen}>
          <Text className="text-white text-center text-lg">
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
