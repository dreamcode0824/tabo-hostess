import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import Close from '../../assets/img/close.png';
import Orientation from 'react-native-orientation'
import QRCodeScanner from 'react-native-qrcode-scanner';
import ApiGraphQl from '../../networking/apiGraphQl';
import API from '../../networking/api';
import I18n from '../../constants/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import { throwServerError } from '@apollo/client';
class QrcodeScanners extends Component {
  api = new API();
  apigraphql = new ApiGraphQl();
  constructor(props) {
    super(props);
    this.state = {
      result: ".",
      deviceWidth: Dimensions.get("window").width,
      deviceHeight: Dimensions.get("window").height,
      reservationData: [],
      currency: "",
      status: false,
      seatName: ['1st', '2nd', '3rd', '4th', '5th'],
      moreVisibleModal: false,
      moreTitle: [],
      moreText: [],
      loadingStatus: false,
      againScanStatus: true,
      businessId: "",
      scanStatus: false,
      foundStatus: true,
      releaseModalVisible: false,
      releaseDatas: [],
      elementData: [],
      tableNumber: ""
    }
  }
  componentDidMount() {
    this.readCurrency();
    this.readBusinessId();
    this.readTable();
    Orientation.lockToLandscape()
    // Orientation.unlockAllOrientations()
    this.setState({ deviceWidth: Dimensions.get("window").width })
    this.setState({ deviceHeight: Dimensions.get("window").height })
  }
  // componentDidUpdate(prevState) {
  //   // Typical usage (don't forget to compare props):
  //   if (this.state.result !== prevState.result) {
  //     this.getReservationData(this.state.result)
  //   }
  // }
  readCurrency = async () => {
    try {
      const userData = await AsyncStorage.getItem('currency')
      if (userData !== null) {
        this.setState({ currency: userData })
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  readBusinessId = async () => {
    try {
      let data = await AsyncStorage.getItem('userData')
      if (data != null) {
        console.log(data, "buisnessId---------------->")
        this.setState({ businessId: JSON.parse(data).business_id })
      }
      return data
    } catch (error) {
      console.log(error);
    }
  }
  readTable = async () => {
    try {
      const tableData = await AsyncStorage.getItem('tableNumberData')
      if (tableData !== null) {
        this.setState({ elementData: JSON.parse(tableData) })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  onSuccess = (e) => {
    (console.log('QR code scanned!', e))
    this.setState({ loadingStatus: true })
    this.setState({ againScanStatus: false })
    this.getReservationData(e.data)
    this.setState({ result: e.data })
  }
  getReservationData = (code) => {
    console.log("getreservation ", code, this.state.businessId)
    this.api.getReservationByCode(code, this.state.businessId)
      .then((result) => {
        if (result.data) {
          if (result.data.data.length > 0) {
            this.setState({ reservationData: result.data.data })
            this.setState({ foundStatus: true })
            if (result.data.data[0].element_id) {
              if (this.state.elementData.length > 0) {
                let filterData = this.state.elementData.filter(ele => ele.elementId == result.data.data[0].element_id);
                if (filterData.length > 0) {
                  this.setState({ tableNumber: filterData[0].number });
                }
              }
              console.log(this.state.elementData, "PPPPPPPPPPPPPP")
            }
          } else {
            this.setState({ reservationData: [] })
            this.setState({ foundStatus: false })
          }
          this.setState({ loadingStatus: false })
        } else {
          this.setState({ reservationData: [] });
          this.setState({ foundStatus: false })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  scanAgain = () => {
    // console.log(this.state.againScanStatus, "--------------->")
    this.setState({ reservationData: [] })
    // this.scanner.reactivate()
    this.setState({ againScanStatus: true })
  }
  moreAction = (title, text) => {
    this.setState({ moreTitle: title })
    this.setState({ moreText: text })
    this.setState({ moreVisibleModal: !this.state.moreVisibleModal })
  }
  openAlert = (id, status) => {
    if (status == "reserved_paid" || status == "paid_online") {
      Alert.alert(
        alert(
          `${I18n.t('Confirm_Arrival')}`,
          `${I18n.t('are_you_sure')}`),
        [
          {
            text: `${I18n.t('Cancel')}`,
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: `${I18n.t('OK')}`, onPress: () => { this.changeStatus(id, "occupied") } }
        ],
        { cancelable: false }
      );

    }
    console.log(id, status)
  }
  changeStatus = (id, status) => {
    this.apigraphql.apiChangeStatusReservation(id, status)
      .then((result) => {
        if (result.data) {
          let data = [...this.state.reservationData];
          data[0]["reservation_status"] = "occupied";
          this.setState({ reservationData: data })
        } else {
          this.setState({ reservationData: [] })
        }
        console.log(result)
      })
      .catch((error) => {
        console.log(error);
      });
  }
  releasePartialAction = (selected_days, id, releasePartialAction, releaseDays) => {
    let arr = [];
    selected_days.map((item, index) => {
      arr.push({ id: index, value: item.day, status: false })
    })
    if (releaseDays.length > 0) {
      releaseDays.map((item, index) => {
        let filterData = arr.filter(ele => ele.value == item.release_day);
        if (filterData.length > 0) {
          let id = filterData[0].id;
          arr[id]["status"] = true;
        }
      })
    }
    this.setState({ releaseDatas: arr })
    this.setState({ releaseModalVisible: !this.state.releaseModalVisible })
  }
  releaseActive = (id, value) => {
    let arr = [...this.state.releaseDatas];
    arr.map((item, index) => {
      if (item.id == id) {
        item.status = !item.status;
      }
    })
    this.setState({ releaseDatas: arr })
  }
  PartialReleaseAction = () => {
    this.setState({ releaseModalVisible: !this.state.releaseModalVisible })
    const filterData = this.state.releaseDatas.filter(ele => ele.status == false)
    if (filterData.length > 0) {
      let days = [];
      this.state.releaseDatas.map((item, index) => {
        if (item.status) {
          days.push({ id: index, day: item.value })
        }
      })
      this.releaseDay(this.state.reservationData[0].id, this.state.reservationData[0].reservation_status, days)
    } else {
      let days = [];
      this.state.releaseDatas.map((item, index) => {
        days.push({ id: index, day: item.value })
      })
      this.releaseDay(this.state.reservationData[0].reservationId, "released", days)
    }
  }
  releaseDay = (id, status, selectedDays) => {
    let arr = [];
    for (let i = 0; i < selectedDays.length; i++) {
      arr.push(`{
        id: ${i}
        release_day:"${selectedDays[i].day}"
      }`)
    }
    this.apigraphql.apiUpdateReleaseDay(id, status, arr)
      .then((result) => {
        console.log(result)
        if (result.data.UpdateRelease) {
          // getAllReservation(businessId)
          if (status == "released") {
            let arr = [...this.state.reservationData];
            console.log(arr, "((((")
            arr[0]['reservation_status'] = "released";
            this.setState({ reservationData: arr })
          }
          console.log(result.data.UpdateRelease, id, status, "--------------->")
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  render() {
    return (
      <View style={{ position: 'relative', width: '100%', height: '100%' }}>
        <View
          style={styles.scrollView}>
          <View style={styles.body}>
            {this.state.againScanStatus ? (
              <View style={styles.sectionContainer}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingTop: 23 }}>
                  <View style={{ width: (this.state.deviceWidth / 2), height: (this.state.deviceWidth / 2) }}>
                    <QRCodeScanner
                      // containerStyle={{ borderColor: 'red', borderWidth: 5 }}
                      containerStyle={{ height: (this.state.deviceWidth / 2), width: (this.state.deviceWidth / 2) }}
                      showMarker={true}
                      markerStyle={{ width: 200, height: 200 }}
                      cameraStyle={{ height: (this.state.deviceWidth / 2), width: (this.state.deviceWidth / 2), backgroundColor: 'white' }}
                      ref={(node) => { this.scanner = node }}
                      reactivate={true}
                      onRead={this.onSuccess}
                      cameraProps={{ ratio: '1:1' }}
                      topViewStyle={{ backgroundColor: '#fff' }}
                      bottomViewStyle={{ backgroundColor: '#fff' }}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: this.state.deviceHeight / 2 - 20 }}>
                <TouchableOpacity style={styles.sign_in_btn}
                  onPress={() => { this.scanAgain() }}
                >
                  <Text style={styles.sign_in_btn_text}>{I18n.t("Scan_again")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.rightbody}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 10 }}>
              <TouchableOpacity onPress={() => {
                this.props.navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomeTabNavigator' }],
                });
              }}>
                <Image source={Close} style={{ tintColor: 'black' }} />
              </TouchableOpacity>
            </View>
            {!this.state.loadingStatus ? (
              <React.Fragment>
                {this.state.reservationData.length > 0 ? (
                  <ScrollView>
                    <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 0 }}>
                      <View style={{ paddingTop: 0 }}>
                        <Text style={[styles.topHeaderText]}>{I18n.t('Reservation_Data')}</Text>
                      </View>
                    </View>
                    <Text style={styles.contentText}>
                      {I18n.t('Status')}:
                          <Text style={[styles.rightText, { fontWeight: 'bold' },
                      this.state.reservationData[0].reservation_status == "reserved_paid" && { color: 'red' },
                      this.state.reservationData[0].reservation_status == "paid_online" && { color: 'red' },
                      this.state.reservationData[0].reservation_status == "reserved_not_paid" && { color: 'purple' },
                      this.state.reservationData[0].reservation_status == "booked" && { color: 'purple' },
                      this.state.reservationData[0].reservation_status == "pending" && { color: 'yellow' },
                      this.state.reservationData[0].reservation_status == "occupied" && { color: 'black' },
                      this.state.reservationData[0].reservation_status == "canceled" && { color: 'grey' },
                      this.state.reservationData[0].reservation_status == "expired" && { color: 'grey' },
                      this.state.reservationData[0].reservation_status == "released" && { color: 'grey' },
                      ]}>{"   "}
                        {this.state.reservationData[0].reservation_status == "reserved_paid" ? "PAID"
                          : this.state.reservationData[0].reservation_status == "paid_online" ? "PAID ONLINE"
                            : this.state.reservationData[0].reservation_status == "reserved_not_paid" ? "NOT PAID"
                              : this.state.reservationData[0].reservation_status == "booked" ? "BOOKED"
                                : this.state.reservationData[0].reservation_status == "pending" ? "PENDING"
                                  : this.state.reservationData[0].reservation_status == "occupied" ? "OCCUPIED"
                                    : this.state.reservationData[0].reservation_status == "canceled" ? "CANCELED"
                                      : this.state.reservationData[0].reservation_status == "expired" ? "EXPIRED"
                                        : this.state.reservationData[0].reservation_status == "released" ? "RELEASED"
                                          : ""
                        }
                      </Text>
                    </Text>
                    <Text style={styles.contentText}>{I18n.t('Reservation_No')}:<Text style={styles.rightText}>{"   "}{this.state.reservationData[0].id}</Text></Text>
                    <Text style={styles.contentText}>{I18n.t('Name')}:<Text style={styles.rightText}>{"   "}{this.state.reservationData[0].name}</Text></Text>
                    <Text style={styles.contentText}>{I18n.t('Phone_No')}:<Text style={styles.rightText}>{"   "}{this.state.reservationData[0].phone_number}</Text></Text>
                    {this.state.reservationData[0].element_id && (
                      <Text style={styles.contentText}>{I18n.t('Table_Number')}:<Text style={styles.rightText}>{"   "}{this.state.tableNumber}</Text></Text>
                    )}
                    {this.state.reservationData[0].arrive_time && (
                      <Text style={styles.contentText}>{I18n.t('Arrive_time')}:<Text style={styles.rightText}>{"   "}{this.state.reservationData[0].arrive_time}</Text></Text>
                    )}
                    {this.state.reservationData[0].number_persons && (
                      <Text style={styles.contentText}>{I18n.t('number_of_persons')}:<Text style={styles.rightText}>{"   "}{this.state.reservationData[0].number_persons}</Text></Text>
                    )}
                    {this.state.reservationData[0].seat_position && (
                      <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text style={[styles.contentText]}>{I18n.t('Position')}:
                          {this.state.reservationData[0].seat_position.map((data, i) => {
                          return (
                            <React.Fragment key={i}>
                              {i < 3 && (
                                <React.Fragment>{data.seat_id.split('_')[0]}({this.state.seatName[Number(data.seat_id.split('_')[1])]}),</React.Fragment>
                              )}
                            </React.Fragment>
                          )
                        })}
                        </Text>
                        {this.state.reservationData[0].seat_position.length > 4 && (
                          <TouchableOpacity
                            style={{ borderColor: '#D9D9D9', borderWidth: 1, borderRadius: 2, width: 38, height: 22, marginTop: 10 }}
                            onPress={() => {
                              this.moreAction("Position", this.state.reservationData[0].seat_position)
                            }}
                          >
                            <Text style={{ fontSize: 10, color: 'black', textAlign: 'center', paddingTop: 3 }}>{I18n.t("More")}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    {this.state.reservationData[0].released_days && (
                      <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text style={[styles.contentText]}>{I18n.t('Release_day')}:
                          {this.state.reservationData[0].released_days.map((data, i) => {
                          return (
                            <React.Fragment key={i}>
                              {i < 3 && (
                                <React.Fragment>{data.release_day.split('-')[2]}.{data.release_day.split('-')[1]},{" "}</React.Fragment>
                              )}
                            </React.Fragment>
                          )
                        })}
                        </Text>
                        {this.state.reservationData[0].released_days.length > 4 && (
                          <TouchableOpacity
                            style={{ borderColor: '#D9D9D9', borderWidth: 1, borderRadius: 2, width: 38, height: 22, marginTop: 10 }}
                            onPress={() => {
                              this.moreAction("Release Days", this.state.reservationData[0].released_days)
                            }}
                          >
                            <Text style={{ fontSize: 10, color: 'black', textAlign: 'center', paddingTop: 3 }}>{I18n.t("More")}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    {this.state.reservationData[0].selected_days && (
                      <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text style={[styles.contentText]}>{I18n.t('Period')}:
                          {this.state.reservationData[0].selected_days.map((data, i) => {
                          return (
                            <React.Fragment key={i}>
                              {i < 3 && (
                                <React.Fragment>{data.day.split('-')[2]}.{data.day.split('-')[1]},{" "}</React.Fragment>
                              )}
                            </React.Fragment>
                          )
                        })}
                        </Text>
                        {this.state.reservationData[0].selected_days.length > 4 && (
                          <TouchableOpacity
                            style={{ borderColor: '#D9D9D9', borderWidth: 1, borderRadius: 2, width: 38, height: 22, marginTop: 10 }}
                            onPress={() => {
                              this.moreAction("Period", this.state.reservationData[0].selected_days)
                            }}
                          >
                            <Text style={{ fontSize: 10, color: 'black', textAlign: 'center', paddingTop: 3 }}>{I18n.t("More")}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    {this.state.reservationData[0].total_price && (
                      <Text style={styles.priceText}>{this.state.reservationData[0].total_price}{this.state.currency}</Text>
                    )}
                    {/* {this.state.reservationData[0].price && (
                      <Text style={styles.priceText}>{`${this.state.reservationData[0].price}.`}{this.state.currency}</Text>
                    )} */}
                    <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 10 }}>
                      {this.state.reservationData[0].reservation_status == "occupied" ? (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={() => { this.releasePartialAction(this.state.reservationData[0].selected_days, this.state.reservationData[0].id, this.state.reservationData[0].reservation_status, this.state.reservationData[0].released_days) }}
                            style={[styles.acceptButton2, { marginHorizontal: 2 }]}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.buttonText2}>
                              {I18n.t('Partial_Release')}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => { this.releaseDay(this.state.reservationData[0].id, "released", this.state.reservationData[0].selected_days) }}
                            style={[styles.acceptButton2, { marginHorizontal: 2 }]}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.buttonText2}>
                              {I18n.t('Release')}
                            </Text>
                          </TouchableOpacity>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          {(this.state.reservationData[0].reservation_status == "released" ||
                            this.state.reservationData[0].reservation_status == "canceled" ||
                            this.state.reservationData[0].reservation_status == "completed" ||
                            this.state.reservationData[0].reservation_status == "expired") ? (
                            <View></View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => { this.openAlert(this.state.reservationData[0].id, this.state.reservationData[0].reservation_status) }}
                              style={[styles.acceptButton2, { marginHorizontal: 2 }]}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.buttonText2}>
                                {I18n.t('Confirm_Arrival')}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </React.Fragment>
                      )}
                    </View>
                  </ScrollView>
                ) : (
                  <React.Fragment>
                    {this.state.foundStatus ? (
                      <View style={{ marginTop: this.state.deviceHeight / 2 - 40 }}>
                      </View>
                    ) : (
                      <View style={{ marginTop: this.state.deviceHeight / 2 - 40 }}>
                        <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>{I18n.t('Reservation_Not_found')}</Text>
                      </View>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            ) : (
              <View style={{ marginTop: this.state.deviceHeight / 2 - 20 }}>
                <ActivityIndicator size="large" color="#CC8C35" />
              </View>
            )}
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.moreVisibleModal}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.close_button_style}
                onPress={() => {
                  this.setState({ moreVisibleModal: !this.state.moreVisibleModal })
                }}
              >
                <Image source={Close} />
              </TouchableOpacity>
              <View>
                <Text style={styles.modalText_Title}>{this.state.moreTitle}</Text>
              </View>
              <View>
                {this.state.moreTitle == "Position" && (
                  <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10, color: 'black' }}>
                    {this.state.moreText.map((data, i) => {
                      console.log(this.state.moreText, "---------->position")
                      return (
                        <React.Fragment key={i}>
                          <React.Fragment>{data.seat_id.split('_')[0]}({this.state.seatName[Number(data.seat_id.split('_')[1])]}),{" "}</React.Fragment>
                        </React.Fragment>
                      )
                    })}
                  </Text>
                )}
                {this.state.moreTitle == "Period" && (
                  <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10, color: 'black' }}>
                    {this.state.moreText.map((data, i) => {
                      return (
                        <React.Fragment key={i}>
                          <React.Fragment>{data.day.split('-')[2]}.{data.day.split('-')[1]},{" "}</React.Fragment>
                        </React.Fragment>
                      )
                    })}
                  </Text>
                )}
                {this.state.moreTitle == "Release Days" && (
                  <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10, color: 'black' }}>
                    {this.state.moreText.map((data, i) => {
                      return (
                        <React.Fragment key={i}>
                          <React.Fragment>{data.release_day.split('-')[2]}.{data.release_day.split('-')[1]},{" "}</React.Fragment>
                        </React.Fragment>
                      )
                    })}
                  </Text>
                )}
              </View>

              <View style={styles.border_bottom}></View>
              <TouchableOpacity
                style={styles.discount_modal_done}
                onPress={() => {
                  this.setState({ moreVisibleModal: !this.state.moreVisibleModal })
                }}
              >
                <Text style={styles.textStyle}>{I18n.t('Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.releaseModalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.close_button_style}
                onPress={() => {
                  this.setState({ releaseModalVisible: !this.state.releaseModalVisible })
                }}
              >
                <Image source={Close} />
              </TouchableOpacity>
              <View>
                <Text style={styles.modalText_Title}>{I18n.t('Reservation_days')}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10, textAlign: 'center' }}>
                  {I18n.t('Release_detail')}
                </Text>
              </View>
              <View style={[styles.discount_layout, { marginTop: 10 }]}>
                {this.state.releaseDatas.length > 0 && this.state.releaseDatas.map((item, index) => {
                  return (
                    <TouchableOpacity
                      style={[styles.discount_button, item.status && { backgroundColor: '#CC8C35' }]}
                      key={index}
                      onPress={() => {
                        this.releaseActive(item.id, item.value)
                      }}
                    >
                      <Text style={[styles.discount_button_text, item.status && { color: '#fff' }]}>{item.value.split('-')[2]}.{item.value.split('-')[1]}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              <View style={styles.border_bottom}></View>
              <TouchableOpacity
                style={styles.discount_modal_done}
                onPress={() => {
                  this.PartialReleaseAction()
                }}
              >
                <Text style={styles.textStyle}>{I18n.t('Release')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalText_Title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  textStyle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CC8C35'
  },
  border_bottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    width: '95%',
    paddingTop: 20,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
    flexDirection: 'row',
    display: 'flex',
    height: '100%',
    justifyContent: 'space-between'
  },
  body: {
    // backgroundColor: Colors.lighter,
    backgroundColor: 'black',
    width: '50%',
    height: '100%'
  },
  rightbody: {
    width: '50%',
    height: '100%',
    paddingHorizontal: 20
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  sign_in_btn: {
    height: 44,
    backgroundColor: '#CC8C35',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 25,
    marginHorizontal: 40
  },
  sign_in_btn_text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff'
  },
  close_button_style: {
    position: 'absolute',
    right: 20,
    top: 8
  },
  close_img_style: {
    width: 12,
    height: 12,
    margin: 10,
  },
  topHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  contentText: {
    fontSize: 13,
    paddingTop: 13,
  },
  rightText: {
    paddingLeft: 20
  },
  acceptButton1: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton2: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText2: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    lineHeight: 11,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: 'black',
    fontWeight: 'bold'
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 18,
    // paddingTop: 60,
    paddingTop: 30,
    textAlign: 'center'
  },
  modalView: {
    position: 'relative',
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 284,
    // height: 250
  },
  discount_layout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  discount_button: {
    width: 44,
    height: 24,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#D9D9D9',
    margin: 3
  },
  discount_button_text: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    paddingTop: 2
  },
  discount_modal_done: {
    marginTop: 11
  },
});

export { QrcodeScanners };
