import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import {
  Switch,
  Landuages
} from '../../components'
import AsyncStorage from '@react-native-community/async-storage';
import I18n from '../../constants/i18n';
import Orientation from 'react-native-orientation';
class SettingsClass extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notifActive: false,
      langModal: false,
      language: "English",
    };
  }
  componentDidMount() {
    this.readLanguage()
    Orientation.lockToLandscape()
    // Orientation.unlockAllOrientations()
  }
  UNSAFE_componentWillReceiveProps(navigation) {
    Orientation.lockToLandscape()
    // Orientation.unlockAllOrientations()
  }
  changeLanguage = (lang) => {
    if (lang) {
      if (lang == "en") {
        this.setState({ language: "English" })
      }
      if (lang == "ro") {
        this.setState({ language: "Romania" })
      }
      console.log(lang, "lang---------->")
      I18n.locale = lang;
      this.saveLanguage(lang)
    }
    this.setState({ langModal: false })
  }
  saveLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem("language", lang)
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  readLanguage = async () => {
    try {
      let langParam = await AsyncStorage.getItem("language")
      if (langParam == "en") {
        this.setState({ language: "English" })
      } else {
        this.setState({ language: "Romania" })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  render() {
    return (
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/img/user.png')}
            style={styles.defImage} />
        </View>
        <Text style={styles.name}>
          Rebeca1
        </Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                langModal: true
              })
            }}
            activeOpacity={0.8}
            style={styles.actionItem}
          >
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../assets/img/globe.png')}
                  style={styles.icon}
                />
              </View>
              <Text style={styles.itemTitle}>
                {I18n.t('Language')}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.langText}>
                {this.state.language}
              </Text>
              <Image
                style={[styles.icon, { marginBottom: 5 }]}
                source={require('../../assets/img/dropdown.png')}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.line} />
          <View

            style={styles.actionItem}
          >
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../assets/img/mail.png')}
                  style={styles.icon}
                />
              </View>
              <Text style={styles.itemTitle}>
                {/* {t("Notification sound ON/OFF")} */}
                {I18n.t('Notification_sound_ON_OFF')}
              </Text>
            </View>
            <Switch
              active={this.state.notifActive}
              activeBackgroundColor='#fff'
              inactiveBackgroundColor='#fff'
              activeButtonColor='#fff'
              inactiveButtonColor='#fff'
              activeButtonPressedColor='#fff'
              inactiveButtonPressedColor='#fff'
              buttonRadius={8}
              switchHeight={13}
              switchWidth={24}
              // border={4}
              onActivate={() => {
                this.setState({
                  notifActive: true
                })
              }}
              onDeactivate={() => {
                this.setState({
                  notifActive: false
                })
              }}
            />
          </View>
        </View>
        <Landuages
          isVisible={this.state.langModal}
          close={this.changeLanguage}
          currentLang={this.state.language == "English" ? "en" : "ro"}
        />
      </View>
    );
  }

}

export const Settings = connect()(SettingsClass);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    paddingRight: 40
  },
  imageContainer: {
    height: 61,
    width: 61,
    borderRadius: 30.5,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: 20
  },
  defImage: {
    height: 27,
    width: 27,
    marginTop: 17,
    alignSelf: "center"
  },
  name: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
    fontFamily: 'Poppins-Medium',
    textAlign: "center",
    marginTop: 7
  },
  actionContainer: {
    height: 81,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginHorizontal: 20,
    marginTop: 30
  },
  actionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingLeft: 13,
    paddingRight: 17
  },
  line: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconContainer: {
    height: 22,
    width: 22,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    height: 10,
    width: 10
  },
  itemTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 14,
    color: '#000',
    marginLeft: 19
  },
  langText: {
    fontFamily: 'Poppins-Light',
    fontSize: 12,
    lineHeight: 14,
    color: '#000',
    marginLeft: 19,
    marginRight: 7
  }
});
