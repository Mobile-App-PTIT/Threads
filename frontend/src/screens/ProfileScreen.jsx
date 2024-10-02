import React from 'react';
import {
  Text,
  ScrollView,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {logoutUser} from '../../redux/actions/userAction';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';

const userData = {
  name: 'Bui Nguyen Tung Lam',
  email: '',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel libero nec libero tincidunt luctus.',
  avatar: '',
  subname: 'Software Engineer',
  followers: 100,
};

const ProfileScreen = ({navigation}) => {
  const {user} = useSelector(state => state.user);
  const dispatch = useDispatch();

  const logoutHandler = () => {
    logoutUser()(dispatch);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="bg-zinc-900">
      <SafeAreaView className="w-full bg-zinc-900">
        <View className="flex-row justify-between m-5">
          <View>
            <SimpleLineIcons name="globe" size={27} color="white" />
          </View>
          <View className="flex-row gap-5">
            <AntDesign name="instagram" size={32} color="white" />
            <Feather name="menu" size={32} color="white" />
          </View>
        </View>
        <View className="flex-row justify-between m-5 items-center">
          <View className="gap-1">
            <Text className="text-white font-bold text-3xl">
              {userData.name}
            </Text>
            <Text className="text-white text-lg">{userData.subname}</Text>
          </View>
          <Image
            source={
              userData?.avatar
                ? {uri: userData.avatar}
                : require('../../assets/images/avatar.jpg')
            }
            style={{width: 70, height: 70, borderRadius: 100}}
          />
        </View>
        <View className="mx-5 mt-3">
          <Text className="text-white">{userData.bio}</Text>
        </View>

        <View className="mx-5 mt-5">
          <Text className="text-white">{userData.followers} Followers</Text>
        </View>
        {/* Render first 3 followers avatar */}

        <View className="flex-row items-center justify-between m-5 mt-7">
          <TouchableOpacity className="w-[45%] border border-gray-500 h-[40] rounded-xl" onPress={() => navigation.navigate('EditProfile')}>
            <Text className="text-white text-center pt-2">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[45%] border border-gray-500 h-[40] rounded-xl"
            onPress={logoutHandler}>
            <Text className="text-white text-center pt-2">Log out</Text>
          </TouchableOpacity>
        </View>

        <View className="border-b border-gray-500" style={{ paddingBottom: 10, paddingTop: 5 }}>
          <View className="flex-row justify-between items-center mx-4">
            <TouchableOpacity style={{flex: 1, alignItems: 'center'}}>
              <Text className="text-white text-[16px]">Threads</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, alignItems: 'center'}}>
              <Text className="text-white text-[16px]">Replies</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, alignItems: 'center'}}>
              <Text className="text-white text-[16px]">Reposts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default ProfileScreen;
