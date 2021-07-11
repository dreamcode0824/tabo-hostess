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
import Back from '../../assets/img/left.png';
import UserLogin from '../../assets/img/userLogin.png';
import PasswordLogin from '../../assets/img/passwordLogin.png';
import Orientation from 'react-native-orientation';
import API from '../../networking/api';
import ApiGraphQl from '../../networking/apiGraphQl';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from '../../constants/i18n';
const ReceptionVerify = (props) => {
  const STATUS_BAR = StatusBar.statusBarHeight || 24;
  const [data, setData] = useState([]);
  const [userName, setUserName] = useState("");
  const [pinCode, setPinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorStatus, setErrorStatus] = useState(false)
  const api = new API();
  const apigraphql = new ApiGraphQl();
  const SecondInput = useRef(null);
  useEffect(() => {
    Orientation.lockToPortrait()
  }, [])
  useEffect(() => {
    setData(props.route.params.beachData[0])
  }, [props])
  const verify = () => {
    setLoading(true)
    receptionVerify(userName, pinCode, data.id)
  }
  const receptionVerify = (userName, pinCode, businessId) => {
    api.receptionVerifyApi(userName, pinCode, businessId)
      .then((result) => {
        if (result.data.data) {
          props.navigation.navigate("NewPassword", { businessId: businessId, userId: result.data.data })
          setLoading(false)
          setErrorStatus(false)
        }
        else {
          setLoading(false)
          setPinCode("")
          setUserName("")
          setErrorStatus(true)
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
          <Text style={styles.sign_in_text}>{data.location_name}</Text>
          <View style={styles.input_view}>
            <View style={styles.input_item_view}>
              <Image source={UserLogin} />
              <TextInput
                placeholder={`${I18n.t("UserName")}`}
                placeholderTextColor={'#fff'}
                style={styles.input}
                onChangeText={(text) => {
                  setUserName(text)
                }}
                returnKeyType={'go'}
                onSubmitEditing={(event) => { SecondInput.current.focus(); }}
                value={userName}
              />
            </View>
            <View style={styles.input_item_view}>
              <Image source={PasswordLogin} />
              <TextInput
                ref={SecondInput}
                placeholder={`${I18n.t("Code")}`}
                placeholderTextColor={'#fff'}
                keyboardType='phone-pad'
                style={styles.input}
                secureTextEntry={true}
                returnKeyType={'next'}
                onSubmitEditing={() => { verify() }}
                blurOnSubmit={true}
                onChangeText={(text) => {
                  setPinCode(text)
                }}
                value={pinCode}
              />
            </View>
            {errorStatus && (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 5 }}>{I18n.t('username_password_incorrect')}</Text>
            )}
            <TouchableOpacity style={styles.sign_in_btn} onPress={verify}>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                  <Text style={styles.sign_in_btn_text}>{I18n.t("Verify")}</Text>
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

export { ReceptionVerify };

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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#C1C1C1',
    borderBottomWidth: 1
  },
  input: {
    color: '#fff',
    paddingLeft: 10,
    width: '90%',
    fontSize: 16,
    lineHeight: 21
  },
  sign_in_btn: {
    height: 44,
    backgroundColor: '#CC8C35',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 25,
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
  }
});
