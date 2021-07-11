import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import Background from '../../assets/img/background.png';
import EyeSlash from '../../assets/img/eye-slash.png';
import Eye from '../../assets/img/eye.png';
import Back from '../../assets/img/left.png';
import PasswordLogin from '../../assets/img/passwordLogin.png';
import Orientation from 'react-native-orientation';
import API from '../../networking/api';
import ApiGraphQl from '../../networking/apiGraphQl';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from '../../constants/i18n';
const NewPassword = (props) => {
  const STATUS_BAR = StatusBar.statusBarHeight || 24;
  const [businessId, setBusinessId] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newPasswordVisible, setNewPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const api = new API();
  const apigraphql = new ApiGraphQl();
  const SecondInput = useRef(null);
  useEffect(() => {
    Orientation.lockToPortrait()
  }, [])
  useEffect(() => {
    setBusinessId(props.route.params.businessId)
    setUserId(props.route.params.userId)
    setLoading(false)
  }, [props])
  const signUp = () => {
    if (password == confirmPassword) {
      setLoading(true)
      receptionSignUp(password, businessId, userId)
    } else {
      setPassword("");
      setConfirmPassword("")
    }
  }
  const receptionSignUp = (password, businessId, userId) => {
    api.receptionSignUpApi(password, businessId, userId)
      .then((result) => {
        if (result.data.data) {
          props.navigation.navigate("Login")
          console.log(result.data.data)
          setLoading(false)
        }
        else {
          setLoading(false)
          console.log(result.data)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ImageBackground
        source={Background}
        style={[styles.content, { height: Dimensions.get('window').height - STATUS_BAR }]}>
        <View
          style={styles.cont}>
          <TouchableOpacity style={{ position: 'absolute', top: 20, left: 20 }}
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Image source={Back} style={{ tintColor: '#fff' }} />
          </TouchableOpacity>
          <Text style={styles.sign_in_text}>{I18n.t('New_password')}</Text>
          <View style={styles.input_view}>
            <View style={{ width: '100%', paddingHorizontal: 20 }}>
              <View style={styles.input_item_view}>
                <Image source={PasswordLogin} />
                <TextInput
                  placeholder={`${I18n.t("New_password")}`}
                  placeholderTextColor={'#fff'}
                  style={styles.input}
                  secureTextEntry={newPasswordVisible}
                  onChangeText={(text) => {
                    setPassword(text)
                  }}
                  returnKeyType={'go'}
                  onSubmitEditing={() => { SecondInput.current.focus(); }}
                  value={password}
                />
                <TouchableOpacity
                  onPress={() => {
                    setNewPasswordVisible(!newPasswordVisible)
                  }}
                >
                  <Image source={newPasswordVisible ? EyeSlash : Eye} style={styles.eye} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ width: '100%', paddingHorizontal: 20 }}>
              <View style={styles.input_item_view}>
                <Image source={PasswordLogin} />
                <TextInput
                  placeholder={`${I18n.t("Confirm_password")}`}
                  placeholderTextColor={'#fff'}
                  style={styles.input}
                  secureTextEntry={confirmPasswordVisible}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                  }}
                  value={confirmPassword}
                  returnKeyType={'next'}
                  onSubmitEditing={() => { signUp() }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }}
                >
                  <Image source={confirmPasswordVisible ? EyeSlash : Eye} style={styles.eye} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.sign_in_btn} onPress={signUp}>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                  <Text style={styles.sign_in_btn_text}>{I18n.t("SIGN_UP")}</Text>
                )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomStyle}>
          <View style={styles.buttonStyle}>
            <View style={styles.newBeachLayout}>
              <Text style={styles.bottomColor}>{I18n.t('already_have_account')}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              props.navigation.navigate("Login")
            }}>
              <Text style={styles.signupStyle}>{I18n.t('Sign_In')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

export { NewPassword };

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  cont: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    alignItems: 'center',
  },
  title_img: {
    marginTop: 150
  },
  sign_in_text: {
    color: '#FFFFFF',
    marginTop: 150,
    fontSize: 30,
    fontWeight: 'bold'
  },
  input_view: {
    marginTop: 70,
    marginHorizontal: 16
  },
  input_item_view: {
    marginTop: 23,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#C1C1C1',
    borderBottomWidth: 1,
  },
  input: {
    color: '#fff',
    paddingLeft: 10,
    width: '90%',
    fontSize: 16,
    lineHeight: 21,
    paddingRight: 20
  },
  sign_in_btn: {
    height: 44,
    backgroundColor: '#CC8C35',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 25,
    marginHorizontal: 20
  },
  sign_in_btn_text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff'
  },
  bottomStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    alignItems: 'center',
  },
  buttonStyle: {
    display: 'flex',
    flexDirection: 'row'
  },
  bottomColor: {
    color: 'white'
  },
  signupStyle: {
    fontSize: 16,
    color: 'white'
  },
  newBeachLayout: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingTop: 2
  },
  languageStyle: {
    position: 'absolute',
    top: 40,
    left: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10
  },
  langTextStyle: {
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 3,
    paddingHorizontal: 20
  },
  languageBarStyle: {
    position: 'absolute',
    top: 40,
    left: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10
  },
  borderBottomStyle: {
    borderBottomWidth: 1,
    borderColor: '#fff'
  },
  eye: {
    width: 28,
    height: 15,
    tintColor: 'white',
    marginTop: 7
  }
});
