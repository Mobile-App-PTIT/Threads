import {
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from 'react-native';
import {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { loginUser } from '../../redux/actions/userAction';

const LoginScreen = ({navigation}) => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {error, isAuthenticated} = useSelector(state => state.user);

    const handleLogin = async () => {
        console.log(email, password)
        await loginUser(email, password)(dispatch)
    }

    useEffect(() => {
      if (error) {
        Alert.alert(error)
      }
      if (isAuthenticated) {
        navigation.navigate('Home2')
        Alert.alert('Login successful')
      }
    }, [])

  return (
    <SafeAreaView className="flex-1 bg-white items-center">
      <View className="mt-[120px]">
        <Image
          className="w-[150px] h-[170px] object-contain"
          source={require("../../assets/images/threads-logo-black-01.png")}
        />
      </View>

      <KeyboardAvoidingView>
        <View className="items-center justify-center">
          <Text className="font-bold mt-7 text-xl text-black">
            Login to your Account
          </Text>
        </View>
        <View className="mt-10 gap-3">
          <View className="gap-8">
            <View className="flex-row items-center gap-2 border-[2px] border-black py-1 rounded-lg">
              <MaterialIcons
                className=" ml-2"
                name="email"
                size={24}
                color="black"
              />
              <TextInput
                className="w-[300px] h-[40px] text-black"
                placeholder="Enter your email"
                placeholderTextColor="black"
                value={email}
                onChangeText={(e) => {
                  setEmail(e);
                }}
              />
            </View>
            <View className="flex-row items-center gap-2 border-[2px] border-black py-1 rounded-lg">
              <AntDesign
                className="ml-2"
                name="lock1"
                size={24}
                color="black"
              />
              <TextInput
                className="w-[300px] h-[40px] text-black"
                placeholder="Enter your password"
                placeholderTextColor="black"
                secureTextEntry={true}
                value={password}
                onChangeText={(e) => {
                  setPassword(e);
                }}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-black">Keep me logged in</Text>
            <Text className="text-blue-500">Forgot Password</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogin} className="w-[200px] h-[60px] bg-black p-4 mt-[120px] mx-auto rounded-xl items-center justify-center">
          <Text className="text-center text-white font-bold text-lg">
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-5" onPress={() => navigation.navigate("Register")}>
          <Text className="text-black text-center text-lg">
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

};

export default LoginScreen;
