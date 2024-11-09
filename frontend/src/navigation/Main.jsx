import PostDetailScreen from '../screens/PostDetailScreen';
import EditProfile from '../components/EditProfile';
import ListMessageScreen from '../screens/ListMessageScreen';
import ReplyDetailsScreen from '../screens/ReplyDetailsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../screens/ChatScreen';
import Tabs from './Tabs';

const Main = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Tabs} />
      {/* <Stack.Screen name="HomeScreen" component={HomeScreen} /> */}
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
      <Stack.Screen name="ReplyDetailsScreen" component={ReplyDetailsScreen} />
      <Stack.Screen name="ListMessageScreen" component={ListMessageScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />

    </Stack.Navigator>
  );
};

export default Main;