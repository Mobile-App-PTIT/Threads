import {
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {registerUser} from '../../redux/actions/userAction';

const RegisterScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const {error, isAuthenticated} = useSelector(state => state.user);

  useEffect(() => {
    if (error) {
      Alert.alert(error);
      console.log(error);
    }
    if (isAuthenticated) {
      Alert.alert('Account created successfully');
      navigation.navigate('Login');
    }
  }, [error, isAuthenticated]);

  const handleRegister = async () => {
    await registerUser(name, email, password)(dispatch);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{flex: 1}}
      >
        <ScrollView
          contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-[80px]">
            <Image
              className="w-[150px] h-[170px] object-contain"
              source={require('../../assets/images/threads-logo-black-01.png')}
            />
          </View>

          <View className="items-center justify-center">
            <Text className="font-bold mt-7 text-xl text-black">
              Register an Account
            </Text>
          </View>

          <View className="mt-10 gap-3">
            <View className="gap-8">
              <View className="flex-row items-center gap-2 border-[2px] border-black py-1 rounded-lg">
                <Ionicons
                  className="ml-2"
                  name="person"
                  size={24}
                  color="black"
                />
                <TextInput
                  className="w-[300px] h-[40px] text-black"
                  placeholder="Enter your name"
                  placeholderTextColor="black"
                  value={name}
                  onChangeText={e => setName(e)}
                />
              </View>

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
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            className="w-[200px] h-[60px] bg-black p-4 mt-[100px] mx-auto rounded-xl items-center justify-center"
          >
            <Text className="text-center text-white font-bold text-lg">
              Register
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-5"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-black text-center text-lg">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
