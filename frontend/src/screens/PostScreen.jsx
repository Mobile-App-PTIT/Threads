import axios from 'axios';
import uri from '../../redux/uri';
import React, {useEffect, useState} from 'react';
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createPostAction} from '../../redux/actions/postAction';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.user);
  const {isSuccess, isLoading} = useSelector(state => state.post);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState([]);
  const [status, setStatus] = useState('public');
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      navigation.goBack();
      setTitle('');
      setImage([]);
    }
  }, [isSuccess]);

  const clearContent = () => {
    setTitle('');
    setImage([]);
  };

  const uploadPostImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
      multiple: true,
    }).then(images => {
      if (images.length > 0) {
        const selectedImages = images.map(
          image => 'data:image/jpeg;base64,' + image.data,
        );
        setImage([...image, ...selectedImages]);
      }
    });
  };

  const createPost = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('status', status);

    image.forEach((img, index) => {
      formData.append('images', {
        uri: img,
        type: 'image/jpeg',
        name: `image_${index}.jpg`,
      });
    });

    try {
      const response = await axios.post(`${uri}/post`, formData, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post uploaded successfully:', response.data);
      clearContent();
      navigation.navigate('Home2');
    } catch (error) {
      console.error('Error uploading post:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-between bg-zinc-900 w-full h-full">
      <ScrollView
        className="h-full bg-zinc-900"
        showsVerticalScrollIndicator={false}>
        <View>
          <View className="w-full flex-row border-b border-gray-600 pb-4 mt-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-[16px] font-normal text-white ml-4 items-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="pl-[120px] text-[18px] font-medium text-white text-center items-center">
              New threads
            </Text>
          </View>

          <View className="mt-6 ml-4 flex-row">
            <Image
              source={
                user?.avatar
                  ? {uri: user?.avatar}
                  : require('../../assets/images/avatar.jpg')
              }
              style={{width: 40, height: 40, borderRadius: 100}}
            />
            <View className="pl-3">
              <View className="w-[100%] flex-row">
                <Text className="text-[18px] font-medium text-white pl-3">
                  {user.name}
                </Text>
                {(title || image.length > 0) && (
                  <TouchableOpacity onPress={clearContent}>
                    <AntDesign
                      name="close"
                      size={20}
                      color={'gray'}
                      style={{paddingStart: 250}}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                placeholder="What's new?"
                placeholderTextColor={'gray'}
                value={title}
                onChangeText={text => setTitle(text)}
                style={{height: 40}}
                className="pl-3 text-white"
              />
              <ScrollView
                className="gap-3"
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
                {image.length > 0 &&
                  image.map((item, index) => (
                    <View key={index} className="m-2">
                      <Image
                        source={{uri: item}}
                        width={200}
                        height={300}
                        resizeMethod="auto"
                        alt="image"
                      />
                    </View>
                  ))}
              </ScrollView>
              <View className="flex-row gap-2 items-center">
                <TouchableOpacity onPress={uploadPostImage}>
                  <Ionicons
                    name="images-outline"
                    size={20}
                    color={'gray'}
                    className="pl-3 pr-1"
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Feather name="video" color={'gray'} size={20} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Feather name="mic" color={'gray'} size={18} />
                </TouchableOpacity>

                {/* Privacy option dropdown */}
                <View className="flex-row items-center relative">
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => setDropdownVisible(!isDropdownVisible)}>
                    {status === 'private' && (
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="gray"
                        style={{marginRight: 3}}
                      />
                    )}
                    {status === 'public' && (
                      <Ionicons
                        name="lock-open-outline"
                        size={20}
                        color="gray"
                        style={{marginRight: 3}}
                      />
                    )}
                    <Text className="text-white capitalize">{status}</Text>
                  </TouchableOpacity>

                  {/* Dropdown menu */}
                  {isDropdownVisible && (
                    <View
                      className="absolute bg-gray-700 rounded p-2 shadow-lg"
                      style={{
                        top: 30,
                        left: 10,
                        zIndex: 10,
                        width: 100,
                      }}>
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => {
                          setStatus('public');
                          setDropdownVisible(false);
                        }}>
                        <Text className="text-white">Public</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => {
                          setStatus('private');
                          setDropdownVisible(false);
                        }}>
                        <Text className="text-white">Private</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="p-6 flex-row justify-between text-center border-t border-gray-500">
        <Text className="text-gray-500">Anyone can reply</Text>
        <TouchableOpacity onPress={createPost}>
          <Text className="text-blue-600 text-[18px] font-medium">Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PostScreen;
