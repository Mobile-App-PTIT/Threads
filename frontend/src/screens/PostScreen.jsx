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
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createPostAction} from '../../redux/actions/postAction';
import AsyncStorage from '@react-native-async-storage/async-storage';

const user1 = {
  name: 'John Doe',
  // avatar: {
  //   url: 'https://a0.muscache.com/im/pictures/f06bce03-0dc2-4719-acf8-25ec189ca8cf.jpg?im_w=720',
  // },
};

const PostScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.user);
  const {isSuccess, isLoading} = useSelector(state => state.post);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState([]);
  const [replies, setReplies] = useState([
    {
      title: '',
      image: [],
      user: user || user1,
    },
  ]);

  useEffect(() => {
    if (
      replies.length === 1 &&
      replies[0].title === '' &&
      replies[0].image.length === 0
    ) {
      setReplies([]);
    }
    if (isSuccess) {
      navigation.goBack();
    }
    // chay ham thi state isSuccess thay doi

    setReplies([]);
    setTitle('');
    setImage([]);
  }, []);
  

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
        // setOneImage('data:image/jpeg;base64,' + image.data);
      }
    });
  };
  

  const createPost = async () => {
    const formData = new FormData();
    formData.append('title', title);
    
    // Append images to formData
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
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.data.success) {
        console.log('Post uploaded successfully:', response.data);
      }
    } catch (error) {
      console.error('Error uploading post:', error);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 justify-between bg-zinc-900 w-full h-full">
      <ScrollView className="h-full bg-zinc-900" showsVerticalScrollIndicator={false}>
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
          {/* Create post */}

          <View className="mt-6 ml-4 flex-row">
            <Image
              source={
                user1?.avatar?.url
                  ? {uri: user?.avatar?.url}
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
                      style={{paddingStart: 200}}
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
              <ScrollView className="gap-3" horizontal={true} showsHorizontalScrollIndicator={false}>
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
                  {/* {oneImage && (<View className="m-2">
                      <Image
                        source={{uri: oneImage}}
                        width={200}
                        height={300}
                        resizeMethod="auto"
                        alt="image"
                      />
                    </View>)} */}
                  
              </ScrollView>
              <TouchableOpacity className="mt-1" onPress={uploadPostImage}>
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={'gray'}
                  className="pl-3"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="p-6 flex-row justify-between text-cente border-t border-gray-500">
        <Text className="text-gray-500">Anyone can reply</Text>
        <TouchableOpacity onPress={createPost}>
          <Text className="text-blue-600 text-[18px] font-medium">Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PostScreen;
