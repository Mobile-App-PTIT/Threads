import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useState} from 'react';
import {messsagesData} from '../../assets';

const ListMessageScreen = ({navigation}) => {
  const [search, setSearch] = useState('');

  const renderItem = ({item, index}) => {
    console.log('item', item);
    return (<TouchableOpacity
      key={index}
      onPress={() => navigation.navigate('Chat', {userName: item.fullName})}>
      {/*   style={[styles.userContainer, index % 2 !== 0 ? styles.background: null]} */}
      <View>
        {item.isOnline && item.isOnline === true && <View></View>}
        <Image source={item.userImg} resizeMode="contain" />
      </View>
      <View className="flex-row">
        <View>
          <Text className='text-white'>{item.fullName}</Text>
          <Text className='text-white'>{item.lastMessage}</Text>
        </View>

        <View className="absolute right-[4px] items-center">
          <Text>{item.lastMessageTime}s</Text>
        </View>
      </View>

      <TouchableOpacity className="w-5 h-5 rounded-xl justify-center items-center mt-[12px]">
        <Text className='text-white'>{item.messageInQueue}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
    )
  };

  const renderContent = () => {
    console.log('messsagesData', messsagesData);
    return (
      <View>
        <View className="flex-row items-center bg-neutral-800 h-18 w-[380px] my-[15px] px-[15px] rounded-xl">
          <TouchableOpacity>
            <Ionicon name="search" size={26} color="gray" />
          </TouchableOpacity>
          <TextInput
            placeholder="Search"
            placeholderTextColor="gray"
            className="flex-1 h-[100%] mx-[8px]"
          />
          <TouchableOpacity>
            <Feather name="edit" size={24} color="gray" />
          </TouchableOpacity>
        </View>
        {/* Render chat */}
        <View>
          <FlatList
            data={messsagesData}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}></FlatList>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900 text-white">
      <View className="p-5 items-center">{renderContent()}</View>
    </SafeAreaView>
  );
};

export default ListMessageScreen;
