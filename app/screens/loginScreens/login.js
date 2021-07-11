import React, { Component } from 'react';
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
import LoginTitle from '../../assets/img/loginTitel.png';
import UserLogin from '../../assets/img/userLogin.png';
import PasswordLogin from '../../assets/img/passwordLogin.png';
import Orientation from 'react-native-orientation';
import API from '../../networking/api';
import ApiGraphQl from '../../networking/apiGraphQl';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from '../../constants/i18n';
import { SaveUserData } from '../../store/redux/userAction';
import { SaveTimeLine } from '../../store/redux/dataAction';
class LoginClass extends Component {

  STATUS_BAR = StatusBar.statusBarHeight || 24;
  api = new API();
  apigraphql = new ApiGraphQl();
  constructor(props) {
    super(props);
    this.state = {
      country: '',
      phone: '',
      code: '',
      invalidPhone: false,
      disabledContinue: true,
      opacityContinue: 0.3,
      name: "",
      password: "",
      loginStatus: false,
      user: "",
      loading: false,
      language: "",
      langMenuStatus: false,
      errorStatus: false,
    };
  }
  txt1 = null;
  componentDidMount() {
    Orientation.lockToPortrait()
    this.readData()
    this.readLanguage();
  }
  readLanguage = async () => {
    try {
      let langParam = await AsyncStorage.getItem("language")
      if (langParam != null) {
        if (langParam == "en") {
          this.setState({ language: "EN" })
          I18n.locale = "en";
        }
        if (langParam == "ro") {
          this.setState({ language: "RO" })
          I18n.locale = "ro";
        }
      } else {
        this.setState({ language: "EN" })
        I18n.locale = "en";
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  readData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData")
      if (userData !== null) {
        Orientation.lockToLandscape()
        const businessTypeStr = await AsyncStorage.getItem("businessType");
        const businessType = businessTypeStr
        // Orientation.unlockAllOrientations()
        if (businessType === "beach" || businessType === "pool") {
          this.props.navigation.navigate('HomeTabNavigator', {
            screen: 'BeachPool'
          })
        } else {
          this.props.navigation.navigate('HomeTabNavigator', {
            screen: 'RestaurantClub'
          })
          // this.props.navigation.navigate('HomeNavigator', {
          //   screen: 'Reservation1'
          // })
        }
      }
    } catch (e) {
      console.log(e)
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  login = () => {
    this.setState({ loading: true })
    this.api.logInAuth(this.state.name, this.state.password)
      .then((res) => {
        if (res.data.token) {
          this.getElements(res.data.user.business_id);
          this.getInformation(res.data.user.business_id);
          this.getGridData(res.data.user.business_id);
          let data = res.data.user;
          const { dispatch } = this.props;
          dispatch(SaveUserData(data));
          dispatch(SaveTimeLine(
            res.data.timeLineData[0].time,
            res.data.businessYear.closed_days,
            res.data.workingHour,
            res.data.settingData.estimated_time
          ))
          Orientation.lockToLandscape()
          // Orientation.unlockAllOrientations()
          this.setState({ loading: false })
          console.log(res.data.workingHour, "LLLLLLLLLLLLL")
          this.saveData(
            data,
            res.data.token,
            res.data.currency,
            res.data.workingHour,
            res.data.businessData.type,
            res.data.timeLineData,
            res.data.settingData.estimated_time,
            res.data.businessYear.closed_days
          );
          this.saveBusinessType(res.data.businessData.type);
          if (res.data.businessData.type == "beach" || res.data.businessData.type == "pool") {
            this.props.navigation.navigate('HomeTabNavigator', {
              screen: 'BeachPool'
            })
          } else {
            this.props.navigation.navigate('HomeTabNavigator', {
              screen: 'RestaurantClub'
            })
          }
          // this.props.navigation.navigate('BeachPool', { screen: 'BeachPool', params: { currency: res.data.currency } });
          this.setState({ errorStatus: false })
          // this.props.navigation.navigate('HomeTabNavigator', { user: res.data.user })
        } else {
          this.setState({ loading: false })
          this.setState({ name: "" })
          this.setState({ password: "" })
          this.setState({ errorStatus: true })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getGridData = (businessId) => {
    this.apigraphql.getDayJson(businessId)
      .then((result) => {
        if (result.data) {
          this.saveGridData(result.data.grid_data)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getInformation = (businessId) => {
    this.apigraphql.getInformationAPI(businessId)
      .then((result) => {
        if (result.data.business_settings.length > 0) {
          this.savePlanData(result.data.business_settings);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getElements = (businessId) => {
    this.apigraphql.getElementByLocation(businessId)
      .then((result) => {
        if (result.data.business_element.length > 0) {
          let widthArr = [];
          let heightArr = [];
          let calculatedWidth;
          let calculatedHeight;
          let tableNumberArr = [];
          result.data.business_element.map((item, index) => {
            widthArr.push(item.position.x)
            heightArr.push(item.position.y)
            tableNumberArr.push({ id: index, number: item.table_number, elementId: item.id })
          })
          result.data.business_element.map((item, index) => {
            let arr = [];
            if (item.element) {
              for (let i = 0; i < item.element.structure.count; i++) {
                arr.push({ id: `${index}_${i}`, activeFlag: false })
              }
              item["seatData"] = arr;
            } else {
              item["seatData"] = arr;
            }
          })
          calculatedWidth = Math.max(...widthArr);
          calculatedHeight = Math.max(...heightArr);
          this.saveElementData(calculatedWidth, calculatedHeight, result.data.business_element, tableNumberArr);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  saveGridData = async (gridData) => {
    try {
      await AsyncStorage.setItem("gridData", JSON.stringify(gridData))
      console.log("save grid data------------------->")
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  savePlanData = async (savePlanData) => {
    try {
      await AsyncStorage.setItem("gridInnformation", JSON.stringify(savePlanData))
      await AsyncStorage.setItem("language", "en")
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  saveBusinessType = async (type) => {
    try {
      await AsyncStorage.setItem("businessType", type)
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  saveData = async (data, token, currency, workingHour, businessType, timeLineData, time_occupied, closedDays) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(data))
      await AsyncStorage.setItem("token", JSON.stringify(token))
      await AsyncStorage.setItem("currency", currency)
      await AsyncStorage.setItem("workingHour", JSON.stringify(workingHour))
      await AsyncStorage.setItem('businessType', businessType)
      await AsyncStorage.setItem('timeLine', JSON.stringify(timeLineData))
      await AsyncStorage.setItem("timeOccupied", `${time_occupied}`)
      await AsyncStorage.setItem("closedDays", JSON.stringify(closedDays))
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  saveElementData = async (maxWidth, maxHeight, elementData, tableNumberData) => {
    try {
      await AsyncStorage.setItem("maxWidth", `${maxWidth}`)
      await AsyncStorage.setItem("maxHeight", `${maxHeight}`)
      await AsyncStorage.setItem("elementData", JSON.stringify(elementData))
      await AsyncStorage.setItem("tableNumberData", JSON.stringify(tableNumberData))
    } catch (e) {
      alert('Failed to save the Element Data to the storage')
    }
  }
  saveLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem("language", lang)
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  changeLanguage = (lang) => {
    if (lang == "en") {
      this.setState({ language: "EN" })
    }
    if (lang == "ro") {
      this.setState({ language: "RO" })
    }
    I18n.locale = lang;
    this.setState({ langMenuStatus: !this.state.langMenuStatus })
    this.saveLanguage(lang)
  }
  render() {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={Background}
          style={[styles.content, { height: Dimensions.get('window').height - this.STATUS_BAR }]}>
          <View
            style={styles.cont}>
            {!this.state.langMenuStatus && (
              <TouchableOpacity style={styles.languageStyle}
                onPress={() => {
                  this.setState({ langMenuStatus: !this.state.langMenuStatus })
                }}
              >
                <Text style={styles.langTextStyle}>{this.state.language}</Text>
              </TouchableOpacity>
            )}
            {this.state.langMenuStatus && (
              <TouchableOpacity style={styles.languageBarStyle}>
                <TouchableOpacity onPress={() => { this.changeLanguage("en") }}>
                  <Text style={[styles.langTextStyle, this.state.language == "EN" && { color: '#CC8C35' }]}>EN</Text>
                </TouchableOpacity>
                <View style={styles.borderBottomStyle}></View>
                <TouchableOpacity onPress={() => { this.changeLanguage("ro") }}>
                  <Text style={[styles.langTextStyle, this.state.language == "RO" && { color: '#CC8C35' }]}>RO</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: 30, textAlign: 'center', marginTop: 130, color: 'white', fontWeight: 'bold' }}>Tabo</Text>
            <Text style={styles.sign_in_text}>{I18n.t("SignIn_Title")}</Text>
            <View style={styles.input_view}>
              <View style={styles.input_item_view}>
                <Image source={UserLogin} />
                <TextInput
                  placeholder={`${I18n.t("name")}`}
                  placeholderTextColor={'#fff'}
                  style={styles.input}
                  onChangeText={(text) => {
                    this.setState({ name: text })
                  }}
                  returnKeyType={'go'}
                  value={this.state.name}
                  autoCapitalize={"none"}
                  onSubmitEditing={(event) => { this.txt1.focus(); }}
                />
              </View>
              <View style={styles.input_item_view}>
                <Image source={PasswordLogin} />
                <TextInput
                  placeholder={`${I18n.t("password")}`}
                  placeholderTextColor={'#fff'}
                  style={styles.input}
                  secureTextEntry={true}
                  onChangeText={(text) => {
                    this.setState({ password: text })
                  }}
                  value={this.state.password}
                  autoCapitalize={"none"}
                  ref={e => this.txt1 = e}
                  onSubmitEditing={(event) => { this.login() }}
                />
              </View>
              {this.state.errorStatus && (
                <Text style={{ color: 'red', textAlign: 'center', marginTop: 5 }}>{I18n.t('password_incorrect')}</Text>
              )}
              <TouchableOpacity style={styles.sign_in_btn} onPress={() => {
                this.login()
              }}>
                {this.state.loading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <Text style={styles.sign_in_btn_text}>{I18n.t("Sign_In")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bottomStyle}>
            <View style={styles.buttonStyle}>
              <View style={styles.newBeachLayout}>
                <Text style={styles.bottomColor}>{I18n.t("new_on_smart_beach")}</Text>
              </View>
              <TouchableOpacity onPress={() => {
                this.props.navigation.navigate("SignUp")
              }}>
                <Text style={styles.signupStyle}>{I18n.t("SIGN_UP")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    );
  }
}

export const Login = connect(({ userReducer, dataReducer }) => ({ userReducer, dataReducer }))(LoginClass);

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
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18
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
