import axios from 'axios';
import {uri} from '../uri';
import AsyncStorage from '@react-native-async-storage/async-storage';

// register user
export const registerUser = (name, email, password) => async dispatch => {
  try {
    dispatch({
      type: 'userRegisterRequest',
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const {data} = await axios.post(
      `${uri}/signup`,
      {name, email, password},
      config,
    );
    dispatch({
      type: 'userRegisterSuccess',
      payload: data.user,
    });
    const user = JSON.stringify(data.user);
    await AsyncStorage.setItem('user', user);
  } catch (error) {
    dispatch({
      type: 'userRegisterFailed',
      payload: error.data.response.message,
    });
  }
};

// load user

export const loadUser = () => async dispatch => {
  try {
    dispatch({
      type: 'userLoadRequest',
    });

    const jsonValue = await AsyncStorage.getItem('user');
    if (jsonValue != null) {
      const user = JSON.parse(jsonValue);
      dispatch({
        type: 'userLoadSuccess',
        payload: user,
      });
    }
  } catch (error) {
    dispatch({
      type: 'userLoadFailed',
      payload: error.response.data.message,
    });
  }
};

// login user
export const loginUser = (email, password) => async dispatch => {
  try {
    dispatch({
      type: "userLoginRequest",
    })
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const {data} = await axios.post(
      `${uri}/login`,
      {email, password},
      config,
    );
    dispatch({
      type: 'userLoginSuccess',
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: 'userLoginFailed',
      payload: error.response.data.message,
    });
  }
}