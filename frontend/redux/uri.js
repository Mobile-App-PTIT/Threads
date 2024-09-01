import { Platform } from "react-native";
let uri = ''

if (Platform.OS === 'android') {
    uri = 'http://10.0.2.2:8000/api'
} else if (Platform.OS === 'ios') {
    uri = 'http://localhost:8000/api'
}

export default uri

// vid noi la android thi ko dung dc link localhost mn check cho nay