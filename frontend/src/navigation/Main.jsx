import HomeScreen from "../screens/HomeScreen";
import PostDetailScreen from "../screens/PostDetailScreen";
import EditProfile from "../components/EditProfile"
import ListMessageScreen from "../screens/ListMessageScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";

const Main = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={Tabs}/>
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
            <Stack.Screen name="ListMessageScreen" component={ListMessageScreen} />
        </Stack.Navigator>
    )
}

export default Main;