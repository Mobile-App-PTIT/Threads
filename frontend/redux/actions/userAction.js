import axios from 'axios';
import uri from '../uri';
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
      `${uri}/auth/signup`,
      {name, email, password},
      config,
    );
    dispatch({
      type: 'userRegisterSuccess',
      payload: data.user,
    });
    const user = JSON.stringify(data.user);
    // await AsyncStorage.setItem('user', user);
   
  } catch (error) {
    dispatch({
      type: 'userRegisterFailed',
      payload: error.data.response.message || 'Registration failed',
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
      `${uri}/auth/login`,
      {email, password},
      config,
    );
    dispatch({
      type: 'userLoginSuccess',
      payload: data.user,
    });
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }
  } catch (error) {
    dispatch({
      type: 'userLoginFailed',
      payload: error.response.data.message,
    });
  }
}

// logout user
export const logoutUser = () => async dispatch => {
  try {
    dispatch({
      type: 'userLogoutRequest',
    })

    await AsyncStorage.setItem('token', '');

    dispatch({
      type: 'userLogoutSuccess',
      payload: {}
    })
  } catch (error) {
    dispatch({
      type: 'userLogoutFailed',
      payload: error.response.data.message,
    });
  }
}

export const getAllUsers = () => async dispatch => {
  try {
    dispatch({
      type: 'getUsersRequest',
    });

    const token = await AsyncStorage.getItem('token');

    const {data} = await axios.get(`${uri}/users`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    dispatch({
      type: 'getUsersSuccess',
      payload: data.users,
    });
  } catch (error) {
    dispatch({
      type: 'getUsersFailed',
      payload: error.response.data.message,
    });
  }
}