import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getNotifications} from '../../redux/actions/notificationAction';
import {useDispatch, useSelector} from 'react-redux';
import getTimeDuration from '../common/TimeGenerator';
import uri from '../../redux/uri';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const {posts} = useSelector(state => state.post);
  const {token, users} = useSelector(state => state.user);
  const [active, setActive] = useState(0);
  const [repliesData, setRepliesData] = useState([]);

  const refreshingHeight = 100;
  const labels = ['All', 'Replies', 'Mentions'];

  const handleTabPress = async index => {
    setActive(index);
    const token = await AsyncStorage.getItem('token');
    if (index === 1) {
      // Fetch replies when "Replies" tab is clicked
      try {
        const response = await axios.get(`${uri}/notification/user/${user._id}/replied`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const replies = response.data.metadata.map(reply => {
          return {
            _id: reply?._id,
            content: reply?.title,
            postId: reply?.post_id,

            creator: reply?.replies.map(item => ({
              reply_id: item?._id,
              user_id: item?.user_id?._id,
              name: item?.user_id?.name,
              avatar: item?.user_id?.avatar,
              title: item?.title,
              time: getTimeDuration(item?.createdAt),
            })),
          };
        });
        setRepliesData(replies);
      } catch (error) {
        console.error('Error fetching replies:', error);
      }
    }
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

  // const repliesData = [
  //   {
  //     _id: 1,
  //     content: 'Tks bác nhé',
  //     postId: '1',
  //     creator: {
  //       _id: 3,
  //       name: 'joybutalwaysadaf',
  //       title: 'K co gi e',
  //     },
  //     time: '9 tuần',
  //   },
  // ];

  return (
    <SafeAreaView className="bg-zinc-900 flex-1">
      <View className="p-5">
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

        {/* Replies Section */}
        {active === 1 && (
          <>
            {repliesData.length === 0 ? (
              <View className="w-full h-[80px] flex items-center justify-center">
                <Text className="text-[16px] text-white mt-5">
                  You have no replies yet!
                </Text>
              </View>
            ) : (
              <FlatList
                data={repliesData}
                contentContainerStyle = {{paddingBottom: 100}}
                className='h-full'
                keyExtractor={item => item._id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <View>
                    {/* Kiểm tra creator và map */}
                    {item.creator && item.creator.length > 0 ? (
                      item.creator.map(i => (
                        <TouchableOpacity onPress={() =>
                          navigation.navigate('PostDetailScreen', {
                            post_id: item.postId,
                          })
                        } key={i.reply_id}>
                          <View className="flex-row gap-2 mt-3">
                            <View className="relative">
                              <Image
                                source={
                                  i.avatar !== null
                                    ? {uri: i.avatar}
                                    : require('../../assets/images/avatar.jpg')
                                }
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 100,
                                }}
                              />
                              <View
                                style={{
                                  position: 'absolute',
                                  bottom: 62,
                                  right: -5,
                                  width: 20,
                                  height: 20,
                                  backgroundColor: '#1DA1F2',
                                  borderRadius: 10,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Ionicons
                                  name="arrow-forward"
                                  size={12}
                                  color="white"
                                />
                              </View>
                            </View>
                            <View className="pl-3 border-b border-gray-700 pb-3 w-full">
                              <View className="flex-row items-center">
                                <Text className="text-[16px] text-white font-bold">
                                  {i.name}
                                </Text>
                                <Text className="pl-2 text-[14px] text-gray-400">
                                  {i.time}
                                </Text>
                              </View>
                              <Text className="text-s text-gray-500 font-medium mt-1">
                                {item.content}
                              </Text>
                              <Text className="text-sm text-white font-medium mt-1">
                                {i.title}
                              </Text>
                              <View className="flex-row gap-2 items-center pt-3">
                                <Ionicons
                                  name="heart-outline"
                                  size={20}
                                  color="white"
                                />
                                <Ionicons
                                  name="chatbubble-outline"
                                  size={17}
                                  color="white"
                                />
                                <Feather
                                  name="share-2"
                                  size={18}
                                  color="white"
                                />
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text className="text-gray-500 text-center">
                        No replies
                      </Text>
                    )}
                  </View>
                )}
              />
            )}
          </>
        )}

        {/* Mentions Section */}
        {active === 2 && (
          <View className="w-full h-[80px] flex items-center justify-center">
            <Text className="text-[16px] text-white mt-5">
              You have no mentions yet!
            </Text>
          </View>
        )}

        {/* All Activities Section */}
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

              const handleNavigation = async () => {
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
                <TouchableOpacity
                  onPress={() => handleNavigation(item)}
                  className="mt-3">
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
                          <AntDesign name="heart" color="white" />
                        </View>
                      )}
                      {item.type === 'Follow' && (
                        <View className="absolute bottom-5 border-[2px] border-[#fff] right-[-5px] h-[25px] w-[25px] bg-[#5a49d6] rounded-full items-center justify-center flex-row">
                          <Ionicons name="person" color="white" size={15} />
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
