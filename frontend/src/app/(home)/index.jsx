import React from "react";

import { View, Image, Text, Pressable, TouchableOpacity} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter(); 
  const handleLoginScreen = () => {
    router.push("/(login)");
  }

  return (
    <View className="flex-1 bg-black">
      <Image
        className="w-full"
        source={require("@/src/assets/images/Pattern.png")}
      />
      <TouchableOpacity onPress={handleLoginScreen} className="flex-[0.5] bg-black mt-10 mx-12 rounded-[20px] items-center flex-row px-7 justify-between border-2 border-gray-600">
          <View className="flex-row items-center gap-4">
            <Image
              className="w-[60px] h-[60px]"
              source={require("@/src/assets/images/Threads-Logo-PNG.png")}
           />
            <View>
              <Text className="font-semibold text-lg text-white">
                Welcome to Threads
              </Text>
              <Text className='font-medium text-lg text-gray-500'>Login to your Account</Text>
            </View>
          </View>
          <AntDesign name="right" size={24} color="gray" />
        </TouchableOpacity>
    </View>
  );
}
