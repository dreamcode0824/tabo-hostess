import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Image,
  Modal,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ApiGraphQl from '../../networking/apiGraphQl';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import API from '../../networking/api';
import I18n from '../../constants/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Close } from '../../assets/img/left.png'
import { useDispatch, useSelector } from "react-redux";
const Table1 = (props) => {
  const apigraphql = new ApiGraphQl();
  const api = new API();
  const dataInfo = useSelector(({ dataReducer }) => dataReducer);
  const [workingHourData, setWorkingHourData] = useState([]);
  const [daylist, setDayList] = useState(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
  const [currentDay, setCurrentDay] = useState("");
  const [timeArrs, setTimeArrs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState("");
  const [windowHeight, setWindowHeight] = useState("");
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [elementData, setElementData] = useState([]);
  const [maxW, setMaxW] = useState(0);
  const [maxH, setMaxH] = useState(0);
  const [zoomRateW, setZoomRateW] = useState(0);
  const [zoomRateH, setZoomRateH] = useState(0);
  const [rate, setRate] = useState(0.5);
  const [businessId, setBusinessId] = useState("");
  const [reservationData, setReservationData] = useState([]);
  const [currentDate, setCurrentDate] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [allowChangeStatus, setAllowChangeStatus] = useState(false);
  let todayDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`;
  useEffect(() => {
    console.log("(((((((((((((((((((((")
    let day = new Date();
    let today = new Date().getDay();
    setCurrentDate(`${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`)
    readWorkingData(daylist[today]);
    readBusinessId();
    setWindowWidth(Dimensions.get('window').width)
    setWindowHeight(Dimensions.get('window').height)
    setCurrentDay(daylist[today])
    elementsData();
  }, [])
  useEffect(() => {
    elementReadData()
  }, [windowWidth])
  useEffect(() => {
    if (businessId) {
      getCurrentDayReservation(businessId, todayDate)
    }
  }, [businessId])
  useEffect(() => {
    if (reservationData) {
      getColor(reservationData, currentDate, timeArrs)
    }
  }, [reservationData])
  useEffect(() => {
    if (workingHourData) {
      getTodayDay(workingHourData, currentDay);
    }
  }, [workingHourData])
  const readWorkingData = async () => {
    try {
      const workingHour = await AsyncStorage.getItem('workingHour')
      if (workingHour !== null) {
        setWorkingHourData(JSON.parse(workingHour))
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const readBusinessId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData')
      if (userData !== null) {
        setBusinessId(JSON.parse(userData).business_id)
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const getCurrentDayReservation = (id) => {
    if (dataInfo.setPositionStatus) {
      apigraphql.getPositionReservation(dataInfo.setPositionDay)
        .then((result) => {
          if (result.data) {
            if (result.data.reservation_restaurant.length > 0) {
              let result1 = result.data.reservation_restaurant.filter(ele => ele.element_id === 11187)
              console.log(result1, ";;;;;;;;;;;;;;;;;;;")
              setReservationData(result.data.reservation_restaurant)
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      api.getTodayRestaurantReservation(id)
        .then((result) => {
          if (result.data) {
            // setReservationData(result.data.data)
            if (result.data.data.length > 0) {
              let result = result.data.data.filter(ele => ele.element_id === 11187)
              console.log(result, ";;;;;;;;;;;;;;;;;;;")
              setReservationData(result.data.data)
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  const changePositionReservation = (selectedDay) => {
    apigraphql.getPositionReservation(selectedDay)
      .then((result) => {
        if (result.data) {
          if (result.data.reservation_restaurant.length > 0) {
            setReservationData(result.data.reservation_restaurant)
            positionColor(result.data.reservation_restaurant)
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const positionColor = (reservationData) => {
    let arr = [...elementData];
    let data = [...reservationData]
    console.log(data, "000000000000000000")
    arr.map((item, index) => {
      let filterResult = [];
      // filterResult = reservationData.filter(ele => ele.element_id == item.id);
      for (let i = 0; i < data.length; i++) {
        if (data[i].element_id == item.id) {
          filterResult.push(data[i])
        }
      }
      console.log(item.id, dataInfo.arriveTime, "op", "******************************")
      if (filterResult.length > 0) {
        item["reservation_status"] = filterResult[0].reservation_status;
        item['customer_name'] = filterResult[0].name;
      } else {
        item["reservation_status"] = "free";
        item['customer_name'] = "";
      }
    })
    setElementData(arr)
  }
  const getColor = (totalReservationData, currentDate, timeArrs) => {
    const timeFilter = timeArrs.filter(ele => ele.status == true);
    console.log(timeFilter, "xxxxxxxxxxxxxxxxxxxxxxxxx")
    const filterData = totalReservationData.filter(ele => ele.arrive_time == timeFilter[0].time);
    let arr = [...elementData];
    arr.map((item, index) => {
      let filterResult = [];
      if (filterData.length > 0) {
        filterResult = filterData.filter(ele => ele.element_id == item.id);
      }
      if (filterResult.length > 0) {
        item["reservation_status"] = filterResult[0].reservation_status;
        item['customer_name'] = filterResult[0].name;
      } else {
        item["reservation_status"] = "free";
        item['customer_name'] = "";
      }
    })
    setElementData(arr)
  }
  const elementsData = async () => {
    try {
      const elementData = await AsyncStorage.getItem('elementData');
      if (elementData !== null) {
        let data = JSON.parse(elementData);
        data.map((item, index) => {
          item["reservation_status"] = "free";
          item["customer_name"] = "";
        })
        setElementData(data)
        // if (dataInfo.setPositionDay) {
        //   changePositionReservation(dataInfo.setPositionDay)
        // }
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const elementReadData = async () => {
    try {
      const maxWidth = await AsyncStorage.getItem('maxWidth')
      const maxHeight = await AsyncStorage.getItem('maxHeight')
      if (maxWidth !== null) {
        let maxW = maxWidth * rate + 1160;
        let maxH = maxHeight * rate + 550;
        let zoomRateW = windowWidth / maxW;
        let zoomRateH = windowHeight / maxH;
        setMaxW(maxW);
        setMaxH(maxH);
        setZoomRateW(zoomRateW);
        setZoomRateH(zoomRateW);
        setMaxWidth(Number(maxWidth));
        setMaxHeight(Number(maxHeight))
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const getTodayDay = (workingHour, currentDay) => {
    let data = tableTimeLine(workingHour, currentDay);
    let arr = [];
    let arr1 = [];
    let arr2 = [];
    if (data.start) {
      arr1 = [data.start]
    }
    if (data.end) {
      arr2 = [data.end]
    }
    if (data) {
      let result = repeatTime(data.start, data.end, 15, arr, data.start_break, data.end_break);
      result = [...arr1, ...result, ...arr2];
      if (result.length > 0) {
        let timearr = [];
        result.map((item, index) => {
          if (index == 0) {
            timearr.push({ id: index, time: item, status: true })
          } else {
            timearr.push({ id: index, time: item, status: false })
          }
        })
        getColor(reservationData, currentDate, timearr)
        console.log(timearr[0], "chagneDate--------------------->&&&&&&&&&")
        setTimeArrs(timearr)
      }
    }
  }
  const repeatTime = (from, to, limitTime, arr, break_from, break_to) => {
    let dataArr = arr;
    let output = moment(from, 'hh:mm').format('HH mm');
    let time = moment(output.split(' ')[0] + ':' + output.split(' ')[1], 'HH:mm');
    let updateTime = time.add(limitTime, 'm').format('HH mm');
    let beginningTime = moment(`${updateTime.split(' ')[0]}:${updateTime.split(' ')[1]}`, 'HH:mm');
    let endTime = moment(`${to}`, 'HH:mm');
    let start_BreakTime = moment(`${break_from}`, 'HH:mm');
    let end_BreakTime = moment(`${break_to}`, 'HH:mm');
    if (beginningTime.isBefore(endTime)) {
      if (beginningTime.isBefore(start_BreakTime)) {
        arr.push(`${updateTime.split(' ')[0]}:${updateTime.split(' ')[1]}`)
      } else {
        if (beginningTime.isBefore(end_BreakTime)) {
        } else {
          arr.push(`${updateTime.split(' ')[0]}:${updateTime.split(' ')[1]}`)
        }
      }
      repeatTime(`${updateTime.split(' ')[0]}:${updateTime.split(' ')[1]}`, to, limitTime, arr, break_from, break_to)
      return arr;
    } else {
      return arr;
    }
  }
  const tableTimeLine = (data, currentDay) => {
    let current_start = "";
    let current_end = "";
    let current_start_break = "";
    let current_end_break = "";
    if (currentDay == "monday") {
      current_start = data.mon_start;
      current_end = data.mon_end;
      current_start_break = data.mon_start_break;
      current_end_break = data.mon_end_break;
    }
    if (currentDay == "tuesday") {
      current_start = data.tue_start;
      current_end = data.tue_end;
      current_start_break = data.tue_start_break;
      current_end_break = data.tue_end_break;
    }
    if (currentDay == "thursday") {
      current_start = data.thu_start;
      current_end = data.thu_end;
      current_start_break = data.thu_start_break;
      current_end_break = data.thu_end_break;
    }
    if (currentDay == "wednesday") {
      current_start = data.wed_start;
      current_end = data.wed_end;
      current_start_break = data.wed_start_break;
      current_end_break = data.wed_end_break;
    }
    if (currentDay == "friday") {
      current_start = data.fri_start;
      current_end = data.fri_end;
      current_start_break = data.fri_start_break;
      current_end_break = data.fri_end_break;
    }
    if (currentDay == "saturday") {
      current_start = data.sat_start;
      current_end = data.sat_end;
      current_start_break = data.sat_start_break;
      current_end_break = data.sat_end_break;
    }
    if (currentDay == "sunday") {
      current_start = data.sun_start;
      current_end = data.sun_end;
      current_start_break = data.sun_start_break;
      current_end_break = data.sun_end_break;
    }
    return { "start": current_start, "end": current_end, "start_break": current_start_break, "end_break": current_end_break };
  }
  const getNextDay = (currentDay) => {
    console.log(currentDay, "((((((((((((((((((((")
    var today = new Date();
    var nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    if (currentDay == "tomorrow") {
      setCurrentDate(`${new Date(nextDay).getFullYear()}-${new Date(nextDay).getMonth() + 1 > 9 ? new Date(nextDay).getMonth() + 1 : "0" + (new Date(nextDay).getMonth() + 1)}-${new Date(nextDay).getDate() > 9 ? new Date(nextDay).getDate() : "0" + (new Date(nextDay).getDate())}`)
      getTodayDay(workingHourData, daylist[new Date(nextDay).getDay()])
    }
    if (currentDay == "today") {
      setCurrentDate(`${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`)
      getTodayDay(workingHourData, daylist[new Date().getDay()])
    }
  }
  const timeLineActive = (id) => (event) => {
    let arr = [...timeArrs];
    arr.map((item, index) => {
      if (item.id == id) {
        item.status = true
      } else {
        item.status = false
      }
    })
    setTimeArrs(arr)
    getColor(reservationData, currentDate, arr)
  }
  const selectIndividualDays = (day) => {
    setCurrentDate(day.dateString)
    console.log(day, "************(((((((((((((")
  }
  const openCalendarAction = () => {
    setModalVisible(!modalVisible)
  }
  const doneAction = () => {
    setModalVisible(!modalVisible)
    getTodayDay(workingHourData, daylist[new Date(currentDate).getDay()])
  }

  return (
    <View style={styles.content}>
      <View style={styles.content}>
        <View style={styles.scrollView}>
          <ImageZoom
            imageWidth={Dimensions.get('window').width}
            imageHeight={Dimensions.get('window').height}
            cropWidth={Dimensions.get('window').width}
            cropHeight={Dimensions.get('window').height}
            useNativeDriver={true}
            minScale={1}
            useNativeDriver={true}
            minScale={1}
          >
            {elementData.length > 1 && elementData.map((item, index) => {
              console.log(item.id, item.arrive_time, item.occupied_time, "----------------->")
              let width1 = rate * item.element.width * Math.cos(item.rotate_angle * Math.PI / 180);
              let width2 = rate * item.element.height * Math.sin(item.rotate_angle * Math.PI / 180);
              let height1 = rate * item.element.width * Math.sin(item.rotate_angle * Math.PI / 180);
              let height2 = rate * item.element.height * Math.cos(item.rotate_angle * Math.PI / 180);
              // console.log(item.rotate_angle, Math.round(width1), Math.round(height1), Math.round(width2), Math.round(height2), item.element.width, item.element.height)
              return (
                <View style={styles.seats_layin} key={index}>
                  <TouchableOpacity
                    onPress={() => {
                      props.navigation.navigate('HomeNavigator', { screen: 'Reservation1' })
                    }}
                    style={[
                      { width: item.element ? item.element.width * rate * zoomRateW : 80 * rate * zoomRateW },
                      { height: item.element ? item.element.height * rate * zoomRateH : 102 * rate * zoomRateH },
                      {
                        top: item.position.y
                          ? item.rotate_angle == 0 ? item.position.y * zoomRateH : item.position.y * zoomRateH + (height2) * zoomRateH
                          : 0
                      },
                      {
                        left: item.position.x
                          ? item.rotate_angle == 0 ? item.position.x * zoomRateW : item.position.x * zoomRateW + (width1) * zoomRateW
                          : 0
                      },
                      { borderWidth: RFPercentage(0.3), position: 'absolute' },
                      { borderColor: item.reservation_status == "occupied" ? 'black' : item.reservation_status == "booked" ? 'purple' : item.reservation_status == "pending" ? 'yellow' : 'white' },
                      {
                        transform: [
                          { rotate: `${item.rotate_angle}deg` },
                          // { translateY: item.rotate_angle == 0 ? 0 : item.element ? (height2 - height1) * zoomRateW : 0 },
                          // { translateX: item.rotate_angle == 0 ? 0 : item.element ? (width1 - width2) * zoomRateH : 0 }
                        ]
                      }
                    ]
                    }>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 6 }}>
                      <Text
                        style={{ fontSize: RFPercentage(0.7), textAlign: 'center' }}
                      >{item.customer_name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                      <View style={{ position: 'absolute', bottom: -6, backgroundColor: '#D9CBBF' }}>
                        <Text
                          style={{ fontSize: RFPercentage(1) }}
                        >{item.position.number}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ImageZoom>
        </View>
      </View>
      {dataInfo.setPositionStatus ? (
        <View style={styles.leftContent}>
          <View
            style={{
              marginTop: Dimensions.get('window').width * 0.03
            }}
          >
          </View>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={styles.buttonContainer1}
            activeOpacity={0.8}
          >
            <Image
              style={
                [styles.calendarIcon]
              }
              source={require('../../assets/img/left.png')}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <LeftContent
          nextDay={getNextDay}
          calendarAction={openCalendarAction}
        />
      )}
      {dataInfo.setPositionStatus ? (
        <></>
      ) : (
        <View style={styles.top_bar_layout}>
          <Animated.ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.timeLayout}>
              {timeArrs.map((item, index) => {
                return (
                  <View key={index} style={styles.timeline_layout} >
                    {index % 2 == 0 ? (
                      <View style={{ position: 'relative' }}>
                        <TouchableOpacity style={styles.timeline_button} onPress={timeLineActive(item.id)}>
                          <Text style={[styles.timeline_text, item.status && { color: 'red' }]}>{item.time}</Text>
                        </TouchableOpacity>
                        {item.status && (
                          <View style={styles.topRetangular_text} />
                        )}
                        {item.status && (
                          <View style={styles.bottomRetangular_text} />
                        )}
                      </View>
                    ) : (
                      <View style={{ position: 'relative', paddingHorizontal: 3 }}>
                        <TouchableOpacity style={[styles.dots, item.status && { backgroundColor: 'red' }]} onPress={timeLineActive(item.id)} />
                        {item.status && (
                          <View style={styles.topRetangular} />
                        )}
                        {item.status && (
                          <View style={styles.bottomRetangular} />
                        )}
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          </Animated.ScrollView>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onBackdropPress={() => {
          setModalVisible(!modalVisible)
        }}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
      >
        <ScrollView>
          <View style={[styles.modalView, {
            width: 320, marginLeft: Dimensions.get('window').width / 2 - 160,
          }]}>
            <Calendar
              style={{
                marginTop: 5,
                height: 320
              }}
              theme={{
                arrowColor: '#CC8C35',
              }}
              onDayPress={(day) => { selectIndividualDays(day) }}
              markedDates={{
                [currentDate]: { selected: true, marked: true, selectedColor: '#CC8C35' },
              }}
              markingType={'multi-dot'}
            />
            <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 5 }}>
              <TouchableOpacity
                style={styles.openButton}
                onPress={doneAction}
              >
                <Text style={styles.modal_text_style}>{I18n.t('Done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}
export { Table1 };
const LeftContent = ({ nextDay, calendarAction }) => {
  const [active, setActive] = useState(1);
  useEffect(() => {
    setActive(1)
  }, [])
  const activeAction = (id) => (event) => {
    if (id == 2) {
      nextDay("tomorrow")
    }
    if (id == 1) {
      nextDay("today")
    }
    setActive(id)
  }
  const openCalendar = () => {
    setActive(3)
    calendarAction()
  }
  return (
    <View style={styles.leftContent}>
      <React.Fragment>
        <TouchableOpacity
          onPress={activeAction(1)}
          style={
            [styles.buttonContainer1, active == 1 && { borderRightWidth: 2, borderRightColor: '#CC8C35' }]
          }
          activeOpacity={0.8}
        >
          <Text style={
            [styles.buttonText, active == 1 && { color: '#CC8C35' }]
          }>
            {I18n.t('Today')}
          </Text>
          <Image
            style={
              [styles.calendarIcon, active == 1 && { tintColor: '#CC8C35' }]
            }
            source={require('../../assets/img/calendar1.png')}
          />
        </TouchableOpacity>
      </React.Fragment>
      <TouchableOpacity
        onPress={activeAction(2)}
        style={
          [styles.buttonContainer1, active == 2 && { borderRightWidth: 2, borderRightColor: '#CC8C35' }]
        }
        activeOpacity={0.8}
      >
        <Text style={
          [styles.buttonText, active == 2 && { color: '#CC8C35' }]
        }>
          Tmw
        </Text>
        <Image
          style={
            [styles.calendarIcon, active == 2 && { tintColor: '#CC8C35' }]
          }
          source={require('../../assets/img/calendar2.png')}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={openCalendar}
        style={
          [styles.buttonContainer1, active == 3 && { borderRightWidth: 2, borderRightColor: '#CC8C35' }]
        }
        activeOpacity={0.8}
      >
        <Text style={
          [styles.buttonText, active == 3 && { color: '#CC8C35' }]
        }>
          {I18n.t('Select')}
        </Text>
        <Image
          style={
            [styles.calendarIcon, active == 3 && { tintColor: '#CC8C35' }]
          }
          source={require('../../assets/img/calendar3.png')}
        />
      </TouchableOpacity>
      <View
        style={{
          marginTop: Dimensions.get('window').width * 0.03
        }}
      >
        <Text style={styles.infoText2}>
          {/* 2 */}
        </Text>
        <Text style={styles.infoText1}>
          {/* {I18n.t('Seats')} */}
        </Text>
      </View>
      <View>
        <Text style={styles.infoText2}>
          {/* 17% */}
        </Text>
        <Text style={styles.infoText1}>
          {/* Occ. */}
        </Text>
      </View>
      <TouchableOpacity
        // onPress={() => navigation.navigate('ShowFree')}
        style={styles.buttonContainer1}
        activeOpacity={0.8}
      >
        <Text style={styles.infoText2}>
          {/* {I18n.t('Show')}{'\n'}{I18n.t('Free')} */}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#D9CBC4',
    paddingHorizontal: 20,
  },
  timeLayout: {
    display: 'flex',
    flexDirection: 'row',
    height: 30,
    paddingLeft: 40
  },
  timeline_button: {
    paddingHorizontal: 20,
  },
  timeline_layout: {
    backgroundColor: '#cc8c35',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftContent: {
    zIndex: 5,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: Dimensions.get('window').width * 0.05,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.53,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonContainer1: {
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Light',
    fontSize: 8,
    lineHeight: 10,
    color: '#828282'
  },
  calendarIcon: {
    height: 19,
    width: 19,
    tintColor: '#828282',
    marginTop: 4
  },
  infoText2: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9,
    lineHeight: 11,
    color: '#000',
    textAlign: 'center'
  },
  infoText1: {
    fontFamily: 'Poppins-Light',
    fontSize: 9,
    lineHeight: 12,
    color: '#000',
    textAlign: 'center'
  },
  top_bar_layout: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  dots: {
    width: 6,
    height: 6,
    backgroundColor: "white",
    borderRadius: 5,
  },
  timeline_text: {
    color: 'white',
    fontSize: 12
  },
  topRetangular: {
    position: 'absolute',
    top: -11,
    left: 1,
    borderWidth: 5,
    borderTopColor: 'red',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  bottomRetangular: {
    position: 'absolute',
    bottom: -12,
    left: 1,
    borderWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'red',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  topRetangular_text: {
    position: 'absolute',
    top: -6,
    left: '45%',
    borderWidth: 5,
    borderTopColor: 'red',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  bottomRetangular_text: {
    position: 'absolute',
    bottom: -7,
    left: '45%',
    borderWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'red',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  openButton: {
    width: 44,
    height: 22,
  },
  modalView: {
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modal_text_style: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CC8C35',
    textAlign: 'center'
  },
});