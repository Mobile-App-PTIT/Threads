import React from 'react'
import { Text, ScrollView, SafeAreaView, View } from 'react-native'
import { useSelector } from 'react-redux'

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Feather from 'react-native-vector-icons/Feather'
const userData = {
  name: 'John Doe',
  email: ''
}

const ProfileScreen = () => {
  const { user } = useSelector(state => state.user)
  return (
    <ScrollView showsVerticalScrollIndicator={false} className='bg-gray-900'>
      <SafeAreaView className='w-full bg-gray-900'>
        <View className='flex-row justify-between'>
          <View>
            <SimpleLineIcons name='globe' size={25} color='white' />
          </View>
          <View className='flex-row gap-3'>
            <AntDesign name='instagram' size={30} color='white' />
            <Feather name='menu' size={30} color='white' /> 
          </View>
        </View>
        <Text className='text-white'>{userData.name}</Text>
      </SafeAreaView>
    </ScrollView>
  )
}

export default ProfileScreen