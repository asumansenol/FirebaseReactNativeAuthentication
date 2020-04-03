import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import 'firebase/firestore';
import firebase from 'firebase';
import * as Facebook from 'expo-facebook'
import * as Google from 'expo-google-app-auth';
import * as Segment from 'expo-analytics-segment';
export const isAndroid = () => Platform.OS === 'android';
import {
  FACEBOOK_APP_ID,
  ANDROID_CLIENT_ID,
  IOS_CLIENT_ID
} from 'react-native-dotenv'

const facebookAppId = {
  FACEBOOK_APP_ID
}
const androidClientId = {
  ANDROID_CLIENT_ID,

}
const IOSClientId = {
  IOS_CLIENT_ID
}



class SignUpScreen extends React.Component {
  state = { displayName: '', email: '', password: '', errorMessage: '', loading: false };
  onLoginSuccess() {
    this.props.navigation.navigate('App');
  }


  onLoginFailure(errorMessage) {
    this.setState({ error: errorMessage, loading: false });
  }
  renderLoading() {
   
    if (this.state.loading) {
      return (
        <View>
          <ActivityIndicator size={'large'} />
        </View>
      );
    }
  }
  async signInWithEmail() {
    await firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(this.onLoginSuccess.bind(this))
      .catch(error => {
          let errorCode = error.code;
          let errorMessage = error.message;
          if (errorCode == 'auth/weak-password') {
              this.onLoginFailure.bind(this)('Weak Password!');
          } else {
              this.onLoginFailure.bind(this)(errorMessage);
          }
      });
      Segment.identify(this.state.email);
      Segment.trackWithProperties("User SignIn", {
        accountType: "CustomEmailAuth",
        email:this.state.email
      });
   
  }
  async signInWithFacebook() {
    try {
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(facebookAppId, {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        const facebookProfileData = await firebase.auth().signInWithCredential(credential);
        this.onLoginSuccess.bind(this);
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

   isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
            providerData[i].uid === googleUser.getBasicProfile().getId()) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  }

   onSignIn = (googleUser)  => {
    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!this.isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken);
        // Sign in with credential from the Google user.
        firebase.auth().signInAndRetrieveDataWithCredential(credential).then(function(result){
            
            console.log("user sign in");
        firebase
        .database()
        .ref('/users'+result.user.uid)
        .set({
            gmail:result.user.email,
            profile_picture:result.additionalUserInfo.profile.profile_picture,
            locale:result.additionalUserInfo.profile_picture.locale,
            first_name:result.additionalUserInfo.given_name,
            last_name:result.additionalUserInfo.first_name
        })
        .then(function(snapshot){

        });
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
      } else {
        console.log('User already signed-in Firebase.');
      }
    }.bind(this));
  }
  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId: androidClientId,
        iosClientId: IOSClientId,
        behavior: 'web',
        iosClientId: '', //enter ios client id
        scopes: ['profile', 'email']
      });

      if (result.type === 'success') {
        this.onSignIn(result);
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  };
  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={styles.container} behavior="padding">
            <Text style={{ fontSize: 32, fontWeight: '700', color: 'gray' }}>
              App Name
            </Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#B1B1B1"
                returnKeyType="next"
                textContentType="name"
                value={this.state.displayName}
                onChangeText={displayName => this.setState({ displayName })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#B1B1B1"
                returnKeyType="next"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={this.state.email}
                onChangeText={email => this.setState({ email })}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#B1B1B1"
                returnKeyType="done"
                textContentType="newPassword"
                secureTextEntry={true}
                value={this.state.password}
                onChangeText={password => this.setState({ password })}
              />
            </View>
            {this.renderLoading()}
            <Text
              style={{
                fontSize: 18,
                textAlign: 'center',
                color: 'red',
                width: '80%'
              }}
            >
              {this.state.error}
            </Text>
            <TouchableOpacity
              style={{ width: '86%', marginTop: 10 }}
              onPress={() => this.signInWithEmail()}
            >
                <Text>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: '86%', marginTop: 10 }}
              onPress={() => this.signInWithFacebook()}>
              <View style={styles.button}>
                <Text
                  style={{
                    letterSpacing: 0.5,
                    fontSize: 16,
                    color: '#FFFFFF'
                  }}
                >
                  Continue with Facebook
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ width: '86%', marginTop: 10 }}
              onPress={() => this.signInWithGoogleAsync()}>
              <View style={styles.googleButton}>
                <Text
                  style={{
                    letterSpacing: 0.5,
                    fontSize: 16,
                    color: '#707070'
                  }}
                >
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>
            <View style={{ marginTop: 10 }}>
              <Text
                style={{ fontWeight: '200', fontSize: 17, textAlign: 'center' }}
                onPress={() => {
                  this.props.navigation.navigate('SignIn');
                }}
              >
                Already have an account?
              </Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center'
  },
  form: {
    width: '86%',
    marginTop: 15
  },
  logo: {
    marginTop: 20
  },
  input: {
    fontSize: 20,
    borderColor: '#707070',
    borderBottomWidth: 1,
    paddingBottom: 1.5,
    marginTop: 25.5
  },
  button: {
    backgroundColor: '#3A559F',
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#707070'
  }
});
export default SignUpScreen;