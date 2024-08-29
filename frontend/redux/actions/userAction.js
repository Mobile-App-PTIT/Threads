import axios from 'axios';
import {uri} from '../uri';

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
  } catch (error) {
    dispatch({
      type: 'userRegisterFailed',
      payload: error.response.data.message,
    });
  }
};


