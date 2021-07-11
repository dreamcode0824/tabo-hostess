import React, { Component, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { connect } from 'react-redux'
import Orientation from 'react-native-orientation';
import AsyncStorage from '@react-native-community/async-storage';
import { useRoute } from '@react-navigation/native';
import { Confirm } from '../assets/img/confirm.png';
import { Close } from '../assets/img/close_img.png';
import { useDispatch, useSelector } from "react-redux";
const TabBar = (props) => {
  const userInfo = useSelector(({ userReducer }) => userReducer);
  const [userName, setUserName] = React.useState("")
  const [role, setRole] = React.useState("");
  const [businessId, setBusinessId] = useState("")
  const [businessType, setBusinessType] = useState("");
  const [currentRoute, setCurrentRoute] = useState("");
  const [barStatus, setBarStatus] = useState(false)
  const route = useRoute();
  React.useEffect(() => {
    readData();
    getBusinessId()
    readBusinessType()
  }, [])
  useEffect(() => {
    // if (route.state && route.state.index == 4) {
    //   Orientation.unlockAllOrientations()
    // } else {
    //   Orientation.unlockAllOrientations()
    // }
    Orientation.lockToLandscape()
  }, [route])
  useEffect(() => {
    setBarStatus(userInfo.showbar)
  }, [userInfo.showbar])
  const readBusinessType = async () => {
    try {
      let type = await AsyncStorage.getItem("businessType")
      if (type != null) {
        setBusinessType(type)
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const getBusinessId = async () => {
    try {
      let data = await AsyncStorage.getItem('userData')
      if (data != null) {
        setBusinessId(JSON.parse(data).business_id)
      }
      return data
    } catch (error) {
      console.log(error);
    }
  }
  const readData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData")
      if (userData !== null) {
        setUserName(JSON.parse(userData).name)
        setRole(JSON.parse(userData).role)
      }
    } catch (e) {
      // alert('Failed to fetch the data from storage')
    }
  }
  const logout = () => {
    Orientation.lockToPortrait()
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'LoginNavigator' }],
    });
    clearStorage()
  }

  const tabButtonStyle = (index) => {
    return [styles.buttonContainer2,
    props.state.index === index ?
      styles.selectedTab : null
    ]
  }
  const clearStorage = async () => {
    Orientation.lockToPortrait()
    try {
      await AsyncStorage.clear()
    } catch (e) {
    }
  }
  const buttonIconStyle = (index) => {
    return props.state.index === index ?
      {
        position: 'absolute',
        tintColor: '#CC8C35'
      } :
      {
        tintColor: '#828282'
      }
  }
  console.log(userInfo)
  return (
    <React.Fragment>
      {route.state && route.state.index == 4 ? (
        <>

        </>
      ) : (
        <React.Fragment>
          {barStatus ? (
            <></>
          ) : (
            <View style={styles.rightContent}>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    if (businessType === 'beach' || businessType === "pool") {
                      props.navigation.navigate("BeachPool") // rerender
                    } else {
                      props.navigation.navigate('RestaurantClub') // initial
                    }
                  }}
                  style={tabButtonStyle((businessType === 'beach' || businessType === "pool") ? 0 : 1)}
                  activeOpacity={0.8}
                >
                  <Image
                    style={[
                      styles.anyIcon,
                      buttonIconStyle((businessType === 'beach' || businessType === "pool") ? 0 : 1)
                    ]}
                    source={require('../assets/img/notification.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // props.navigation.navigate('HomeNavigator')
                    if (businessType === 'beach' || businessType === "pool") {
                      props.navigation.navigate('HomeNavigator', { screen: 'Home', params: { customerData: [], status: true } });
                    } else {
                      props.navigation.navigate('HomeNavigator', { screen: 'Table', status: true })
                    }
                    // props.navigation.navigate("Home", { customerData: [], status: true })
                  }}
                  style={tabButtonStyle(2)}
                  activeOpacity={0.8}
                >
                  <Image
                    style={[{
                      height: 18,
                      width: 22,
                    },
                    buttonIconStyle(2)
                    ]}
                    source={require('../assets/img/map.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate('Settings')
                  }}
                  style={tabButtonStyle(3)}
                  activeOpacity={0.8}
                >
                  <Image
                    style={[styles.anyIcon, buttonIconStyle(3)]}
                    source={require('../assets/img/settings.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // props.navigation.reset({
                    //   index: 4,
                    //   routes: [{ name: 'Qrcode' }],
                    // });
                    props.navigation.navigate('Qrcode')
                  }}
                  style={tabButtonStyle(4)}
                  activeOpacity={0.8}
                >
                  <Image
                    style={[styles.anyIcon, buttonIconStyle(4)]}
                    source={require('../assets/img/qr_code.png')}
                  />
                </TouchableOpacity>
              </View>
              <View>
                <View>
                  <Text style={[styles.infoText3, { color: '#CC8C35' }]}>
                    {userName ? userName : ""}
                  </Text>
                  <Text style={styles.infoText3}>
                    {role ? role : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    logout()
                  }}
                  style={[styles.buttonContainer1, { marginTop: 12 }]}
                  activeOpacity={0.8}
                >
                  <Image
                    style={[styles.anyIcon, { marginVertical: 5 }]}
                    source={require('../assets/img/logout.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </React.Fragment>

      )}
    </React.Fragment>
  );
}

export default connect()(TabBar)

const styles = StyleSheet.create({

  rightContent: {
    backgroundColor: '#fff',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: Dimensions.get('window').width * 0.024,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.53,
    shadowRadius: 2.62,
    elevation: 4,
    zIndex: 10
  },
  buttonContainer1: {
    width: '100%',
    alignItems: 'center'
  },
  buttonContainer2: {
    height: 50,
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  anyIcon: {
    height: 17,
    width: 17,
    tintColor: '#828282',
  },
  infoText3: {
    fontFamily: 'Poppins-Light',
    fontSize: 7,
    lineHeight: 10,
    color: '#000',
    textAlign: 'center'
  },
  selectedTab: {
    borderLeftColor: '#CC8C35',
    borderLeftWidth: 2
  },
});
