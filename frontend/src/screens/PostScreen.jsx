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

import {createPostAction} from '../../redux/actions/postAction';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [active, setActive] = useState(false);
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

  const handleTitleChange = (index, text) => {
    setReplies(prevReplies => {
      const updateReplies = [...prevReplies];
      updateReplies[index] = {...updateReplies[index], title: text};
      return updateReplies;
    });
  };

  const uploadRepliesImage = index => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
      multiple: true,
    }).then(images => {
      if (images) {
        setReplies(prevReplies => {
          const updateReplies = [...prevReplies];
          const selectedImages = images.map(
            image => 'data:image/jpeg;base64,' + image.data,
          );
          updateReplies[index] = {
            ...updateReplies[index],
            // image: 'data:image/jpeg;base64,' + image.data,]
            image: [...updateReplies[index].image, ...selectedImages],
          };
          return updateReplies;
        });
      }
    });
  };
  // Create a new thread and save old thread
  const addNewThread = () => {
    if (
      replies[activeIndex].title !== '' ||
      replies[activeIndex].image.length > 0
    ) {
      setReplies(prevReplies => [
        ...prevReplies,
        {title: '', image: '', user: user || user1},
      ]);
      setActiveIndex(replies.length);
    }
  };

  const removeThread = index => {
    if (replies.length > 0) {
      const updatedReplies = [...replies];
      updatedReplies.splice(index, 1); // remove replies at index
      setReplies(updatedReplies);
      setActiveIndex(replies.length - 1);
    } else {
      setReplies([{title: '', image: '', user: user || user1}]);
    }
  };

  const clearContent = () => {
    setTitle('');
    setImage([]);
  };

  const addFreshNewThread = () => {
    if (title !== '' || image.length > 0) {
      setActive(true);
      setReplies(prevReplies => [
        ...prevReplies,
        {title: '', image: '', user: user || user1},
      ]);
      setActiveIndex(replies.length);
    }
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
        // setImage('data:image/jpeg;base64,' + image.data);
      }
    });
  };

  const createPost = () => {
    if (title !== '' || (image !== '' && !isLoading)) {
      createPostAction(title, image, user, replies)(dispatch);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-between bg-black w-full h-full">
      <ScrollView className="h-full bg-black" showsVerticalScrollIndicator={false}>
        <View>
          <View className="w-full flex-row border-b border-gray-600 pb-4 mt-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-[16px] font-normal text-white ml-4 items-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="pl-[120px] text-[18px] font-medium text-white text-center items-center">
              New thread
            </Text>
          </View>
          {/* Create post */}

          <View className="mt-6 ml-4 flex-row">
            <Image
              source={
                user1?.avatar?.url
                  ? {uri: user1.avatar.url}
                  : require('../../assets/images/avatar.jpg')
              }
              style={{width: 40, height: 40, borderRadius: 100}}
            />
            <View className="pl-3">
              <View className="w-[100%] flex-row">
                <Text className="text-[18px] font-medium text-white pl-3">
                  {user1.name}
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
              </ScrollView>
              <TouchableOpacity className="mt-1" onPress={uploadPostImage}>
                <AntDesign
                  name="picture"
                  size={24}
                  color={'gray'}
                  className="pl-3"
                />
              </TouchableOpacity>
            </View>
          </View>
          {replies.length === 0 && (
            <View className="flex-row w-full m-9 items-start mt-5 opacity-7 gap-5">
              <Image
                source={
                  user1?.avatar?.url
                    ? {uri: user1.avatar.url}
                    : require('../../assets/images/avatar.jpg')
                }
                style={{width: 25, height: 25, borderRadius: 100}}
              />
              <Text className="text-gray-500" onPress={addFreshNewThread}>
                Add new thread
              </Text>
            </View>
          )}

          {/* Create replies */}
          {replies.map((item, index) => (
            <View key={index}>
              <View className="mt-6 ml-4 flex-row">
                <Image
                  source={
                    user1?.avatar?.url
                      ? {uri: user1.avatar.url}
                      : require('../../assets/images/avatar.jpg')
                  }
                  style={{width: 40, height: 40, borderRadius: 100}}
                />
                <View className="pl-3">
                  <View className="w-[100%] flex-row">
                    <Text className="text-[18px] font-medium text-white pl-3">
                      {user1.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeThread(index)}>
                      <AntDesign
                        name="close"
                        size={20}
                        color={'gray'}
                        style={{paddingStart: 250}}
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    placeholder="Say more..."
                    placeholderTextColor={'gray'}
                    value={item.title}
                    onChangeText={text => handleTitleChange(index, text)}
                    style={{height: 40}}
                    className="pl-3 text-white"
                  />
                  <ScrollView className="gap-3" showsHorizontalScrollIndicator={false}>
                    {item.image.length > 0 &&
                      item.image.map((item, index) => (
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
                  <TouchableOpacity
                    className="mt-3"
                    onPress={() => uploadRepliesImage(index)}>
                    <AntDesign
                      name="picture"
                      size={24}
                      color={'gray'}
                      className="pl-3"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {index === activeIndex && (
                <View className="flex-row w-full m-9 items-start mt-5 opacity-7 gap-5">
                  <Image
                    source={
                      user1?.avatar?.url
                        ? {uri: user1.avatar.url}
                        : require('../../assets/images/avatar.jpg')
                    }
                    style={{width: 25, height: 25, borderRadius: 100}}
                  />
                  <Text className="text-gray-500" onPress={addNewThread}>
                    Add new thread
                  </Text>
                </View>
              )}
            </View>
          ))}
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
