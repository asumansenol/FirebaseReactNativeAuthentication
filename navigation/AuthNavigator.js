import { createSwitchNavigator } from 'react-navigation';
import LoadingScreen from '../screens/LoadingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignInScreen from '../screens/SignInScreen';
const AuthNavigator = createSwitchNavigator(
  {
    Loading: { screen: LoadingScreen },
    SignUp: { screen: SignUpScreen },
    SignIn: { screen: SignInScreen }
  },
  { initialRouteName: 'Loading' }
);
export default AuthNavigator;
