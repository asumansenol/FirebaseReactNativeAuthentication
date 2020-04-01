import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import firebase from 'firebase';
import { firebaseConfig } from './config/firebase.js';
import AuthNavigator from './screens/AuthNavigator';
import HomeScreen from './screens/HomeScreen.js';
import * as Segment from 'expo-analytics-segment';

firebase.initializeApp(firebaseConfig);
Segment.initialize({ androidWriteKey:"aWa3QRFL2QD3VL2oE2yAfvutRE2mBUGm", iosWriteKey:"aWa3QRFL2QD3VL2oE2yAfvutRE2mBUGm" })

export default createAppContainer(
  
  createSwitchNavigator(
    {
      Auth: AuthNavigator,
      App: HomeScreen,
    },
    {
      initialRouteName: 'Auth'
    }
  )
);