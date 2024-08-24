import './global.css';
import React, {useState} from 'react';
import Auth from './src/navigation/Auth';
import Main from './src/navigation/Main';
import { NavigationContainer } from '@react-navigation/native';

function App() {
  return (
      <AppStack />
  );
}

const AppStack = () => {
  const [isLogin, setIsLogin] = useState(false);
  return (
   <>
    {isLogin ? (
      <NavigationContainer>
        <Main />
      </NavigationContainer>
    ) : (
      <NavigationContainer>
        <Auth />
      </NavigationContainer>
    )}
   </>
  );
};



export default App;
