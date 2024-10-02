import HomeScreen from "../screens/HomeScreen";
import EditProfile from "../components/EditProfile"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";

const Main = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={Tabs}/>
            <Stack.Screen name="EditProfile" component={EditProfile} />
        </Stack.Navigator>
    )
}

export default Main;