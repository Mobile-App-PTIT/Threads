import axios from 'axios';
import uri from '../uri';
import AsyncStorage from '@react-native-async-storage/async-storage';

// get all users that are following or followers
export const getFollowingAndFollowers = () => async (dispatch) => {
  const token = await AsyncStorage.getItem('token');
  try {
    dispatch({
      type: 'getFollowingAndFollowersRequest'
    });
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    };
    const { data } = await axios.get(
      `${uri}/user/messages`,
      config
    );
    dispatch({
      type: 'getFollowingAndFollowersSuccess',
      payload: data
    });
  } catch (error) {
    if (error.response.status === 404) {
      dispatch({
        type: 'getFollowingAndFollowersSuccess',
        payload: []
      });
    } else {
      dispatch({
        type: 'getFollowingAndFollowersFailed',
        payload: error.data.message
      });
    }
  }
};