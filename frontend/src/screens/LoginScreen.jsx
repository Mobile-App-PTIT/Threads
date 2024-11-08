import {
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Toast from 'react-native-toast-message';
import {loginUser} from '../../redux/actions/userAction';

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {error, isAuthenticated} = useSelector(state => state.user);

  const handleLogin = async () => {
    await loginUser(email, password)(dispatch);
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error,
      });
      dispatch({type: 'clearError'});
    }
    navigation.navigate('Home');
  };

  useEffect(() => {
    if (isAuthenticated) {
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });
    }
  }, [isAuthenticated]);

  return (
    <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
      <SafeAreaView className="flex-1 bg-white items-center">
        <View className="mt-[120px]">
          <Image
            className="w-[150px] h-[170px] object-contain"
            source={require('../../assets/images/threads-logo-black-01.png')}
          />
        </View>

        <View className="items-center justify-center">
          <Text className="font-bold mt-7 text-xl text-black">
            Login to your Account
          </Text>
        </View>
        <View className="mt-10 gap-3">
          <View className="gap-8">
            <View className="flex-row items-center gap-2 border-[2px] border-black py-1 rounded-lg">
              <MaterialIcons
                className="ml-2"
                name="email"
                size={24}
                color="black"
              />
              <TextInput
                className="w-[300px] h-[40px] text-black"
                placeholder="Enter your email"
                placeholderTextColor="black"
                keyboardType="email-address" // Đảm bảo sử dụng bàn phím email
                autoFocus={true}
                value={email}
                onChangeText={e => setEmail(e)}
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
                onChangeText={e => setPassword(e)}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-black">Keep me logged in</Text>
            <Text className="text-blue-500">Forgot Password</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          className="w-[200px] h-[60px] bg-black p-4 mt-[120px] mx-auto rounded-xl items-center justify-center">
          <Text className="text-center text-white font-bold text-lg">
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-5"
          onPress={() => navigation.navigate('Register')}>
          <Text className="text-black text-center text-lg">
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
