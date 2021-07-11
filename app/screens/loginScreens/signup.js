import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import Background from '../../assets/img/background.png';
import LoginTitle from '../../assets/img/loginTitel.png';
import SearchIcon from '../../assets/img/search_1.png';
import BackButton from '../../assets/img/left.png';
import Orientation from 'react-native-orientation';
import API from '../../networking/api';
import ApiGraphQl from '../../networking/apiGraphQl';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from '../../constants/i18n';
import { useDebounce } from "use-debounce";
const SignUp = (props) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchData, setSearchData] = useState([]);
  const STATUS_BAR = StatusBar.statusBarHeight || 24;
  const api = new API();
  const apigraphql = new ApiGraphQl();
  const [debouncedText] = useDebounce(searchValue, 1000);
  useEffect(() => {
    if (debouncedText.length > 2) {
      searchApiAction(debouncedText)
    } else {
      setSearchData([])
    }
  }, [debouncedText])
  const searchAction = (text) => {
    setSearchValue(text)
  }
  const searchApiAction = (text) => {
    api.searchApi(text)
      .then((result) => {
        if (result.data.data.length > 0) {
          setSearchData(result.data.data)
        }
        else {
          setSearchData([])
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const changeRouter = (id) => (event) => {
    console.log(id)
    const filterData = searchData.filter(ele => ele.id == id);
    if (filterData.length > 0) {
      props.navigation.navigate("ReceptionVerify", { beachData: filterData })
    }
  }
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps={'handled'}
    >
      <ImageBackground
        source={Background}
        style={[styles.content, { height: Dimensions.get('window').height - STATUS_BAR }]}>
        <View
          style={styles.cont}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "position"}
            style={styles.container}
            keyboardShouldPersistTaps={'handled'}
          >
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ fontSize: 30, textAlign: 'center', marginTop: 130, color: 'white', fontWeight: 'bold' }}>Tabo</Text>
            </View>
            <Text style={styles.sign_in_text}>{I18n.t('Receptionist')}</Text>
            <View style={styles.input_view}>
              <View style={styles.input_item_view}>
                <Image source={SearchIcon} style={{ tintColor: '#fff' }} />
                <TextInput
                  placeholder={`${I18n.t("Search_location")}`}
                  placeholderTextColor={'#fff'}
                  style={styles.input}
                  onChangeText={(text) => {
                    searchAction(text)
                  }}
                  value={searchValue}
                />
              </View>
            </View>
            <ScrollView style={{ width: '100%' }} keyboardShouldPersistTaps='always'>
              {searchData.length > 0 && (
                <View style={{ width: '100%', padding: 20 }}>
                  {searchData.length > 0 && searchData.map((item, index) => {
                    return (
                      <TouchableOpacity key={index} style={styles.searchMenu}
                        onPress={changeRouter(item.id)}
                      >
                        <Text style={styles.searchText}>{item.location_name}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
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
    </ScrollView >
  );
}

export { SignUp };

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
  },
  cont: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    alignItems: 'center',
  },
  title_img: {
    marginTop: 150,
  },
  sign_in_text: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center'
  },
  input_view: {
    marginTop: 40,
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
  backButtonStyle: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  searchMenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 3,
    marginVertical: 3,
    width: '100%',
    borderRadius: 10
  },
  searchText: {
    fontSize: 16,
    paddingVertical: 10,
    color: 'white'
  }
});
