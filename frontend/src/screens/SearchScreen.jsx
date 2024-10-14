import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {getAllUsers} from '../../redux/actions/userAction';

const userData = [
  {
    name: 'Bui Nguyen Tung Lam',
    email: '',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel libero nec libero tincidunt luctus.',
    avatar: '',
    subname: 'Software Engineer',
    followers: 100,
  },
  {
    name: 'Ngoc Long',
    email: '',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel libero nec libero tincidunt luctus.',
    avatar: '',
    subname: 'Software Engineer',
    followers: 100,
  },
  {
    name: 'Anh Tuan',
    email: '',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel libero nec libero tincidunt luctus.',
    avatar: '',
    subname: 'Software Engineer',
    followers: 100,
  },
];

const SearchScreen = () => {
  const [data, setData] = useState([]);
  const {users, user, isLoading} = useSelector(state => state.user);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   getAllUsers()(dispatch);
  // }, [dispatch]);

  // useEffect(() => {
  //   if (users) {
  //     setData(users);
  //   }
  // }, [users]);

  // const handleSearchChange = e => {
  //   if (e.length !== 0) {
  //     const filteredUsers =
  //       users &&
  //       users.filter(i => i.name.toLowerCase().includes(e.toLowerCase()));
  //     setData(filteredUsers);
  //   } else {
  //     setData(users);
  //   }
  // };

  useEffect(() => {
    if (userData) {
      setData(userData);
    }
  }, [userData]);

  const handleSearch = e => {
    if (e.length !== 0) {
      const filteredUsers = userData.filter(i =>
        i.name.toLowerCase().includes(e.toLowerCase()),
      );
      setData(filteredUsers);
    } else {
      setData(userData)
    }
  };

  return (
    <SafeAreaView className="bg-zinc-900 flex-1">
      <View className="p-5 bg-zinc-900">
        <Text className="text-white text-3xl font-[700]">Search</Text>
        <View className="relative pt-2">
          <FontAwesome
            name="search"
            size={22}
            color="gray"
            className="top-[30px] left-4 absolute z-10"
          />
          <TextInput
            onChangeText={e => handleSearch(e)}
            placeholder="Search"
            placeholderTextColor={'gray'}
            className=" w-full h-[50px] bg-neutral-800 rounded-[8px] pl-14 pt-2 text-white mt-[10px]"></TextInput>
        </View>
        <FlatList
          className='mt-5'
          data={data}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => {
            // const handleFollowUnfollow = async (e) => {
            //   try {
            //     if (e.followers.find((i) => i.userId === user._id)) {
            //       await unfollowUserAction({
            //         userId: user._id,
            //         users,
            //         followUserId: e._id,
            //       })(dispatch);
            //     } else {
            //       await followUserAction({
            //         userId: user._id,
            //         users,
            //         followUserId: e._id,
            //       })(dispatch);
            //     }
            //   } catch (error) {
            //     console.log(error, 'error');
            //   }
            // };
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('UserProfile', {
                    item: item,
                  })
                }
                className="bg-zinc-900">
                <View className="flex-row my-3">
                  <Image
                    source={
                      userData?.avatar
                        ? {uri: userData.avatar}
                        : require('../../assets/images/avatar.jpg')
                    }
                    style={{width: 40, height: 40}}
                    borderRadius={100}
                  />
                  <View className="w-[89%] flex-row justify-between border-b border-gray-700 pb-3">
                    <View>
                      <View className="flex-row items-center relative">
                        <Text className="pl-3 text-[18px] text-white">
                          {item.name}
                        </Text>
                        {item?.role === 'Admin' && (
                          <Image
                            source={{
                              uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                            }}
                            width={18}
                            height={18}
                            className="ml-1"
                          />
                        )}
                      </View>

                      <Text
                        className="pl-3 text-[14px] text-gray-400"
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.subname}
                      </Text>
                      <Text className="pl-3 mt-3 text-[14px] text-white">
                        {item.followers.length}1 followers
                      </Text>
                    </View>
                    <View>
                      <TouchableOpacity
                            className="rounded-[8px] w-[100px] flex-row justify-center items-center h-[35px] border border-slate-700"
                            onPress={() => handleFollowUnfollow(item)}>
                            <Text className="text-white">
                              {/* {item.followers.find(
                                (i) => i.userId === user._id,
                              )
                                ? 'Following'
                                : 'Follow'} */}
                                Follows
                            </Text>
                          </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
