import './global.css';
import React, { useState } from 'react';
import { Text } from 'react-native';
import Auth from './src/navigation/Auth';
import Main from './src/navigation/Main';
import Store from './redux/store';
import { Provider, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SocketProvider } from './src/components/SocketContext';
import Toast from 'react-native-toast-message';

function App() {
  // useEffect(() => {
  //   connectSocket();
  //
  //   return () => {
  //     disconnectSocket();
  //   };
  // }, []);

  return (
    <Provider store={Store}>
      <NavigationContainer>
        <AppStack />
        {/*<Toast ref={(ref) => Toast.setRef(ref)} />*/}
        <Toast />
      </NavigationContainer>
    </Provider>
  );
}

const AppStack = () => {
  const { isAuthenticated, isLoading } = useSelector(state => state.user);
  const [isLogin, setIsLogin] = useState(true);

  if (isLoading) {
    return <Text className="text-black">Loading</Text>;
  }

  return isAuthenticated ? (
    <SocketProvider>
      <Main />
    </SocketProvider>
  ) : (
    <Auth />
  );
};

export default App;
