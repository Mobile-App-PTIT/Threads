
import axios from 'axios';
import uri from '../uri';
import AsyncStorage from '@react-native-async-storage/async-storage';

// get notifications
export const getNotifications = () => async (dispatch) => {
  try {
    dispatch({
      type: 'getNotificationRequest',
    });

    const token = await AsyncStorage.getItem('token');

    const {data} = await axios.get(`${uri}/get-notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: 'getNotificationSuccess',
      payload: data.notifications,
    });
  } catch (error) {
    dispatch({
      type: 'getNotificationFailed',
      payload: error.response.data.message,
    });
  }
};
