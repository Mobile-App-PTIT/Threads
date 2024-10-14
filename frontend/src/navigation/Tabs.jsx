import {View, Text, Image} from 'react-native';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PostScreen from '../screens/PostScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const Tabs = (props) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          // backgroundColor: 'rgba(18,25,40,1)'
          // backgroundColor: 'black'
          backgroundColor: 'rgb(24,24,27)'
        }
      }}>
      <Tab.Screen
        name="Home2"
        component={HomeScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: focused ? 'https://cdn-icons-png.flaticon.com/512/6997/6997164.png' : 'https://cdn-icons-png.flaticon.com/512/6998/6998782.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'white' : 'gray'}}
            />
            // <Ionicons size={30} name='home' color={focused ? 'white' : 'gray'}/>
          ),
        })}
      />
       <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3031/3031293.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'white' : 'gray'}}
            />
          ),
        })}
      />
       <Tab.Screen
        name="Post"
        component={PostScreen}
        options={({route}) => ({
          tabBarStyle: {display: route.name === 'Post' ? 'none' : 'flex'},
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3161/3161837.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'white' : 'gray'}}
            />
          ),
        })}
      />
       <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: focused ? 'https://cdn-icons-png.flaticon.com/512/2077/2077502.png' : 'https://cdn-icons-png.flaticon.com/512/151/151910.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'white' : 'gray'}}
            />
          ),
        })}
      />
       <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: focused ? 'https://cdn-icons-png.flaticon.com/512/14673/14673907.png' : 'https://cdn-icons-png.flaticon.com/512/17123/17123228.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'white' : 'gray'}}    
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default Tabs;
