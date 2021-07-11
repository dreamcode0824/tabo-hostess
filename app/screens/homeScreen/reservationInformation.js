import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import Close from '../../assets/img/close.png';
import API from '../../networking/api';
import ApiGraphQl from '../../networking/apiGraphQl';
import AsyncStorage from '@react-native-community/async-storage';
import I18n from '../../constants/i18n';
const ReservationInformationClass = ({ navigation, route }) => {
  const api = new API();
  const apigraphql = new ApiGraphQl();
  const [selectedSeatData, setSelectedSeatData] = useState([])
  const [getAllReservationData, setGetAllReservationData] = useState([])
  const [currency, setCurrency] = useState("");
  const [moreVisibleModal, setMoreVisibleModal] = useState(false);
  const [moreTitle, setMoreTitle] = useState("")
  const [moreBody, setMoreBody] = useState([]);
  const [seatName, setSeatName] = useState(["1st", "2nd", "3rd", "4th", "5th"]);
  const [businessId, setBusinessId] = useState("");

  useEffect(() => {
    setSelectedSeatData(route.params.otherParam[0])
    getAllReservation(route.params.otherParam[0].reservation_id, businessId)
    readData();
    checkEndDayHour()
  }, [route.params]);
  const previousPage = () => {
    // console.log("(((((((((((((")
    navigation.goBack();
    // navigation.navigate('Home', { status: true })
  }
  const readData = async () => {
    try {
      const currencyData = await AsyncStorage.getItem('currency')
      if (currencyData !== null) {
        setCurrency(currencyData)
      } else {
        setCurrency("")
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const businessData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData')
      if (userData !== null) {
        setBusinessId(JSON.parse(userData).business_id)

      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const getAllReservation = (ids, businessId) => {
    apigraphql.getAllReservationAPI(ids, businessId)
      .then((result) => {
        if (result.data.reservation_beach.length > 0) {
          const filterData1 = result.data.reservation_beach.filter(ele => ele.reservation_status != "completed")
          const filterData2 = filterData1.filter(ele => ele.reservation_status != "canceled")
          const filterData3 = filterData2.filter(ele => ele.reservation_status != "rejected")
          setGetAllReservationData(filterData3)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const totalPriceCalculate = (element_count, price_values, additional_sunbed, rent_umbrella, selected_days) => {
    let totalPrice = 0;
    if (getAllReservationData[0].protocol_status) {
      totalPrice = 0;
    } else {
      if (price_values.length > 0) {
        price_values.map((item, index) => {
          totalPrice = totalPrice + item.price_values
        })
      }
    }
    console.log(element_count, price_values, additional_sunbed, rent_umbrella, selected_days)
    return totalPrice;
  }
  const goPrice = (id) => (event) => {
    const result = getAllReservationData.filter(ele => ele.id == id)
    if (result.length > 0) {
      navigation.navigate('Price', { status: "reservation_update", data: result[0] })
    }
  }
  const changeReservationStatus = (status, id) => (event) => {
    let getAllReservationDataArr = [...getAllReservationData];
    getAllReservationDataArr.map((item, index) => {
      if (item.id == id) {
        if (item.reservation_status == "paid_online") {
          item.reservation_status = "occupied"
        }
        if (item.reservation_status == "reserved_paid") {
          item.reservation_status = "occupied"
        }
        if (item.reservation_status == "reserved_not_paid") {
          item.reservation_status = "occupied"
        }
        if (item.reservation_status == "pending") {
          item.reservation_status = "paid_online"
        }
      }
    })
    setGetAllReservationData(getAllReservationDataArr)
    if (status == "paid_online") {
      updateReservationStatus("occupied", id)
    }
    if (status == "reserved_paid") {
      updateReservationStatus("occupied", id)
    }
    if (status == "reserved_not_paid") {
      updateReservationStatus("occupied", id)
    }
    if (status == "pending") {
      updateReservationStatus("paid_online", id)
    }
  }
  const updateReservationStatus = (status, id) => {
    apigraphql.updateReservationStatuses(status, id)
      .then((result) => {
        console.log(result.data, "******************")
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const moreAction = (title, text) => {
    setMoreTitle(title)
    setMoreBody(text)
    setMoreVisibleModal(!moreVisibleModal)
  }
  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#fff' }}>
      <View style={styles.closeButton}>
        <TouchableOpacity onPress={previousPage}>
          <Image source={Close} style={styles.closeImg} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {getAllReservationData.length > 0 && getAllReservationData.map((item, index) => {
          console.log(getAllReservationData, "********************")
          let totalPrice = totalPriceCalculate(item.element_count, item.price_values, item.additional_sunbed, item.rent_umbrella, item.selected_days)
          let position_arr = ["1st", "2nd", "3rd", "4th", "5th"]
          let reservationIds = selectedSeatData.reservation_id;
          let seats_arr = [];
          let selected_days_arr = [];
          item.selected_days.map((item, index) => {
            selected_days_arr.push(`${item.day.split('-')[2]}.${item.day.split('-')[1]},${" "}`)
          })
          item.seat_position.map((item, index) => {
            seats_arr.push(item.seat_id)
          });
          let seats_arrs = [];
          seats_arr.map((item, index) => {
            seats_arrs.push(`${item.split('_')[0]}(${position_arr[Number(item.split('_')[1])]}), `)
          })
          let reservationDays = [];
          reservationIds.map(list => {
            if (list == item.id) {
              reservationDays.push(selectedSeatData.selected_days)
            }
          })
          return (
            <View style={styles.reservationLayout} key={index}>
              <View>
                <Text
                  style={[
                    styles.order_style,
                    { fontSize: 12 },
                    { fontWeight: 'bold' },
                    item.reservation_status == "pending" && { color: 'yellow' },
                    item.reservation_status == "reserved_paid" && { color: 'red' },
                    item.reservation_status == "reserved_not_paid" && { color: 'purple' },
                    item.reservation_status == "occupied" && { color: 'black' },
                    item.reservation_status == "paid_online" && { color: 'red' },
                  ]}
                >{I18n.t('Order_No')}: {item.id}</Text>
                <Text
                  style={[
                    { fontSize: 10 },
                    { fontWeight: 'bold' },
                    { color: 'black' }
                  ]}
                >
                  {I18n.t('Status')}:{"   "}{item.reservation_status == "pending" ? "Pending" : item.reservation_status == "reserved_paid" ? "Reserved Paid" : item.reservation_status == "reserved_not_paid" ? "Reserved not paid" : item.reservation_status == "occupied" ? "Occupied" : item.reservation_status == "paid_online" ? "Paid online" : ""}
                </Text>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                  <Text style={styles.created_at}>{I18n.t('Seats')}:
               {item.seat_position.map((data, i) => {
                    return (
                      <React.Fragment key={i}>
                        {i < 8 && (
                          <React.Fragment>{data.seat_id.split('_')[0]}({position_arr[Number(data.seat_id.split('_')[1])]}),</React.Fragment>
                        )}
                      </React.Fragment>
                    )
                  })}
                  </Text>
                  {item.seat_position.length > 9 && (
                    <TouchableOpacity
                      style={{ borderColor: '#fff', borderWidth: 1, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2 }}
                      onPress={() => {
                        moreAction("Position", item.seat_position)
                      }}
                    >
                      <Text style={{ fontSize: 8, color: 'white' }}>{I18n.t('More')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.created_at}>{I18n.t('Created_by')}: Numele teu | +40724011661</Text>
                <Text
                  style={[
                    styles.total_price,
                    { fontSize: 12 },
                    { fontWeight: 'bold' },
                    item.reservation_status == "pending" && { color: 'yellow' },
                    item.reservation_status == "reserved_paid" && { color: 'red' },
                    item.reservation_status == "reserved_not_paid" && { color: 'purple' },
                    item.reservation_status == "occupied" && { color: 'black' },
                    item.reservation_status == "paid_online" && { color: 'red' },
                  ]}
                >{Math.round(totalPrice * 100) / 100} {currency}</Text>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                  <Text style={{ color: 'black', fontSize: 10 }}>{I18n.t('Days_of_reservation')}:
                    {item.selected_days.map((data, i) => {
                    return (
                      <React.Fragment key={i}>
                        {i < 8 && (
                          <React.Fragment>{data.day.split('-')[2]}.{data.day.split('-')[1]},{" "}</React.Fragment>
                        )}
                      </React.Fragment>
                    )
                  })}
                  </Text>
                  {item.selected_days.length > 9 && (
                    <TouchableOpacity
                      style={{ borderColor: '#fff', borderWidth: 1, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2 }}
                      onPress={() => {
                        moreAction("Days of reservation", item.selected_days)
                      }}
                    >
                      <Text style={{ fontSize: 8, color: 'white' }}>{I18n.t('More')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View>
                <TouchableOpacity style={styles.accept_button} onPress={changeReservationStatus(item.reservation_status, item.id)}>
                  <Text style={styles.accept_button_text}>
                    {item.reservation_status == "pending" ?
                      `${I18n.t('Accept')}` : item.reservation_status == "reserved_paid" ?
                        `${I18n.t('Mark_occupied')}` : item.reservation_status == "reserved_not_paid" ?
                          `${I18n.t('Pay')}` : item.reservation_status == "occupied" ?
                            `${I18n.t('Release')}` : item.reservation_status == "paid_online" ?
                              `${I18n.t('Mark_occupied')}` : ""}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reject_button} onPress={goPrice(item.id)}>
                  <Text style={styles.reject_button_text} >
                    {item.reservation_status == "pending" ?
                      `${I18n.t('Reject')}` : item.reservation_status == "reserved_paid" ?
                        `${I18n.t('Go_in')}` : item.reservation_status == "reserved_not_paid" ?
                          `${I18n.t('Go_in')}` : item.reservation_status == "occupied" ?
                            `${I18n.t('Go_in')}` : item.reservation_status == "paid_online" ?
                              `${I18n.t('Go_in')}` : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={moreVisibleModal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.close_button_style}
              onPress={() => {
                setMoreVisibleModal(!moreVisibleModal)
              }}
            >
              <Image source={Close} />
            </TouchableOpacity>
            <View>
              <Text style={styles.modalText_Title}>{moreTitle}</Text>
            </View>
            <View>
              {moreTitle == "Position" && (
                <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10 }}>
                  {moreBody.map((data, i) => {
                    return (
                      <React.Fragment key={i}>
                        <React.Fragment>{data.seat_id.split('_')[0]}({seatName[Number(data.seat_id.split('_')[1])]}),{" "}</React.Fragment>
                      </React.Fragment>
                    )
                  })}
                </Text>
              )}
              {moreTitle == "Days of reservation" && (
                <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10 }}>
                  {moreBody.map((data, i) => {
                    return (
                      <React.Fragment key={i}>
                        <React.Fragment>{data.day.split('-')[2]}.{data.day.split('-')[1]},{" "}</React.Fragment>
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
                setMoreVisibleModal(!moreVisibleModal)
              }}
            >
              <Text style={styles.textStyle}>{I18n.t('Close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View >
  )
}
export const ReservationInformation = connect()(ReservationInformationClass);

const styles = StyleSheet.create({
  reservationLayout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'lightgray',
    marginRight: 80,
    marginLeft: 40,
    marginTop: 7,
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexWrap: 'wrap'

  },
  closeButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginRight: 60,
    marginTop: 16,
  },
  closeImg: {
  },
  order_style: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  created_at: {
    fontSize: 10,
    fontWeight: '300',
    paddingTop: 5,
    color: 'black'
  },
  total_price: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 8
  },
  accept_button: {
    backgroundColor: '#CC8C35',
    borderRadius: 2,
    marginTop: 18
  },
  accept_button_text: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 33
  },
  reject_button: {
    backgroundColor: '#828282',
    borderRadius: 2,
    marginTop: 10
  },
  reject_button_text: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 33,
    textAlign: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  modalText_Title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  modal_text_input: {
    height: 26,
    width: 244,
    backgroundColor: '#E9E9E9',
    borderRadius: 2,
    marginTop: 17,
    marginBottom: 16,
    padding: 0,
    paddingLeft: 10
  },
  close_button_style: {
    position: 'absolute',
    right: 20,
    top: 16
  },
  textStyle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CC8C35'
  },
})