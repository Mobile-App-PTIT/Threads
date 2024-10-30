import { SafeAreaView, ScrollView, View, TouchableOpacity, Image } from "react-native"
import Ionicons from 'react-native-vector-icons/Ionicons'



const ChatScreen = ({ navigation }) => {
    return (
        <SafeAreaView className="flex-1 bg-zinc-900">
            <ScrollView>
                {/* Header */}
                <View className='flex-row justify-between px-4 pt-4 border-1 border-b-white'>
                    <View className='flex-row items-center'>
                        <TouchableOpacity onPress={() => navigation.goBack()} className='mx-[12px]'>
                            <Ionicons name='arrow-back' size={24} color='white' />
                        </TouchableOpacity>
                        <View>
                        <View className="h-3 w-3 rounded-full bg-green-500 absolute top-9 right-0 z-50 border border-white"></View>
                            <Image source={require('../../assets/avatar/user2.jpeg')} className="h-14 w-14 rounded-full"/>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ChatScreen