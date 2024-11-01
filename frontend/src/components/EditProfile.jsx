import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Image,
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import uri from '../../redux/uri';
import {loadUser} from '../../redux/actions/userAction';

const EditProfile = ({navigation}) => {
  const {user, token} = useSelector(state => state.user);
  const [avatar, setAvatar] = useState(user?.avatar?.url);
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    name: user?.name,
    subname: user?.subname,
    bio: user?.bio,
  });

  const handleSubmitHandler = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log(userData);
    try {
      const response = await axios.patch(
        `${uri}/user/${user._id}`,
        {
          name: userData.name,
          subname: userData.subname,
          bio: userData.bio,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );
      if (response.status === 200) {
        navigation.navigate('Profile');
      }
    } catch (error) {
      console.log(error);
    }

    // .then(res => {
    //   loadUser()(dispatch);
    // });
  };

  const ImageUpload = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
    }).then(image => {
      if (image) {
        // setImage('data:image/jpeg;base64,' + image.data);
        axios
          .put(
            `${uri}/update-avatar`,
            {
              avatar: 'data:image/jpeg;base64,' + image?.data,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          .then(res => {
            loadUser()(dispatch);
          });
      }
    });
  };

  return (
    <SafeAreaView className="bg-zinc-900">
      <View className="flex-row items-center justify-between p-5 bg-zinc-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign color="white" size={20} name="close" />
          </TouchableOpacity>
          <Text className="text-[20px] left-4 font-[600] text-white">
            Edit Profiles
          </Text>
        </View>
        <TouchableOpacity onPress={handleSubmitHandler}>
          <Text className="text-[18px] text-white">Done</Text>
        </TouchableOpacity>
      </View>
      <View className="flex justify-center items-center my-32">
        <Image
          source={require('../../assets/images/white.png')}
          style={{width: 100, height: 100}}
        />
      </View>
      <View className="h-full items-center">
        <View className="w-[90%] p-3 min-h-[200] h-max border rounded-[10px] border-gray-600 bg-zinc-800">
          <View className="flex-row">
            <View className="w-full flex-row justify-between items-center px-3">
              <View className="h-[90]">
                <Text className="text-[18px] font-[600] left-1 text-white">
                  Name
                </Text>
                <TextInput
                  value={userData.name}
                  onChangeText={e => setUserData({...userData, name: e})}
                  placeholder="Enter your name..."
                  placeholderTextColor={'white'}
                  className="text-[16px] text-white"
                />
              </View>
              <TouchableOpacity onPress={ImageUpload} className="bottom-3">
                <Image
                  source={
                    userData?.avatar
                      ? {uri: userData.avatar}
                      : require('../../assets/images/avatar.jpg')
                  }
                  style={{width: 50, height: 50}}
                  borderRadius={100}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="w-full border-t border-gray-600 pt-4 px-3">
            <Text className="text-[18px] font-[600] text-white left-1">
              Subname
            </Text>
            <TextInput
              value={userData?.subname}
              onChangeText={e => setUserData({...userData, subname: e})}
              placeholder="Enter your subname..."
              placeholderTextColor={'white'}
              className="text-[16px] mb-2 text-white"
            />
          </View>
          <View className="w-full border-t border-gray-600 pt-3 px-3 h-[100]">
            <Text className="text-[18px] font-[600] text-white left-1">
              Bio
            </Text>
            <TextInput
              value={userData?.bio}
              onChangeText={e => setUserData({...userData, bio: e})}
              placeholder="Enter your bio..."
              placeholderTextColor={'white'}
              className="text-[16px] text-white"
              multiline={true}
              numberOfLines={2}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;
