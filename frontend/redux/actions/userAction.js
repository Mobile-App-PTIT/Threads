import axios from 'axios';
import uri from '../uri';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StreamVideoClient} from "@stream-io/video-react-native-sdk";
import {STREAM_ACCESS_KEY} from "../../src/utils/env";

// register user
export const registerUser = (name, email, password) => async dispatch => {
    try {
        dispatch({
            type: 'userRegisterRequest'
        });

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const {data} = await axios.post(
            `${uri}/auth/signup`,
            {name, email, password},
            config
        );
        dispatch({
            type: 'userRegisterSuccess'
        });

    } catch (error) {
        dispatch({
            type: 'userRegisterFailed',
            payload: error.data.response.message || 'Registration failed'
        });
    }
};

// login user
export const loginUser = (email, password) => async dispatch => {
    try {
        dispatch({
            type: 'userLoginRequest'
        });
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const {data} = await axios.post(
            `${uri}/auth/login`,
            {email, password},
            config
        );
        dispatch({
            type: 'userLoginSuccess',
            payload: data.user
        });
        if (data.accessToken) {
            await AsyncStorage.setItem('token', data.accessToken);
        }
        if (data.chatToken) {
            await AsyncStorage.setItem('chatToken', data.chatToken);
        }

        const client = {id: data.user._id.toString()};
        const streamClient = StreamVideoClient.getOrCreateInstance({
            apiKey: STREAM_ACCESS_KEY,
            user: client,
            token: data.chatToken
        });

        dispatch({
            type: 'getStreamClient',
            payload: streamClient
        });
    } catch (error) {
        dispatch({
            type: 'userLoginFailed',
            payload: error.response.data.message
        });
    }
};

// logout user
export const logoutUser = () => async dispatch => {
    try {
        dispatch({
            type: 'userLogoutRequest'
        });

        await AsyncStorage.setItem('token', '');

        dispatch({
            type: 'userLogoutSuccess',
            payload: {}
        });

    } catch (error) {
        dispatch({
            type: 'userLogoutFailed',
            payload: error.response.data.message
        });
    }
};


export const getAllUsers = () => async dispatch => {
    try {
        dispatch({
            type: 'getUsersRequest'
        });

        const token = await AsyncStorage.getItem('token');

        const {data} = await axios.get(`${uri}/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        dispatch({
            type: 'getUsersSuccess',
            payload: data.metadata
        });
    } catch (error) {
        dispatch({
            type: 'getUsersFailed',
            payload: error.response.data.message
        });
    }
};

