import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import I18n from '../constants/i18n'
export class Landuages extends Component {
  constructor(props) {
    super(props)
    this.state = {
      langParam: 'en'
    }
  }
  UNSAFE_componentWillReceiveProps() {
    this.setState({ langParam: this.props.currentLang })
  }
  changeLanguage = (lang) => {
    this.setState({ langParam: lang })
    this.props.close(lang)
  }
  render() {
    return this.props.isVisible ? (
      <TouchableWithoutFeedback
        onPress={() => {
          this.props.close()
        }}
      >
        <View style={styles.content}>
          <View style={styles.dropContainer}>
            <View style={styles.triagre} />
            <View style={styles.dropItemsContent}>
              <TouchableWithoutFeedback
                onPress={() => {
                  this.changeLanguage("en")
                }}
              >
                <View style={styles.langItem}>
                  <View style={styles.row}>
                    <Image
                      source={require('../assets/img/en.png')}
                      style={styles.langIcon}
                    />
                    <Text style={styles.langText}>
                      {I18n.t('English')}
                    </Text>
                  </View>
                  {this.state.langParam == "en" && (
                    <Image
                      source={require('../assets/img/check.png')}
                      style={styles.checkIcon}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
              <View style={styles.line} />
              <TouchableWithoutFeedback
                onPress={() => {
                  this.changeLanguage("ro")
                }}
              >
                <View style={styles.langItem}>
                  <View style={styles.row}>
                    <Image
                      source={require('../assets/img/ro.png')}
                      style={styles.langIcon}
                    />
                    <Text style={styles.langText}>
                      {I18n.t('Romania')}
                    </Text>
                  </View>
                  {this.state.langParam == "ro" && (
                    <Image
                      source={require('../assets/img/check.png')}
                      style={styles.checkIcon}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    ) : null
  }
}
const styles = StyleSheet.create({
  content: {
    ...StyleSheet.absoluteFillObject
  },
  dropContainer: {
    position: 'absolute',
    top: 170,
    right: 65
  },
  dropItemsContent: {
    width: 114,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  triagre: {
    height: 13,
    width: 13,
    transform: [{
      rotateZ: '45deg'
    }],
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    marginRight: 11,
    marginBottom: -10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,

  },
  langItem: {
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between'
  },
  line: {
    height: 1,
    backgroundColor: 'rgba(193, 193, 193, 0.31)',
    marginHorizontal: 10
  },
  langIcon: {
    height: 14,
    width: 14
  },
  langText: {
    fontFamily: 'Poppins-Light',
    fontSize: 10,
    lineHeight: 12,
    color: '#000',
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkIcon: {
    height: 6.99,
    width: 9
  }
});
