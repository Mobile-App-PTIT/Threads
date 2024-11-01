import './global.css';
import React, {useState, useEffect} from 'react';
import { Text } from 'react-native';
import Auth from './src/navigation/Auth';
import Main from './src/navigation/Main';
import Store from './redux/store';
import {Provider, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import { loadUser } from './redux/actions/userAction';
import Toast from 'react-native-toast-message'; // Import Toast

function App() {
  return (
    <Provider store={Store}>
      <AppStack />
      <Toast/>
    </Provider>
  );
}

const AppStack = () => {
  const [isLogin, setIsLogin] = useState(true);
  const {isAuthenticated, isLoading} = useSelector(state => state.user);
  const [isLoading1, setIsLoading1] = useState(false);

  return (
    <>
      {isLoading ? (
        <Text className='text-black'>Loading</Text>
      ) : (
        <>
          {isAuthenticated ? ( // sau thay = isAuthenticated
            <NavigationContainer>
              <Main/>
            </NavigationContainer>
          ) : (
            <NavigationContainer>
              <Auth />
            </NavigationContainer>
          )}
        </>
      )}
      
    </>
  );
};

export default App;
