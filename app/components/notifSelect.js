import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Text,
  Dimensions
} from 'react-native';

export class NotifSelect extends Component {

  statuses = [
    'Pending',
    'Paid online',
    'Occupied',
    'Canceled',
    'Released',
    'Expired',
    'Paid',
    'Not paid'
  ]
  statuses1 = [
    'Booked',
    'Pending',
    'Accepted',
    'Rejected',
    'Occupied',
    'Completed',
    'Released',
    'Expired',
    'Canceled',
  ]
  constructor(props) {
    super(props)
    this.state = {

    }
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
            {this.props.status ? (
              <View style={styles.dropItemsContent}>
                {this.statuses1.map((item, i) => (<View key={i}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      this.props.select(i)
                    }}
                  >
                    <View style={styles.langItem}>
                      <Text style={styles.langText}>
                        {item}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <View style={styles.line} />
                </View>))}
              </View>
            ) : (
              <View style={styles.dropItemsContent}>
                {this.statuses.map((item, i) => (<View key={i}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      this.props.select(i)
                    }}
                  >
                    <View style={styles.langItem}>
                      <Text style={styles.langText}>
                        {item}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <View style={styles.line} />
                </View>))}
              </View>
            )}
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
    top: 50,
    left: 102
  },
  dropItemsContent: {
    width: 118,
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
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',

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
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#000',
    marginLeft: 12,
  },
});
