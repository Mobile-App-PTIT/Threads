import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useEffect, useState} from 'react';
import {messsagesData} from '../../assets';

const ListMessageScreen = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [data, setData] = useState(messsagesData);

  const handleSearch = text => {
    setSearch(text);
    if (text.length > 0) {
      const filteredData = messsagesData.filter(item => {
        return item.fullName.toLowerCase().includes(text.toLowerCase());
      });

      setData(filteredData);
    } else {
      setData(messsagesData);
    }
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        className="flex-row w-full items-center justify-between"
        key={index}
        onPress={() =>
          navigation.navigate('ChatScreen', {userName: item.fullName})
        }>
        {/*   style={[styles.userContainer, index % 2 !== 0 ? styles.background: null]} */}
        <View className="py-4">
          {item.isOnline && item.isOnline === true && (
            <View className="h-5 w-5 rounded-full bg-green-500 absolute top-4 right-0 z-50 border border-white"></View>
          )}
          <Image
            source={item.userImg}
            resizeMode="contain"
            className="h-20 w-20 rounded-full"
          />
        </View>
        <View className="flex-row w-[280px]">
          <View className="flex-col">
            <Text className="text-gray-300 font-semibold mb-1 text-[14px]">
              {item.fullName}
            </Text>
            <Text className="text-gray-500">{item.lastMessage}</Text>
          </View>
          <View className="absolute right-[4px] items-center">
            <Text className="text-white text-[12px]">
              {item.lastMessageTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    return (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center bg-neutral-800 h-18 w-[380px] my-[15px] px-[15px] rounded-xl">
          <TouchableOpacity>
            <Ionicon name="search" size={26} color="gray" />
          </TouchableOpacity>
          <TextInput
            onChangeText={handleSearch}
            value={search}
            placeholder="Search"
            placeholderTextColor="gray"
            className="flex-1 h-[100%] mx-[8px] text-white"
          />
          <TouchableOpacity>
            <Feather name="edit" size={24} color="gray" />
          </TouchableOpacity>
        </View>
        {/* Render chat */}
        <View>
          <FlatList
            data={data}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}></FlatList>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 h-full bg-zinc-900 text-white">
      <ScrollView>
        <View className="p-5 items-center">{renderContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ListMessageScreen;
