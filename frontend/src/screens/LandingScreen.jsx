import { View, Text, Image, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const LandingScreen = ({navigation}) => {
  return (
    <View className="flex-1 bg-slate-300">
      <Image
        className="w-full"
        source={require('../../assets/images/Pattern.png')}
      />

      <TouchableOpacity onPress={() => {navigation.navigate('Login')}} className="flex-[0.5] bg-white m-12 rounded-2xl justify-between items-center flex-row px-6 border-2 border-gray-200">
        <View className="flex-row justify-center items-center gap-3">
          <Image
            className="w-[70px] h-[70px]"
            source={require('../../assets/images/thread-color.png')}
          />
          <View>
            <Text className="text-black font-bold text-lg">
              Welcome to Threads
            </Text>
            <Text className="text-gray-400 text-sm font-semibold">Login to your Account</Text>
          </View>
        </View>
        <AntDesign name="right" color={'black'} size={24} />
      </TouchableOpacity>
    </View>
  );
};

export default LandingScreen;
