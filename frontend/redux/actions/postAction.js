import axios from "axios";
import { uri } from '../uri'


// create post
export const createPostAction = (title, image, user, replies) => async dispatch => {
    try {
        dispatch({
            type: 'postCreateRequest',
        });
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const { data } = await axios.post(
            `${uri}/posts`,
            { title, image, user, replies },
            config
        ); 
// Change url backend 
    }  catch (error) {
        dispatch({
            type: 'postCreateFailed',
            payload: error.response.data.message,
        });
    }
}

