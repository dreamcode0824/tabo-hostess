import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Image,
  Modal,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Button,
  CheckBox
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import ApiGraphQl from '../../networking/apiGraphQl';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import API from '../../networking/api';
import I18n from '../../constants/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Timeline from '../../assets/img/grid_timeline.png';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import * as RNLocalize from 'react-native-localize';
import Close from '../../assets/img/close_img.png';
import ModalDropdown from 'react-native-modal-dropdown';
const Table = (props) => {
  const apigraphql = new ApiGraphQl();
  const api = new API();
  const timeLineBarScroll = useRef();
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
  const [zoomRateW, setZoomRateW] = useState(0.34);
  const [zoomRateH, setZoomRateH] = useState(0);
  const [rate, setRate] = useState(0.5);
  const [businessId, setBusinessId] = useState("");
  const [reservationData, setReservationData] = useState([]);
  const [currentDate, setCurrentDate] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [tempDate, setTempDate] = useState("");
  const [rowWidth, setRowWidth] = useState(68)
  const [loading, setLoading] = useState(true)
  ///////////////////////////////////////////
  const [crateModalStatus, setCreateModalStatus] = useState(false);
  const [phoneValue, setPhoneValue] = useState("")
  const [commentValue, setCommentValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [lockStatus, setLockStatus] = useState(false);
  const [personNumbers, setPersonNumbers] = useState([
    { id: 0, number: 2, status: true },
    { id: 1, number: 4, status: false },
    { id: 2, number: 6, status: false },
    { id: 3, number: 8, status: false },
    { id: 4, number: 10, status: false },
    { id: 5, number: 12, status: false },
    { id: 6, number: 15, status: false },
    { id: 7, number: 20, status: false },
  ]);
  const [tableName, setTableName] = useState("");
  const [arriveTime, setArriveTime] = useState("");
  const [timeOccupied, setTimeOccupied] = useState("");
  const [numberPersons, setNumberPersons] = useState(2);
  const [currentElementId, setCurrentElementId] = useState("");
  const [userId, setUserId] = useState("");
  const [selectReservationStatus, setSelectReservationStatus] = useState("");
  const [currentReservationId, setCurrentReservationId] = useState("");
  const [createdBy, setCreatedBy] = useState("user");
  const [changeStatus, setChangeStatus] = useState(false);
  const [rangeStatus, setRangeStatus] = useState(false);
  const [personStatus, setPersonStatus] = useState(false);
  const [customerLateStatus, setCustomerLateStatus] = useState(false);
  const [rageArr, setRangeArr] = useState(
    ['15mins', '30mins', '45mins', '60mins', '75mins', '90mins', '105mins', '130mins', '145mins', '150mins', '165mins', '180mins']
  )
  const [timeArr, setTimeArr] = useState(['0mins', '10mins', '15mins', '20mins', '30mins', '60mins']);
  const [customerLate, setCustomerLate] = useState(0)
  ////////////////////////////
  const getTodayDate = () => {
    return `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`;
  }
  const getTomorrowDate = () => {
    var today = new Date();
    var nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    return `${new Date(nextDay).getFullYear()}-${new Date(nextDay).getMonth() + 1 > 9 ? new Date(nextDay).getMonth() + 1 : "0" + (new Date(nextDay).getMonth() + 1)}-${new Date(nextDay).getDate() > 9 ? new Date(nextDay).getDate() : "0" + (new Date(nextDay).getDate())}`
  }
  useEffect(() => {
    elementsData();
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes();
    // console.log(hours, min, "UUUUUUUUUUU")
    setCurrentTime(`${hours > 9 ? hours : "0" + hours}:${min > 9 ? min : "0" + min}`)
    let day = new Date();
    let today = new Date().getDay();
    setCurrentDate(`${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`)
    readWorkingData(daylist[today]);
    readBusinessId();
    setWindowWidth(Dimensions.get('window').width)
    setWindowHeight(Dimensions.get('window').height)
    setCurrentDay(daylist[today])
    readTimeOccupied()
  }, [])
  // useEffect(() => {
  //   elementsData();
  // }, [])
  useEffect(() => {
    elementReadData()
  }, [windowWidth])
  useEffect(() => {
    let unsubscribe;
    if (businessId) {
      unsubscribe = props.navigation.addListener('focus', () => {
        let date = getTodayDate();
        setCurrentDate(date)
        getCurrentDayReservation(businessId, date);

      })
      let date = getTodayDate();
      getCurrentDayReservation(businessId, date)
    }
    return unsubscribe;
  }, [businessId])
  useEffect(() => {
    if (reservationData) {
      getColor(reservationData, currentDate, timeArrs)
    }
  }, [reservationData])
  useEffect(() => {
    var today = new Date();
    var nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    if (currentStatus) {
      setCurrentDate(`${new Date(nextDay).getFullYear()}-${new Date(nextDay).getMonth() + 1 > 9 ? new Date(nextDay).getMonth() + 1 : "0" + (new Date(nextDay).getMonth() + 1)}-${new Date(nextDay).getDate() > 9 ? new Date(nextDay).getDate() : "0" + (new Date(nextDay).getDate())}`)
      getTodayDay(workingHourData, daylist[new Date(nextDay).getDay()])
    }
    if (!currentStatus) {
      setCurrentDate(`${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`)
      getTodayDay(workingHourData, daylist[new Date().getDay()])
    }
  }, [currentStatus])
  useEffect(() => {
    if (timeArrs.length > 0) {
      getColor(reservationData, currentDate, timeArrs)
    }
  }, [timeArrs.length])
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
  const readTimeOccupied = async () => {
    try {
      const timeOccupied = await AsyncStorage.getItem('timeOccupied')
      if (timeOccupied !== null) {
        setTimeOccupied(timeOccupied)
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
        setUserId(JSON.parse(userData).id)
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const getCurrentDayReservation = (id, date, day) => {
    setLoading(true)
    api.getTodayRestaurantReservation(id, date)
      .then((result) => {
        if (result.data) {
          if (result.data.data.length > 0) {
            setReservationData(result.data.data)
            if (day == "today") {
              setCurrentStatus(false)
            }
            if (day == "tomorrow") {
              setCurrentStatus(true)
            }
          }
        }
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        console.log(error);
      });
  }
  const getColor = (totalReservationData, currentDate, timeArrs) => {
    const timeFilter = timeArrs.filter(ele => ele.status == true);
    if (timeFilter.length > 0) {
      const filterData = totalReservationData.filter(ele => ele.times.some(eles => eles == timeFilter[0].time));
      let arr = [...elementData];
      arr.map((item, index) => {
        let filterResult = [];
        if (filterData.length > 0) {
          filterResult = filterData.filter(ele => ele.element_id == item.id);
        }
        if (filterResult.length > 0) {
          item["reservation_status"] = filterResult[0].reservation_status;
          item["created_by"] = filterResult[0].created_by;
          item['customer_name'] = filterResult[0].name;
          item["reservation_id"] = filterResult[0].id;
          item["persons"] = filterResult[0].number_persons;
        } else {
          item["reservation_status"] = "free";
          item["created_by"] = "user";
          item['customer_name'] = "";
          item["reservation_id"] = "";
          item["persons"] = 2;
        }
      })
      setElementData(arr)
    }
  }
  const elementsData = async () => {
    try {
      const elementData = await AsyncStorage.getItem('elementData');
      if (elementData !== null) {
        let data = JSON.parse(elementData);
        data.map((item, index) => {
          item["reservation_status"] = "free";
          item["customer_name"] = "";
          item["reservation_id"] = "";
          item["created_by"] = "user";
          item["persons"] = 2;
        })
        setElementData(data)
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
        if (zoomRateW) {
          setZoomRateW(zoomRateW);
          setZoomRateH(zoomRateW);
        }
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
        let arr1 = [];
        let activeId = 0;
        if (currentTime.length > 0) {
          result.map((item, index) => {
            let current = moment(`${currentTime}`, 'HH:mm');
            let itemTime = moment(`${item}`, 'HH:mm');
            if (itemTime.isBefore(current)) {
              arr1.push(item)
            }
          })
        }
        result.map((item, index) => {
          if (currentStatus) {
            if (index == 0) {
              timearr.push({ id: index, time: item, status: true })
              setArriveTime(item)
            } else {
              timearr.push({ id: index, time: item, status: false })
            }
          }
          if (!currentStatus) {
            if (item == arr1[arr1.length - 1]) {
              activeId = index;
              timearr.push({ id: index, time: item, status: true })
              setArriveTime(item)
            } else {
              timearr.push({ id: index, time: item, status: false })
            }
          }
        })
        getColor(reservationData, currentDate, timearr)
        setTimeArrs(timearr)
        if (activeId > 16) {
          let id = Math.floor(activeId / 2)
          timeLineBarScroll.current?.scrollTo({ x: id * rowWidth, y: 0, animated: true });
        }
      }
    }
  }
  const repeatTime = (from, to, limitTime, arr, break_from, break_to) => {
    let dataArr = [];
    dataArr = arr;
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
  const getNextDay = () => {
    setReservationData([])
    let date = getTomorrowDate();
    setCurrentDate(date)
    timeLineBarScroll.current?.scrollTo({ x: 0, y: 0, animated: true });
    getCurrentDayReservation(businessId, date, "tomorrow")
    // setCurrentStatus(true)
  }
  const timeLineActive = (id) => (event) => {
    let arr = [...timeArrs];
    arr.map((item, index) => {
      if (item.id == id) {
        item.status = true
        setArriveTime(item.time)
      } else {
        item.status = false
      }
    })
    setTimeArrs(arr)
    getColor(reservationData, currentDate, arr)
  }
  const selectIndividualDays = (day) => {
    setTempDate(day.dateString)
  }
  const openCalendarAction = () => {
    setTempDate(currentDate)
    setModalVisible(!modalVisible)
  }
  const doneAction = () => {
    // setCurrentStatus(true)
    setCurrentDate(tempDate)
    timeLineBarScroll.current?.scrollTo({ x: 0, y: 0, animated: true });
    getCurrentDayReservation(businessId, tempDate, "tomorrow")
    getTodayDay(workingHourData, daylist[new Date(tempDate).getDay()])
    setModalVisible(!modalVisible)
  }
  const todayActionDay = () => {
    let date = getTodayDate();
    setCurrentDate(date)
    getCurrentDayReservation(businessId, date, "today")
    // setCurrentStatus(false)
  }
  //////////////////////
  const handleChange = (name) => (value) => {
    let status = getStausCheck(reservationData, name, value);
    console.log(status)
    setChangeStatus(status)
    if (name === "phoneValue") {
      setPhoneValue(value)
    }
    if (name === "commentValue") {
      setCommentValue(value)
    }
    if (name === "nameValue") {
      setNameValue(value)
    }
  }
  const getStausCheck = (reservationData, name, value) => {
    let filterData = reservationData.filter(ele => ele.id == currentReservationId);
    let status = false;
    if (name === "phoneValue") {
      if (filterData.length > 0 && filterData[0].phone_number == value) {
        status = false;
      } else {
        return true;
      }
    }
    if (name === "commentValue") {
      if (filterData.length > 0 && filterData[0].comment == value) {
        status = false;
      } else {
        return true;
      }
    }
    if (name === "nameValue") {
      if (filterData.length > 0 && filterData[0].name == value) {
        status = false;
      } else {
        return true;
      }
    }
    return false
  }
  const personSelectAction = (id) => (event) => {
    let filterData = reservationData.filter(ele => ele.id === currentReservationId);
    if (filterData.length > 0) {
      let arr = [...personNumbers];
      arr.map((item, index) => {
        if (item.id == id) {
          if (item.number == filterData[0].number_persons) {
            setPersonStatus(false)
          } else {
            setPersonStatus(true)
          }
          setNumberPersons(item.number)
          item.status = true;
        } else {
          item.status = false;
        }
      })
      setPersonNumbers(arr)
    } else {
      let arr = [...personNumbers];
      arr.map((item, index) => {
        if (item.id == id) {
          setNumberPersons(item.number)
          item.status = true;
        } else {
          item.status = false;
        }
      })
      setPersonNumbers(arr)
    }
  }
  const createReservation = (currentReservationStatus) => (event) => {
    if (nameValue.length > 0) {
      apigraphql.createReservationApi(
        phoneValue,
        nameValue,
        commentValue,
        currentDate,
        currentReservationStatus,
        userId,
        arriveTime,
        timeOccupied,
        numberPersons,
        currentElementId,
        businessId
      )
        .then((result) => {
          if (result.data) {
            setCreateModalStatus(!crateModalStatus)
            let date = getTodayDate();
            getCurrentDayReservation(businessId, date)
            setNameValue("");
            setPhoneValue("");
            setCommentValue("");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert(`${I18n.t('Name_must_be_exist')}`)
    }
  }
  const changeViewResrvationStatus = (status) => (event) => {
    setCreateModalStatus(!crateModalStatus)
    changeReservationStatus(currentReservationId, status);
  }
  const changeReservationStatus = (id, status) => {
    apigraphql.changeReservation(id, status)
      .then((result) => {
        if (result.data) {
          setCreateModalStatus(!crateModalStatus)
          let date = getTodayDate();
          getCurrentDayReservation(businessId, date)
          setNameValue("");
          setPhoneValue("");
          setCommentValue("");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const updateReservationStatus = () => (event) => {
    setCreateModalStatus(!crateModalStatus)
    let arr = [...personNumbers];
    let number = 0;
    arr.map((item) => {
      if (item.status) {
        number = item.number
      }
    })
    apigraphql.updateRestaurantReservation(
      currentReservationId,
      phoneValue,
      nameValue,
      commentValue,
      number,
      customerLate
    )
      .then((result) => {
        if (result.data) {
          let date = getTodayDate();
          getCurrentDayReservation(businessId, date)
          setChangeStatus(false)
          setRangeStatus(false)
          setPersonStatus(false)
          setCustomerLateStatus(false)
          setCustomerLate(0)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const handleRange = (e) => {
    let mins = rageArr[e];
    setTimeOccupied(mins.split('m')[0] * 1)
    let filterData = reservationData.filter(ele => ele.id == currentReservationId);
    if (filterData.length > 0) {
      if (mins.split('m')[0] * 1 == filterData[0].time_occupied) {
        setRangeStatus(false);
      } else {
        setRangeStatus(true);
      }
    }
  }
  const handleCustomerLate = (e) => {
    let mins = timeArr[e];
    console.log(mins.split('m')[0])
    setCustomerLate(mins.split('m')[0] * 1)
    let filterData = reservationData.filter(ele => ele.id == currentReservationId);
    if (filterData.length > 0) {
      if (mins.split('m')[0] * 1 == filterData[0].time_occupied) {
        setCustomerLateStatus(false);
      } else {
        setCustomerLateStatus(true);
      }
    }
  }
  const checkCreateStatus = () => {
    let currentHour = new Date().getHours();
    let currentMinute = new Date().getMinutes();
    let currentTotalMins = currentHour * 60 + currentMinute * 1;
    let selectedTotalMins = 0;
    let todayDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`;
    if (timeArrs.length > 0) {
      timeArrs.map((item, index) => {
        if (item.status) {
          selectedTotalMins = item.time.split(':')[0] * 60 + item.time.split(':')[1] * 1;
        }
      })
    }
    if (todayDate == currentDate) {
      if (currentTotalMins > selectedTotalMins) {
        alert("Alert out range")
      } else {
        setCreateModalStatus(!crateModalStatus)
      }
    } else {
      setCreateModalStatus(!crateModalStatus)
    }
  }
  ///////////////////////////////
  return (
    <View style={styles.content}>
      {loading &&
        <View style={styles.loadingWrap}>
          <ActivityIndicator color='#CC8C35' size='large' />
        </View>
      }
      <View style={styles.content}>
        <View style={styles.scrollView}>
          <ImageZoom
            imageWidth={Dimensions.get('window').width}
            imageHeight={Dimensions.get('window').height}
            cropWidth={Dimensions.get('window').width}
            cropHeight={Dimensions.get('window').height}
            useNativeDriver={true}
            minScale={1}
            panToMove={true}
            onClick={(e) => {
              let defaultWidth = e.pageX * e.currentZoom;
              let defaultHeight = e.pageY * e.currentZoom;
              console.log(defaultWidth, defaultHeight, "--------------<>")
            }}
            onDragLeft={(e) => {
              console.log(e)
            }}
            onMove={(e) => {
              console.log(e, "------------>move")
            }}
          >
            {elementData.length > 0 && elementData.map((item, index) => {
              let filterData = [];
              if (reservationData.length > 0) {
                filterData = reservationData.filter(ele => ele.id == item.reservation_id);
              }
              // console.log('item width', item.element);
              if (item.rotate_angle !== 0) {
                // console.log(item.position.number, item.rotate_angle, Math.round(width1 * zoomRateW), Math.round(height1 * zoomRateW), Math.round(width2 * zoomRateW), Math.round(height2 * zoomRateW), Math.round(item.element.width * rate * zoomRateW), Math.round(item.element.height * rate * zoomRateW))
              }
              return (
                <View style={styles.seats_layin} key={index}>
                  <TouchableOpacity
                    // disabled={lockStatus}
                    onPress={() => {
                      setSelectReservationStatus(item.reservation_status)
                      setTableName(item.table_number)
                      setCurrentElementId(item.id)
                      setCurrentReservationId(item.reservation_id)
                      if (filterData.length > 0) {
                        setNameValue(filterData[0].name)
                        setPhoneValue(filterData[0].phone_number)
                        setCommentValue(filterData[0].comment);
                        setCreatedBy(filterData[0].created_by);
                        setCustomerLate(filterData[0].customer_lated)
                        setNumberPersons(filterData[0].number_persons)
                        let arr = [...personNumbers];
                        console.log(filterData[0].number_persons)
                        arr.map((item, index) => {
                          if (item.number == Number(filterData[0].number_persons)) {
                            item.status = true;
                          } else {
                            item.status = false;
                          }
                        })
                        setPersonNumbers(arr)
                        setCreateModalStatus(!crateModalStatus)
                      } else {
                        checkCreateStatus()
                      }
                      // props.navigation.navigate('HomeNavigator', { screen: 'Reservation1' })
                    }}
                    style={[
                      { width: item.element ? item.element.width * rate * zoomRateW : 0 },
                      { height: item.element ? item.element.height * rate * zoomRateW : 0 },
                      {
                        top: item.position.y
                          ? item.rotate_angle === 0 ? item.position.y * zoomRateW : item.position.y * zoomRateW
                          : 0
                      },
                      {
                        left: item.position.x
                          ? item.rotate_angle === 0 ? item.position.x * zoomRateW : item.position.x * zoomRateW
                          : 0
                      },
                      { borderWidth: RFPercentage(0.3), position: 'absolute' },
                      { borderColor: item.reservation_status === "occupied" ? 'black' : item.reservation_status === "booked" ? 'purple' : item.reservation_status === "pending" ? 'yellow' : 'white' },
                      {
                        transform: [
                          { rotate: `${item.rotate_angle}deg` },
                          { translateY: item.rotate_angle === 0 ? 0 : item.element ? 0 : 0 },
                          { translateX: item.rotate_angle === 0 ? 0 : item.element ? 0 : 0 }
                        ]
                      }
                    ]
                    }
                  >
                    <View style={{
                      transform: [
                        { rotate: `${-item.rotate_angle}deg` },
                      ]
                    }}>
                      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 6 }}>
                        <Text
                          style={{ fontSize: RFPercentage(1), textAlign: 'center' }}
                        >{item.customer_name}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                        <View style={
                          { position: 'absolute', top: 15, backgroundColor: '#D9CBBF' }
                        }>
                          <Text
                            style={{ fontSize: RFPercentage(1) }}
                          >{item.position.number}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ImageZoom>
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={crateModalStatus}
        // visible={true}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.startedModalView, { backgroundColor: '#fff', width: '100%', height: '100%' }]}>
            <View style={{ position: 'absolute', top: 10, right: 10 }}>
              <TouchableOpacity onPress={() => {
                setCreateModalStatus(!crateModalStatus)
                setNameValue("")
                setPhoneValue("")
                setCommentValue("")
                setCustomerLate(0)
                setChangeStatus(false)
                setRangeStatus(false)
                setPersonStatus(false)
                setCustomerLateStatus(false)
                let arr = [...personNumbers];
                arr.map((item, index) => {
                  if (item.id == 0) {
                    item.status = true;
                    setNumberPersons(item.number)
                  } else {
                    item.status = false;
                  }
                })
                setPersonNumbers(arr)
                setCreatedBy("user")
              }}>
                <Image source={Close} style={{ tintColor: '#CC8C35' }} />
              </TouchableOpacity>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'space-between' }}>
              <View style={{ width: '50%' }}>
                <TextInput
                  disableFullscreenUI={true}
                  keyboardType={"phone-pad"}
                  style={styles.input}
                  placeholder={`${I18n.t("Phone_Number")}`}
                  editable={createdBy == "user" ? true : false}
                  onChangeText={handleChange("phoneValue")}
                  value={phoneValue}
                />
                <TextInput
                  disableFullscreenUI={true}
                  style={styles.input}
                  editable={createdBy == "user" ? true : false}
                  onChangeText={handleChange("nameValue")}
                  value={nameValue}
                  placeholder={`${I18n.t("Name")}`}

                />
                <TextInput
                  disableFullscreenUI={true}
                  style={styles.input}
                  onChangeText={handleChange("commentValue")}
                  value={commentValue}
                  placeholder={`${I18n.t("Comment")}`}
                />
                <React.Fragment>
                  <Text style={{ paddingTop: 23 }}>{I18n.t('Number_of_persons')}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    <View style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingTop: 10 }}>
                      {personNumbers.map((item, index) => {
                        let status = false;
                        let filterResult = reservationData.filter(ele => ele.id == currentReservationId);
                        if (filterResult.length > 0) {
                          if (item.number == filterResult[0].number_persons) {
                            status = true;
                          }
                        }
                        return (
                          <TouchableOpacity key={index}
                            onPress={personSelectAction(item.id)}
                            style={[
                              {
                                width: 40, height: 40, borderWidth: 1, borderColor: '#D9D9D9', marginHorizontal: 5, borderRadius: 5
                              },
                              item.status && { backgroundColor: "#CC8C35" },
                              status && { backgroundColor: 'grey' },
                            ]}>
                            <Text style={
                              [{ fontSize: 14, color: 'black', textAlign: 'center', paddingTop: 8 },
                              item.status && { color: '#fff' },
                              status && { color: '#fff' }
                              ]
                            }>{item.number}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </ScrollView>
                </React.Fragment>
              </View>
              <View style={{ width: '50%' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 50 }}>
                  <View>
                    <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Table_Number')}:</Text>
                  </View>
                  <View>
                    <Text style={{ textAlign: 'right', paddingVertical: 10, }}>{tableName}</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 50 }}>
                  <View>
                    <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Date')}:</Text>
                  </View>
                  <View>
                    <Text style={{ textAlign: 'right', paddingVertical: 10, }}>{currentDate}</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 50 }}>
                  <View>
                    <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Arrive_time')}:</Text>
                  </View>
                  <View>
                    <Text style={{ textAlign: 'right', paddingVertical: 10, }}>{arriveTime}</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 50 }}>
                  <View>
                    <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Range')}:</Text>
                  </View>
                  <View>
                    <ModalDropdown
                      onSelect={handleRange}
                      textStyle={{ fontSize: 14 }}
                      style={{ fontSize: 14, paddingVertical: 5, marginLeft: 20, marginRight: 0, paddingLeft: 0, paddingRight: 0, backgroundColor: 'lightgrey' }}
                      defaultTextStyle={{ fontSize: 14 }}
                      defaultValue={`${timeOccupied}mins`}
                      options={rageArr}
                      dropdownStyle={{ width: 70, marginLeft: 20, marginRight: -12, marginTop: 5 }}
                      dropdownTextStyle={{ fontSize: 14, textAlign: 'center' }}
                      renderButtonProps
                    />
                  </View>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 50 }}>
                  <View>
                    <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Late')}:</Text>
                  </View>
                  {selectReservationStatus == "booked" ? (
                    <View>
                      <ModalDropdown
                        onSelect={handleCustomerLate}
                        textStyle={{ fontSize: 14 }}
                        style={{ fontSize: 14, paddingVertical: 5, marginLeft: 20, marginRight: 0, paddingLeft: 0, paddingRight: 0, backgroundColor: 'lightgrey' }}
                        defaultTextStyle={{ fontSize: 14 }}
                        defaultValue={`${customerLate}mins`}
                        options={timeArr}
                        dropdownStyle={{ width: 70, marginLeft: 20, marginRight: -12, marginTop: 5 }}
                        dropdownTextStyle={{ fontSize: 14, textAlign: 'center' }}
                        renderButtonProps
                      />
                    </View>
                  ) : (
                    <Text style={{ textAlign: 'right', paddingVertical: 10, }}>{customerLate}mins</Text>
                  )}
                </View>
                {selectReservationStatus === "free" ? (
                  <React.Fragment>
                    <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 23 }}>
                      <TouchableOpacity style={{ backgroundColor: '#B352FF', width: 200, borderRadius: 5 }}
                        onPress={createReservation("booked")}
                      >
                        <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }}>{I18n.t('mark_booked')}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 23 }}>
                      <TouchableOpacity style={{ backgroundColor: '#000000', width: 200, borderRadius: 5 }}
                        onPress={createReservation("occupied")}
                      >
                        <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }}>{I18n.t('mark_occupied')}</Text>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {selectReservationStatus === "booked" ? (
                      <React.Fragment>
                        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 15 }}>
                          <TouchableOpacity style={{ backgroundColor: '#B352FF', width: 200, borderRadius: 5 }} onPress={changeViewResrvationStatus("occupied")}>
                            <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }}>
                              Arrived
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 15 }}>
                          <TouchableOpacity style={{ backgroundColor: '#000000', width: 200, borderRadius: 5 }}
                            onPress={changeViewResrvationStatus("completed")}>
                            <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }} >{I18n.t('Remove')}</Text>
                          </TouchableOpacity>
                        </View>
                        {(changeStatus || rangeStatus || personStatus || customerLateStatus) && (
                          <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 15 }}>
                            <TouchableOpacity style={{ backgroundColor: 'white', width: 200, borderRadius: 5, borderWidth: 1, borderColor: 'black', }}
                              onPress={updateReservationStatus()}
                            >
                              <Text style={{ textAlign: 'center', color: 'black', paddingHorizontal: 10, paddingVertical: 7 }} >{I18n.t('Update')}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 23 }}>
                          <TouchableOpacity style={{ backgroundColor: '#000000', width: 200, borderRadius: 5 }} onPress={changeViewResrvationStatus("completed")}>
                            <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }} >{I18n.t('Completed')}</Text>
                          </TouchableOpacity>
                        </View>
                        {(changeStatus || rangeStatus || personStatus) && (
                          <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 15 }}>
                            <TouchableOpacity style={{ backgroundColor: 'white', width: 200, borderRadius: 5, borderWidth: 1, borderColor: 'black', }}
                              onPress={updateReservationStatus()}
                            >
                              <Text style={{ textAlign: 'center', color: 'black', paddingHorizontal: 10, paddingVertical: 7 }} >{I18n.t('Update')}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <LeftContent
        nextDay={getNextDay}
        toDayActions={todayActionDay}
        calendarAction={openCalendarAction}
        LockAction={setLockStatus}
        selectStatus={lockStatus}
        navigation={props.navigation}
        currentDate={currentDate}
      />
      <View style={styles.top_bar_layout}>
        <Animated.ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ref={timeLineBarScroll}
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
                [tempDate]: { selected: true, marked: true, selectedColor: '#CC8C35' },
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
export { Table };
const LeftContent = ({ nextDay, calendarAction, toDayActions, navigation, selectStatus, currentDate, LockAction }) => {
  const [active, setActive] = useState(1);
  useEffect(() => {
    setActive(1)
  }, [])
  const openCalendar = () => {
    setActive(3)
    calendarAction()
  }
  const tomorrowAction = () => {
    nextDay()
    setActive(2)
  }
  const todayAction = () => {
    toDayActions()
    setActive(1)
  }
  const handleSelectValue = (e) => {
    LockAction(e)
  }
  console.log(currentDate, "------------>")
  return (
    <View style={[styles.leftContent]}>
      <TouchableOpacity
        onPress={todayAction}
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
        {(active == 1 && currentDate.length > 0) && (
          <Text style={styles.leftDate}>{currentDate.split('-')[2]}{"."}{currentDate.split('-')[1]}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={tomorrowAction}
        style={
          [styles.buttonContainer1, active == 2 && { borderRightWidth: 2, borderRightColor: '#CC8C35' }]
        }
        activeOpacity={0.8}
      >
        <Text style={
          [styles.buttonText, active == 2 && { color: '#CC8C35' }]
        }>
          {I18n.t('Tomorrow')}
        </Text>
        <Image
          style={
            [styles.calendarIcon, active == 2 && { tintColor: '#CC8C35' }]
          }
          source={require('../../assets/img/calendar2.png')}
        />
        {(active == 2 && currentDate.length > 0) && (
          <Text style={styles.leftDate}>{currentDate.split('-')[2]}{"."}{currentDate.split('-')[1]}</Text>
        )}
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
        {(active == 3 && currentDate.length > 0) && (
          <Text style={styles.leftDate}>{currentDate.split('-')[2]}{"."}{currentDate.split('-')[1]}</Text>
        )}
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
      {/* <CheckBox
        value={selectStatus}
        onValueChange={handleSelectValue}
        style={{ alignSelf: 'center' }}
      />
      <Text style={{ textAlign: 'center' }}>Lock</Text> */}
      <TouchableOpacity
        onPress={
          () => {
            navigation.navigate('HomeNavigator', { screen: 'Reservation1' })
          }
        }
        style={styles.buttonContainer1}
        activeOpacity={0.8}
      >
        <Image
          style={
            [styles.calendarIcon, active == 4 && { tintColor: '#CC8C35' }]
          }
          source={Timeline}
        />
      </TouchableOpacity>
    </View>)
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
  seats_layin: {
    position: 'relative',
  },
  loadingWrap: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    alignItems: "center",
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(128,128,128,0.4)',
  },
  startedModalView: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    width: '100%',
    marginTop: 10,
    paddingLeft: 10,
    paddingVertical: 4
  },
  leftDate: {
    fontSize: 10,
    textAlign: 'center',
    color: '#CC8C35'
  }
});
