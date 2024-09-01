import {View, Text, Image} from 'react-native';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const Tabs = (props) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        
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
              style={{width: 30, height: 30, tintColor: focused ? 'black' : 'gray'}}
            />
          ),
        })}
      />
       <Tab.Screen
        name="Search"
        component={HomeScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3031/3031293.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'black' : 'gray'}}
            />
          ),
        })}
      />
       <Tab.Screen
        name="Post"
        component={HomeScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3161/3161837.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'black' : 'gray'}}
            />
          ),
        })}
      />
       <Tab.Screen
        name="Favourite"
        component={HomeScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: focused ? 'https://cdn-icons-png.flaticon.com/512/2077/2077502.png' : 'https://cdn-icons-png.flaticon.com/512/151/151910.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'black' : 'gray'}}
            />
          ),
        })}
      />
       <Tab.Screen
        name="Profile"
        component={HomeScreen}
        options={({route}) => ({
          tabBarIcon: ({focused}) => (
            <Image
              source={{
                uri: focused ? 'https://cdn-icons-png.flaticon.com/512/14673/14673907.png' : 'https://cdn-icons-png.flaticon.com/512/17123/17123228.png'
              }}
              style={{width: 30, height: 30, tintColor: focused ? 'black' : 'gray'}}    
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default Tabs;
