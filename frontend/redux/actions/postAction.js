import axios from "axios";
import uri from '../uri'
import AsyncStorage from "@react-native-async-storage/async-storage";


// create post
export const createPostAction = (title, image, user) => async dispatch => {
    const token = await AsyncStorage.getItem('token');
    try {
        dispatch({
            type: 'postCreateRequest',
        });
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };

        const { data } = await axios.post(
            `${uri}/post`,
            {title, image, user},
            config
        ); 
// Change url backend 
    }  catch (error) {
        dispatch({
            type: 'postCreateFailed',
            // payload: error.data.message,
        });
    }
}

