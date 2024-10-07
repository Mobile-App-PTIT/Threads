import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getNotifications} from '../../redux/actions/notificationAction';
import {useDispatch, useSelector} from 'react-redux';
import getTimeDuration from '../common/TimeGenerator';
import {uri} from '../../redux/uri';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
const NotificationScreen = () => {
  const dispatch = useDispatch();
  // const {notifications, isLoading} = useSelector(state => state.notification);
  const [refreshing, setRefreshing] = useState(false);
  const {posts} = useSelector(state => state.post);
  const {token, users} = useSelector(state => state.user);
  const [active, setActive] = useState(0);

  const refreshingHeight = 100;
  const labels = ['All', 'Replies', 'Mentions'];

  const handleTabPress = index => {
    setActive(index);
  };

  useEffect(() => {
    getNotifications()(dispatch);
  }, []);

  const notificationsData = [
    {
      _id: 1,
      type: 'Like',
      title: 'Liked your post',
      postId: '1',
      creator: {
        _id: 1,
        name: 'John Doe',
      },
    },
    {
      _id: 2,
      type: 'Follow',
      title: 'Started following you',
      creator: {
        _id: 2,
        name: 'John Doe',
      },
    },
  ];

  return (
    <SafeAreaView className="bg-zinc-900 flex-1">
      <View className="p-5 mb-[190px]">
        <Text className="text-4xl font-[700] text-white">Activity</Text>

        <View className="w-full flex-row my-3 items-center">
          {labels.map((label, index) => (
            <TouchableOpacity
              key={index}
              className="w-[125px] h-[40px] rounded-[8px] border border-gray-500"
              style={{
                backgroundColor: active === index ? 'white' : 'transparent',
                borderWidth: active === index ? 1 : 0,
              }}
              onPress={() => handleTabPress(index)}>
              <Text
                className={`${
                  active !== index ? 'text-white' : 'text-black'
                } text-[20px] font-[600] text-center pt-[6px]`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* All activites */}
        {active === 0 && notificationsData.length === 0 && (
          <View className="w-full h-[80px] flex items-center justify-center">
            <Text className="text-[16px] text-white mt-5">
              You have no activity yet!
            </Text>
          </View>
        )}

        {/* All Replies */}
        {active === 1 && (
          <View className="w-full h-[80px] flex items-center justify-center">
            <Text className="text-[16px] text-white mt-5">
              You have no replies yet!
            </Text>
          </View>
        )}

        {/* All Replies */}
        {active === 2 && (
          <View className="w-full h-[80px] flex items-center justify-center">
            <Text className="text-[16px] text-white mt-5">
              You have no mentions yet!
            </Text>
          </View>
        )}
        {active === 0 && (
          <FlatList
            data={notificationsData}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  getNotifications()(dispatch).then(() => {
                    setRefreshing(false);
                  });
                }}
                progressViewOffset={refreshingHeight}
              />
            }
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => {
              const time = item.createdAt;
              const formattedDuration = getTimeDuration(time);

              const handleNavigation = async e => {
                const id = item.creator._id;

                await axios
                  .get(`${uri}/get-user/${id}`, {
                    headers: {Authorization: `Bearer ${token}`},
                  })
                  .then(res => {
                    if (item.type === 'Follow') {
                      navigation.navigate('UserProfile', {
                        item: res.data.user,
                      });
                    } else {
                      navigation.navigate('PostDetails', {
                        data: posts.find(i => i._id === item.postId),
                      });
                    }
                  });
              };

              return (
                <TouchableOpacity onPress={() => handleNavigation(item)} className='mt-3'>
                  <View className="flex-row gap-3" key={item._id}>
                    <View className="relative">
                      <Image
                        source={
                          users.find(user => user._id === item.creator._id)
                            ? {
                                uri: users.find(
                                  user => user._id === item.creator._id,
                                )?.avatar.url,
                              }
                            : require('../../assets/images/avatar.jpg')
                        }
                        style={{width: 50, height: 50, borderRadius: 100}}
                      />
                      {item.type === 'Like' && (
                        <View className="absolute bottom-5 border-[2px] border-[#fff] right-[-5px] h-[25px] w-[25px] bg-[#eb4545] rounded-full items-center justify-center flex-row">
                          <AntDesign name='heart' color='white'/>
                        </View>
                      )}

                      {item.type === 'Follow' && (
                        <View className="absolute bottom-5 border-[2px] border-[#fff] right-[-5px] h-[25px] w-[25px] bg-[#5a49d6] rounded-full items-center justify-center flex-row">
                         <Ionicons name='person' color='white' size={15}/>
                        </View>
                      )}
                    </View>
                    <View className="pl-3 my-2">
                      <View className="flex-row w-full items-center border-b pb-3 border-gray-600">
                        <View className="w-full">
                          <View className="flex-row items-center">
                            <Text className="text-[18px] text-white font-bold">
                              {item.creator.name}
                            </Text>
                            <Text className="pl-2 text-[16px] text-white font-[600]">
                              {formattedDuration}
                            </Text>
                          </View>
                          <Text className="text-sm text-gray-400 font-medium">
                            {item.title}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;
