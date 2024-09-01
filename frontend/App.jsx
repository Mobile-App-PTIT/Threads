import './global.css';
import React, {useState, useEffect} from 'react';
import Auth from './src/navigation/Auth';
import Main from './src/navigation/Main';
import Store from './redux/store';
import {Provider, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import { loadUser } from './redux/actions/userAction';

function App() {
  return (
    <Provider store={Store}>
      <AppStack />
    </Provider>
  );
}

const AppStack = () => {
  const [isLogin, setIsLogin] = useState(true);
  const {isAuthenticated, isLoading} = useSelector(state => state.user);

  useEffect(() => {
    Store.dispatch(loadUser());
  }, [])

  return (
    <>
      {isLoading ? (
        <Text className='text-black'>Loading</Text>
      ) : (
        <>
          {isLogin ? ( // sau thay = isAuthenticated
            <NavigationContainer>
              <Main />
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
