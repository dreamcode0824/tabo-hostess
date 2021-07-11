import React, { useState, useEffect, useRef, Component, Fragment } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Image,
  Modal,
  TouchableHighlight,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  TouchableHighlightBase
} from 'react-native';
import { connect } from 'react-redux';
import { USE_NATIVE_DRIVER } from '../../networking/config';
import { PanGestureHandler, TapGestureHandler, ScrollView, State, TextInput, } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from "react-redux";
import ApiGraphQl from '../../networking/apiGraphQl';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import API from '../../networking/api';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Resize from '../../assets/img/resize_img.png';
import Close from '../../assets/img/close_img.png';
import GridMap from '../../assets/img/grid_map.png';
import Confirm from '../../assets/img/confirm.png';
import { DragResizeBlock } from '../../components/dragComponent/src/DragResizeBlock';
import { ShowBarAction, AllowAlertAction } from '../../store/redux/userAction';
import I18n from '../../constants/i18n';
import ModalDropdown from 'react-native-modal-dropdown';
class Reservation1Class extends Component {
  api = new API();
  apigraphql = new ApiGraphQl();
  constructor(props) {
    super(props);
    this.leftIsScrolling = false;
    this.rightIsScrolling = false;
    this.upIsScrolling = false;
    this.downIsScrolling = false;
    this.state = {
      gridData: [],
      tableArrs: [],
      reservationData: [],
      workingHourData: [],
      elementData: [],
      elementWidth: 60,
      elementHeight: 35,
      modalVisible: false,
      currentColor: "",
      width: 0,
      height: 0,
      currentReservationId: "",
      toScroll: true,
      dragScrollValue: 0,
      currentResizeX: 0,
      startResizeX: 0,
      showBar: false,
      windowHeight: 0,
      windowWidth: 0,
      statusBarHeight: 0,
      originElementX: 0,
      originElementY: 0,
      originWidth: 0,
      scrollX: 0,
      scrollY: 0,
      dragEndElementX: 0,
      dragEndElementY: 0,
      resizeWidth: 0,
      showShadow: false,
      leftSize: 0,
      workingHourStatus: false,
      currentReservationStatus: "booked",
      timeOccupied: "",
      personNumbers: [
        { id: 0, number: 2, status: true },
        { id: 1, number: 4, status: false },
        { id: 2, number: 6, status: false },
        { id: 3, number: 8, status: false },
        { id: 4, number: 10, status: false },
        { id: 5, number: 12, status: false },
        { id: 6, number: 15, status: false },
        { id: 7, number: 20, status: false },
      ],
      phoneValue: "",
      nameValue: "",
      commentValue: "",
      reservationActionStatus: false,
      crateModalStatus: false,
      business_user_id: "",
      arrive_time: "",
      numberPersons: 2,
      currentElementId: "",
      business_id: "",
      freeCellStatus: false,
      allowReservationStatus: false,
      tableName: "",
      focusStatus: false,
      reservationView: false,
      userName: "",
      updateStatus: false,
      createUser: "",
      currentCreatedBy: "user",
      currentCellIndex: "",
      todayDate: "",
      selectedDate: "",
      selectedDay: "",
      currentGridData: [],
      totalTimeLine: [],
      tempDate: "",
      calendarModalVisible: false,
      loadingStatus: true,
      closedDays: [],
      closeDayStatus: true,
      closeDayArr: [],
      breakTime: "",
      lateArr: [0, 10, 15, 20, 30, 60],
      reservationUpdateStatus: false,
      customerLate: 0,
      existCustomerLate: 0,
      changeStatus: false,
    };
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(ShowBarAction(false))
    dispatch(AllowAlertAction(false));
    this.readTable();
    this.readWorkingHour();
    this.getCurrentDayReservation(14, `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`);
    this.readData();
    this.businessData();
    this.readClosedDay();
    this.setState({
      windowHeight: Dimensions.get('window').height,
      windowWidth: Dimensions.get('window').width,
      statusBarHeight: StatusBar.currentHeight,
      updateStatus: false,
      selectedDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`,
      selectedDay: new Date().getDay() - 1,
      todayDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`,
      tempDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`
    })
    this.timer();
    this.gettingBreakTime();
    this.setState({ timeOccupied: this.props.dataReducer.timeOccupied })
  }
  gettingBreakTime = () => {
    let getDay = new Date().getDay();
    let breakTime = "";
    if (getDay == 0) {
      breakTime = this.props.dataReducer.workingHour.sun_start_break;
    }
    if (getDay == 1) {
      breakTime = this.props.dataReducer.workingHour.mon_start_break;
    }
    if (getDay == 2) {
      breakTime = this.props.dataReducer.workingHour.tue_start_break;
    }
    if (getDay == 3) {
      breakTime = this.props.dataReducer.workingHour.wed_start_break;
    }
    if (getDay == 4) {
      breakTime = this.props.dataReducer.workingHour.thu_start_break;
    }
    if (getDay == 5) {
      breakTime = this.props.dataReducer.workingHour.fri_start_break;
    }
    if (getDay == 6) {
      breakTime = this.props.dataReducer.workingHour.sat_start_break;
    }
    this.setState({ breakTime: breakTime })
  }
  timer = (data) => {
    let status = this.checkBreakTime();
    if (data) {
      let today = new Date();
      let currentHour = today.getHours();
      let currentMinute = today.getMinutes();
      var startDate = moment(data[0].time, "HH mm");
      var endDate = moment(`${currentHour > 9 ? 0 + currentHour : currentHour}:${currentMinute > 9 ? 0 + currentMinute : currentMinute}`, "HH mm");
      ////////////////////////////////////
      if (endDate && status.time_end && status.time_start) {
        var beginningTime = moment(endDate, 'HH:mm');
        var endTimes = moment(status.time_end, 'HH:mm');
        var startTimes = moment(status.time_start, 'HH:mm');
        if (beginningTime.isBefore(endTimes)) {
          if (beginningTime.isAfter(startTimes)) {
            var result = startTimes.diff(startDate, 'mm');
            this.setState({ leftSize: (result / 60000) + 15 });
          } else {
            var result = endDate.diff(startDate, 'mm');
            this.setState({ leftSize: result / 60000 });
          }
        } else {
          var result = endDate.diff(startDate, 'mm');
          this.setState({ leftSize: (result / 60000) - (status.duration * 60) + 15 });
        }
      } else {
        var result = endDate.diff(startDate, 'mm');
        this.setState({ leftSize: result / 60000 });
      }
      setTimeout(() => {
        this.timer(this.state.workingHourData);
      }, 10000);
      /////////////////////////////////////////////////////////
    }
  }
  checkBreakTime = () => {
    let getDay = 0;
    if (new Date().getDay() == 0) {
      getDay = 6;
    } else {
      getDay = new Date().getDay() - 1;
    }
    let timeArr = [];
    let status = false;
    timeArr = this.props.dataReducer.timeLine;
    if (timeArr) {
      let timeIntervalArr = [];
      if (timeArr[getDay].time_line.length > 0) {
        for (let i = 0; i < timeArr[getDay].time_line.length; i++) {
          if (i < timeArr[getDay].time_line.length - 1) {
            var startTime = moment(timeArr[getDay].time_line[i].time, "HH:mm");
            var endTime = moment(timeArr[getDay].time_line[i + 1].time, "HH:mm");
            var duration = moment.duration(endTime.diff(startTime)).asHours();
            if (duration != 0.25) {
              return { status: true, time_start: timeArr[getDay].time_line[i].time, time_end: timeArr[getDay].time_line[i + 1].time, duration: duration, index: i };
            }
            timeIntervalArr.push(duration)
          }
        }
      }
      return { status: false, time_start: "", time_end: "", duration: "", index: "" };
    }
  }
  readData = async () => {
    try {
      const userData = await AsyncStorage.getItem('gridData')
      if (userData !== null) {
        this.setState({ gridData: JSON.parse(userData) })
        this.setState({ currentGridData: [JSON.parse(userData)[0].data[this.state.selectedDay]] });
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  businessData = async () => {
    try {
      let data = await AsyncStorage.getItem('userData')
      if (data != null) {
        this.setState({
          business_id: JSON.parse(data).business_id,
          business_user_id: JSON.parse(data).id,
          userName: JSON.parse(data).name
        })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
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
  readClosedDay = async () => {
    try {
      const closedDayArr = await AsyncStorage.getItem('closedDays')
      if (closedDayArr !== null) {
        this.setState({ closedDays: JSON.parse(closedDayArr) })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  readWorkingHour = async () => {
    try {
      const workingHour = await AsyncStorage.getItem('timeLine')
      if (workingHour !== null) {
        this.setState({ workingHourStatus: true })
        this.setState({ workingHourData: JSON.parse(workingHour)[0].time[this.state.selectedDay].time_line });
        this.setState({ totalTimeLine: JSON.parse(workingHour)[0].time })
        this.timer(JSON.parse(workingHour)[0].time[this.state.selectedDay].time_line);
        // this.checkBreakTime(JSON.parse(workingHour)[0].time);
        // this.setState({ currentTimeLine: [JSON.parse(workingHour)[0].time[2].time_line] })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }

  checkCloseStatus = (selectedDay) => {
    let status = false;
    let getDay = 0;
    if (selectedDay) {
      if (new Date(selectedDay).getDay() == 0) {
        getDay = 6;
      } else {
        getDay = new Date(selectedDay).getDay() - 1;
      }
    }
    if (this.props.dataReducer.closeDays.length > 0) {
      this.props.dataReducer.closeDays.map((item, index) => {
        if (item.closed_day.split('T')[0] == selectedDay) {
          status = true;
        }
      })
    }
    if (this.props.dataReducer.timeLine.length > 0) {
      if (this.props.dataReducer.timeLine[getDay].time_line.length > 0) {
      } else {
        status = true;
      }
    }
    return status;
  }
  getCurrentDayReservation = (id, date) => {
    this.setState({ loadingStatus: true });
    let status = this.checkCloseStatus(date);
    this.setState({ closeDayStatus: !status })
    this.api.getTodayRestaurantReservation(id, date)
      .then((result) => {
        if (result.data) {
          if (result.data.data.length > 0) {
            let arr = [...result.data.data];
            for (let i = 0; i < arr.length; i++) {
              arr[i]["status"] = false;
            }
            this.setState({ freeCellStatus: false });
            this.setState({ updateStatus: false })
            this.setState({ reservationData: arr });
            this.setState({ loadingStatus: false })
            // this.colition(arr)
          } else {
            this.setState({ reservationData: [] });
            this.setState({ loadingStatus: false })
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  };
  changeActions = () => {
    this.setState({
      showBar: true,
      showShadow: true,
    });
    let arr = [...this.state.reservationData];
    arr.map((item, index) => {
      if (item.id === this.state.currentReservationId) {
        item.status = true;
      } else {
        item.status = false;
      }
    })
    this.setState({ reservationData: arr });
    this.setState({ reservationActionStatus: false })
    // this.setState({ toScroll: false })
    this.setState({ changeStatus: true });
    this.setState({ modalVisible: !this.state.modalVisible });
  }
  inActiveAction = () => {
    this.setState({ changeStatus: false })
    const { dispatch } = this.props;
    dispatch(AllowAlertAction(false));
    this.setState({ reservationData: [] })
    this.setState({ toScroll: true })
    this.setState({
      showBar: false,
      showShadow: false,
    })
    this.getCurrentDayReservation(this.state.business_id, this.state.selectedDate);
    let arr = [...this.state.currentGridData];
    arr[0].grid_arr.map((item, i) => {
      item.status = false;
    })
    this.setState({ currentGridData: arr });
    this.setState({ freeCellStatus: false });
    this.setState({ timeOccupied: this.props.dataReducer.timeOccupied })
  }
  reservationInactive = () => {
    let arr = [...this.state.reservationData];
    arr.map((item, index) => {
      if (item.id === this.state.currentReservationId) {
        item.status = false;
      }
    })
    this.setState({ reservationData: arr });
  }
  breakTimeAlert = (data) => {
    let dragX = (Math.round((this.state.dragEndElementX) / this.state.elementWidth) * this.state.elementWidth);
    let resizeW = (Math.round((this.state.resizeWidth) / this.state.elementWidth) * this.state.elementWidth) / this.state.elementWidth;
    let status = false;
    let arrive_end_time = moment(this.state.workingHourData[dragX / this.state.elementWidth].time, 'hh:mm').format('HH mm');
    let time = moment(arrive_end_time.split(' ')[0] + ':' + arrive_end_time.split(' ')[1], 'HH:mm');
    let updateTime = time.add(resizeW * 15, 'm').format('HH mm');
    let updateTimeLetter = updateTime.split(' ')[0] + ':' + updateTime.split(' ')[1];
    var startTime = moment(data.time_start, 'HH:mm');
    var endTime = moment(data.time_end, 'HH:mm');
    var reservationEndTime = moment(updateTimeLetter, "HH:mm");
    var breakStartTimeMin = data.time_start.split(':')[0] * 60 + data.time_start.split(':')[1] * 1;
    var breakEndTimeMin = data.time_end.split(':')[0] * 60 + data.time_end.split(':')[1] * 1;
    var reservationStartMin = this.state.workingHourData[dragX / this.state.elementWidth].time.split(':')[0] * 60 + this.state.workingHourData[dragX / this.state.elementWidth].time.split(':')[1] * 1
    var reservationEndMin = updateTime.split(' ')[0] * 60 + updateTime.split(' ')[1] * 1
    console.log(breakStartTimeMin, breakEndTimeMin, reservationStartMin, reservationEndMin, "---------------->arrive time");
    if (reservationStartMin < breakStartTimeMin && reservationEndMin > breakStartTimeMin) {
      status = true;
    }
    // if (reservationEndTime.isAfter(startTime)) {
    //   if (reservationEndTime.isBefore(endTime)) {
    //     status = true;
    //   } else {
    //   }
    // }
    return status;
  }
  confirmReservationAlert = () => {

    let checkResult = this.checkBreakTime();
    let status = this.breakTimeAlert(checkResult);
    let result = this.colitions();
    if (status) {
      alert(`${I18n.t('Break_time')}`)
    } else {
      if (!result) {
        if (this.props.userReducer.alertStatus) {
          let todayDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`;
          if (todayDate == this.state.selectedDate) {
            Alert.alert(
              `${I18n.t('INFO')}`,
              `${I18n.t('ConfirmationAlert1')}\n${I18n.t('ConfirmationAlert2')} `,
              [
                { text: "Close", onPress: () => console.log("OK Pressed") }
              ]
            );
          } else {
            if (this.state.reservationActionStatus) {
              this.setState({ crateModalStatus: true })
            } else {
              let dragX = (Math.round((this.state.dragEndElementX) / this.state.elementWidth) * this.state.elementWidth);
              let resizeW = (Math.round((this.state.resizeWidth) / this.state.elementWidth) * this.state.elementWidth) / this.state.elementWidth;
              let dragY = Math.round((this.state.dragEndElementY) / this.state.elementHeight) * this.state.elementHeight;
              let dragXCount = dragX / this.state.elementWidth;
              let dragYCount = dragY / this.state.elementHeight;
              let data = this.state.reservationData.filter(ele => ele.id == this.state.currentReservationId);
              let elementId = this.state.elementData.filter(ele => ele.elementId == data[0].element_id);
              if (this.state.originElementX == dragX && this.state.originElementY == dragY && this.state.originWidth == resizeW * this.state.elementWidth) {
                const { dispatch } = this.props;
                dispatch(ShowBarAction(false));
                this.setState({ showShadow: false })
                let arr = [...this.state.reservationData];
                arr.map(item => item.status = false);
                this.setState({ reservationData: arr })
              } else {
                Alert.alert(
                  `${I18n.t('Confirm_changings')}`,
                  `${this.state.originElementX == dragX ? "" : `${I18n.t('from_start_hour')} ${data[0].arrive_time}  ${I18n.t('to')} ${this.state.workingHourData[dragXCount].time} \n`}${this.state.originElementY == dragY ? "" : `${I18n.t('from_table')} ${elementId[0].number} ${I18n.t('to_table')} ${this.state.elementData[dragYCount].number} \n`}${this.state.originWidth == resizeW * this.state.elementWidth ? "" : `${I18n.t('time_occupied_from')} ${data[0].time_occupied}${I18n.t('min')}  ${I18n.t('to')} ${resizeW * 15}${I18n.t('min')}`}`,
                  [
                    {
                      text: `${I18n.t('Cancel')}`,
                      onPress: () => console.log("press"),
                      style: "cancel"
                    },
                    { text: "OK", onPress: () => this.confirmReservation() }
                  ]
                );
              }
            }
          }
        } else {
          if (this.state.reservationActionStatus) {
            this.setState({ crateModalStatus: true })
          } else {
            let dragX = (Math.round((this.state.dragEndElementX) / this.state.elementWidth) * this.state.elementWidth);
            let resizeW = (Math.round((this.state.resizeWidth) / this.state.elementWidth) * this.state.elementWidth) / this.state.elementWidth;
            let dragY = Math.round((this.state.dragEndElementY) / this.state.elementHeight) * this.state.elementHeight;
            let dragXCount = dragX / this.state.elementWidth;
            let dragYCount = dragY / this.state.elementHeight;
            let data = this.state.reservationData.filter(ele => ele.id == this.state.currentReservationId);
            let elementId = this.state.elementData.filter(ele => ele.elementId == data[0].element_id);
            if (this.state.originElementX == dragX && this.state.originElementY == dragY && this.state.originWidth == resizeW * this.state.elementWidth) {
              const { dispatch } = this.props;
              dispatch(ShowBarAction(false));
              this.setState({ showShadow: false })
              let arr = [...this.state.reservationData];
              arr.map(item => item.status = false);
              this.setState({ reservationData: arr })
            } else {
              Alert.alert(
                `${I18n.t('Confirm_changings')}`,
                `${this.state.originElementX == dragX ? "" : `${I18n.t('from_start_hour')} ${data[0].arrive_time}  ${I18n.t('to')} ${this.state.workingHourData[dragXCount].time} \n`}${this.state.originElementY == dragY ? "" : `${I18n.t('from_table')} ${elementId[0].number} ${I18n.t('to_table')} ${this.state.elementData[dragYCount].number} \n`}${this.state.originWidth == resizeW * this.state.elementWidth ? "" : `${I18n.t('time_occupied_from')} ${data[0].time_occupied}${I18n.t('min')}  ${I18n.t('to')} ${resizeW * 15}${I18n.t('min')}`}`,
                [
                  {
                    text: `${I18n.t('Cancel')}`,
                    onPress: () => console.log("press"),
                    style: "cancel"
                  },
                  { text: "OK", onPress: () => this.confirmReservation() }
                ]
              );
            }
          }
        }
      } else {
        alert(`${I18n.t('Colitions')}`)
      }
    }
  }
  confirmReservation = () => {
    this.setState({ changeStatus: false })
    let arr = [...this.state.reservationData];
    arr.map(item => item.status = false);
    this.setState({ reservationData: arr })
    const { dispatch } = this.props;
    dispatch(ShowBarAction(false));
    this.setState({ showShadow: false })
    let dragX = (Math.round((this.state.dragEndElementX) / this.state.elementWidth) * this.state.elementWidth) / this.state.elementWidth;
    let dragY = Math.round((this.state.dragEndElementY) / this.state.elementHeight) * this.state.elementHeight / this.state.elementHeight;
    let resizeW = (Math.round((this.state.resizeWidth) / this.state.elementWidth) * this.state.elementWidth) / this.state.elementWidth;
    this.apigraphql.changeRestaurantReservation(this.state.currentReservationId, this.state.workingHourData[dragX].time, (resizeW) * 15, this.state.elementData[dragY].elementId)
      .then((result) => {
        if (result.data) {
          this.setState({ showBar: false });
          this.reservationInactive()
          this.getCurrentDayReservation(this.state.business_id, this.state.selectedDate);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  changeReservationStatus = (id, status) => {
    this.apigraphql.changeReservation(id, status)
      .then((result) => {
        if (result.data) {
          this.getCurrentDayReservation(this.state.business_id, this.state.selectedDate);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  removeConfirmActions = () => {
    Alert.alert(
      `${I18n.t('change_status_canceled')}`,
      `${I18n.t('are_you_sure')}`
      [
      {
        text: `${I18n.t('Cancel')}`,
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      { text: `${I18n.t('OK')}`, onPress: () => this.removeAction() }
      ]
    );
  }
  arriveConfirmActions = () => {
    // Alert.alert(
    //   "Change Status : occupied",
    //   "Are you sure?"
    //   [
    //   {
    //     text: "cancel",
    //     onPress: () => console.log("Cancel Pressed"),
    //     style: "cancel"
    //   },
    //   { text: "ok", onPress: () => this.arriveAction() }
    //   ]
    // );
    this.arriveAction()
  }
  completeConfirmActions = () => {
    Alert.alert(
      `${I18n.t('change_status_completed')}`,
      `${I18n.t('are_you_sure')}`
      [
      {
        text: `${I18n.t('Cancel')}`,
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      { text: `${I18n.t('OK')}`, onPress: () => this.completeAction() }
      ]
    );
  }
  removeAction = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
    this.changeReservationStatus(this.state.currentReservationId, "canceled")

  }
  arriveAction = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
    this.changeReservationStatus(this.state.currentReservationId, "occupied")
  }
  completeAction = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
    this.changeReservationStatus(this.state.currentReservationId, "completed")
  }
  closeModalAction = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
    let arr = [...this.state.reservationData];
    arr.map(item => item.status = false);
    this.setState({ reservationData: arr })
  }
  freeCellActive = (currentIndex) => {
    // this.setState({ toScroll: false });
    let elementIndex = 0;
    let timeIndex = 0;
    this.state.elementData.map((item, index) => {
      if (item.elementId == currentIndex.split('_')[0]) {
        elementIndex = index
      }
    })
    this.state.workingHourData.map((item, index) => {
      if (item.time == currentIndex.split('_')[1]) {
        timeIndex = index;
      }
    })
    this.setState({
      currentElementId: currentIndex.split('_')[0],
      arrive_time: currentIndex.split('_')[1],
      dragEndElementY: elementIndex * this.state.elementHeight,
      dragEndElementX: timeIndex * this.state.elementWidth,
      resizeWidth: (this.state.timeOccupied / 15) * this.state.elementWidth,
      currentReservationId: ""
    })
    const { dispatch } = this.props;
    dispatch(ShowBarAction(true));
    this.setState({ reservationActionStatus: true })
    this.setState({ showBar: true });
    let arr = [...this.state.currentGridData];
    arr[0].grid_arr.map((item, i) => {
      if (currentIndex == item.index) {
        item.status = true;
      } else {
        item.status = false;
      }
    });
    this.setState({ freeCellStatus: true })
    this.setState({ currentGridData: arr });
    ///////////////////////////////
    let createReservationIndex = 0;
    this.state.workingHourData.map((item, index) => {
      if (item.time == currentIndex.split('_')[1]) {
        createReservationIndex = index + 6;
      }
    });
    if (createReservationIndex != 0) {
      if (createReservationIndex * 60 > this.state.leftSize) {
        this.setState({ currentReservationStatus: 'booked' })
      } else {
        this.setState({ currentReservationStatus: 'occupied' })
      }
    }
    if ((timeIndex * this.state.elementWidth) < this.state.leftSize) {
      const { dispatch } = this.props;
      dispatch(AllowAlertAction(true));
    }
  }
  personSelectAction = (id) => {
    let arr = [...this.state.personNumbers];
    arr.map((item, index) => {
      if (item.id == id) {
        this.setState({ numberPersons: item.number })
        item.status = true;
      } else {
        item.status = false;
      }
    })
    this.setState({ personNumbers: arr })
  }
  updateCheck = (name, value) => {
    let status = false;
    let filterData = this.state.reservationData.filter(ele => ele.id == this.state.currentReservationId);
    if (filterData.length > 0) {
      if (name == "phoneValue") {
        if (filterData[0].phoneValue == value) {
          status = true
        } else {
          return false;
        }
      }
      if (name == "nameValue") {
        if (filterData[0].nameValue == value) {
          status = true
        } else {
          return false;
        }
      }
      if (name == "commentValue") {
        if (filterData[0].comment == value) {
          status = true
        } else {
          return false;
        }
      }
    }
    return status;
  }
  handleChange = (name) => (value) => {
    this.setState({
      ...this.state,
      [name]: value
    })
    if (name == "commentValue") {
      if (value == this.state.commentValue) {
        this.setState({ updateStatus: false });
      } else {
        this.setState({ updateStatus: true });
      }
    }
    if (name == "phoneValue") {
      if (value == this.state.phoneValue) {
        this.setState({ updateStatus: false });
      } else {
        this.setState({ updateStatus: true });
      }
    }
    if (name == "nameValue") {
      if (value == this.state.nameValue) {
        this.setState({ updateStatus: false });
      } else {
        this.setState({ updateStatus: true });
      }
    }

  }
  colition = (dragX, dragY, resizeW) => {
    let elementData = [];
    let timeData = [];
    let timeOccupied = 0;
    let arr = [];
    if (this.state.currentReservationId) {
      arr = this.state.reservationData.filter(ele => ele.id != this.state.currentReservationId)
    } else {
      arr = [...this.state.reservationData];
    }
    for (let i = 0; i < arr.length; i++) {
      elementData = this.state.elementData.filter(ele => ele.elementId === arr[i].element_id)
      timeData = this.state.workingHourData.filter(ele => ele.time == arr[i].arrive_time)
      timeOccupied = arr[i].time_occupied / 15;
      if (timeData.length > 0) {
        var rect1 = {
          x: timeData[0].id * this.state.elementWidth,
          y: elementData[0].id * this.state.elementHeight,
          width: timeOccupied * this.state.elementWidth,
          height: this.state.elementHeight
        }
        var rect2 = {
          x: dragX,
          y: dragY,
          width: resizeW,
          height: this.state.elementHeight
        }
        if (rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.y + rect1.height > rect2.y) {
          return true;
        } else {
        }
      }
    }
    return false
    // let dragX = (Math.round((this.state.dragEndElementX) / this.state.elementWidth) * this.state.elementWidth);
    // let dragY = Math.round((this.state.dragEndElementY) / this.state.elementHeight) * this.state.elementHeight;
    // let x0 = x + 60;
    // let y0 = y + 30;
    // let x1 = x0  ;
  }
  colitions = () => {
    let dragX = (Math.round((this.state.dragEndElementX) / this.state.elementWidth) * this.state.elementWidth);
    let dragY = (Math.round((this.state.dragEndElementY) / this.state.elementHeight) * this.state.elementHeight);
    let resizeW = (Math.round((this.state.resizeWidth) / this.state.elementWidth) * this.state.elementWidth);
    return this.colition(dragX, dragY, resizeW);
  }
  createReservation = (status) => {
    this.apigraphql.createReservationApi(
      this.state.phoneValue,
      this.state.nameValue,
      this.state.commentValue,
      this.state.selectedDate,
      status,
      this.state.business_user_id,
      this.state.arrive_time,
      this.state.timeOccupied,
      this.state.numberPersons,
      this.state.currentElementId,
      this.state.business_id
    )
      .then((result) => {
        if (result.data) {
          const { dispatch } = this.props;
          dispatch(ShowBarAction(false));
          this.setState({ timeOccupied: this.props.dataReducer.timeOccupied })
          this.getCurrentDayReservation(this.state.business_id, this.state.selectedDate);
          this.setState({ crateModalStatus: !this.state.crateModalStatus })
          let arr = [...this.state.gridData];
          let personArrs = [...this.state.personNumbers];
          arr[0].data[0].grid_arr.map(item => item.status = false);
          personArrs.map(item => {
            if (item.id === 0) {
              item.status = true;
            } else {
              item.status = false;
            }
          });
          this.setState({ gridData: arr })
          this.setState({ reservationActionStatus: false })
          this.setState({
            personNumbers: personArrs,
            phoneValue: "",
            nameValue: "",
            commentValue: "",
          })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  reservationConfrimActions = () => {
    this.setState({ reservationUpdateStatus: true })
    this.setState({ modalVisible: !this.state.modalVisible });
    const filterResult = this.state.reservationData.filter(ele => ele.id == this.state.currentReservationId);
    if (filterResult.length > 0) {
      let elementId = this.state.elementData.filter(ele => ele.elementId == filterResult[0].element_id);
      let arr = [...this.state.personNumbers];
      arr.map((item, index) => {
        if (item.number == filterResult[0].number_persons) {
          item.status = true;
        } else {
          item.status = false;
        }
      })
      this.setState({
        phoneValue: filterResult[0].phone_number,
        nameValue: filterResult[0].name,
        commentValue: filterResult[0].comment,
        arrive_time: filterResult[0].arrive_time,
        timeOccupied: filterResult[0].time_occupied,
        tableName: elementId[0].number,
        reservationView: true,
        personNumbers: arr
      });
    }
    this.setState({ crateModalStatus: !this.state.crateModalStatus })
  }
  changeViewResrvationStatus = (status) => {
    this.setState({ crateModalStatus: !this.state.crateModalStatus })
    this.changeReservationStatus(this.state.currentReservationId, status);
  }
  updateReservationStatus = () => {
    this.setState({ crateModalStatus: !this.state.crateModalStatus })
    let arr = [...this.state.personNumbers];
    let number = 0;
    arr.map((item, index) => {
      if (item.status) {
        number = item.number
      }
    })
    this.apigraphql.updateRestaurantReservation(
      this.state.currentReservationId,
      this.state.phoneValue,
      this.state.nameValue,
      this.state.commentValue,
      number,
      this.state.customerLate
    )
      .then((result) => {
        if (result.data) {
          this.getCurrentDayReservation(this.state.business_id, this.state.selectedDate);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  todaySelect = () => {
    this.setState({ reservationData: [] })
    this.setState({ tempDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}` })
    this.setState({ workingHourData: this.state.totalTimeLine[new Date().getDay() == 0 ? 6 : new Date().getDay() - 1].time_line });
    this.setState({ currentGridData: [this.state.gridData[0].data[new Date().getDay() == 0 ? 6 : new Date().getDay() - 1]] })
    this.setState({ selectedDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}` })
    this.getCurrentDayReservation(this.state.business_id, `${new Date().getFullYear()}-${new Date().getMonth() + 1 > 9 ? new Date().getMonth() + 1 : "0" + (new Date().getMonth() + 1)}-${new Date().getDate() > 9 ? new Date().getDate() : "0" + (new Date().getDate())}`);
    // this.setState({ currentTimeLine: [this.state.workingHourData[0].time[2].time_line] })
    this.reservationInactive()
    let arr = [...this.state.currentGridData];
    arr[0].grid_arr.map((item, i) => {
      item.status = false;
    })
    this.setState({ currentGridData: arr });
    const { dispatch } = this.props;
    dispatch(ShowBarAction(false))
    dispatch(AllowAlertAction(false));
    this.setState({ freeCellStatus: false })
  }
  tomorrowSelect = () => {
    this.setState({ reservationData: [] });
    var today = new Date();
    var nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    this.setState({ currentGridData: [this.state.gridData[0].data[new Date().getDay()]] })
    this.setState({ workingHourData: this.state.totalTimeLine[new Date().getDay()].time_line });
    this.setState({ tempDate: `${new Date(nextDay).getFullYear()}-${new Date(nextDay).getMonth() + 1 > 9 ? new Date(nextDay).getMonth() + 1 : "0" + (new Date(nextDay).getMonth() + 1)}-${new Date(nextDay).getDate() > 9 ? new Date(nextDay).getDate() : "0" + (new Date(nextDay).getDate())}` });
    this.setState({ selectedDate: `${new Date(nextDay).getFullYear()}-${new Date(nextDay).getMonth() + 1 > 9 ? new Date(nextDay).getMonth() + 1 : "0" + (new Date(nextDay).getMonth() + 1)}-${new Date(nextDay).getDate() > 9 ? new Date(nextDay).getDate() : "0" + (new Date(nextDay).getDate())}` })
    this.getCurrentDayReservation(this.state.business_id, `${new Date(nextDay).getFullYear()}-${new Date(nextDay).getMonth() + 1 > 9 ? new Date(nextDay).getMonth() + 1 : "0" + (new Date(nextDay).getMonth() + 1)}-${new Date(nextDay).getDate() > 9 ? new Date(nextDay).getDate() : "0" + (new Date(nextDay).getDate())}`);
    // this.setState({ currentTimeLine: [this.state.workingHourData[0].time[2].time_line] })
    this.reservationInactive()
    let arr = [...this.state.currentGridData];
    arr[0].grid_arr.map((item, i) => {
      item.status = false;
    })
    this.setState({ currentGridData: arr });
    const { dispatch } = this.props;
    dispatch(ShowBarAction(false))
    dispatch(AllowAlertAction(false));
    this.setState({ freeCellStatus: false })
  }
  selectIndividualDays = (day) => {
    this.setState({ tempDate: day.dateString });
  }
  doneAction = () => {
    this.setState({ reservationData: [] });
    this.setState({ currentGridData: [this.state.gridData[0].data[new Date(this.state.tempDate).getDay() == 0 ? 6 : new Date(this.state.tempDate).getDay() - 1]] })
    this.setState({ workingHourData: this.state.totalTimeLine[new Date(this.state.tempDate).getDay() == 0 ? 6 : new Date(this.state.tempDate).getDay() - 1].time_line });
    this.setState({ calendarModalVisible: !this.state.calendarModalVisible });
    this.setState({ selectedDate: this.state.tempDate })
    this.getCurrentDayReservation(this.state.business_id, this.state.tempDate);
    /////////////////////////
    this.reservationInactive()
    let arr = [...this.state.currentGridData];
    arr[0].grid_arr.map((item, i) => {
      item.status = false;
    })
    this.setState({ currentGridData: arr });
    const { dispatch } = this.props;
    dispatch(ShowBarAction(false))
    dispatch(AllowAlertAction(false));
    this.setState({ freeCellStatus: false })
  }
  calendarOpenAction = () => {
    this.setState({ calendarModalVisible: !this.state.calendarModalVisible });
  }
  handleLate = (e) => {
    if (this.state.existCustomerLate == this.state.lateArr[e]) {
      this.setState({ updateStatus: false });
    } else {
      this.setState({ updateStatus: true });
    }
    this.setState({ customerLate: this.state.lateArr[e] })
  }
  render() {
    console.log(this.state.freeCellStatus, this.state.changeStatus, "create reservation status")
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <React.Fragment>
          {this.state.showBar && (
            <RightContent
              cancelAction={() => {
                this.inActiveAction()
              }}
              confirmReservation={() => {
                this.confirmReservationAlert()
              }}
            />
          )}
          <LeftContent
            navigation={this.props.navigation}
            todayActions={this.todaySelect}
            tomorrowActions={this.tomorrowSelect}
            calendarAction={this.calendarOpenAction}
            selectedDate={this.state.selectedDate}
          />
        </React.Fragment>
        {this.state.closeDayStatus ? (
          <React.Fragment>
            {this.state.loadingStatus && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color='#CC8C35' size='large' />
              </View>
            )}
            <View style={{ position: 'absolute', top: this.state.elementHeight, marginLeft: 40, height: '100%', backgroundColor: 'lightgray', zIndex: 40 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                ref={scrollView => { this._downView = scrollView; }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={
                  e => {
                    this.setState({
                      scrollY: e.nativeEvent.contentOffset.y
                    })
                  }
                }
                onScroll={e => {
                  if (!this.downIsScrolling) {
                    this.upIsScrolling = true;
                    var scrollY = e.nativeEvent.contentOffset.y;
                    this._upView.scrollTo({ y: scrollY });
                    // this.changeAction()
                  }
                  this.downIsScrolling = false;
                }}
              >
                {this.state.elementData.map((item, index) => {
                  return (
                    <View key={index} style={{ borderWidth: 0.5, borderColor: 'black', width: this.state.elementWidth, height: this.state.elementHeight, alignItems: 'center' }}>
                      <Text style={{ textAlign: 'center', paddingTop: 7 }}>{item.number}</Text>
                    </View>
                  )
                })}
              </ScrollView>
            </View>
            <View style={{ marginLeft: 70.5, marginRight: this.state.showBar ? 45 : 45 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={scrollView => { this._leftView = scrollView; }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={
                  e => {
                    this.setState({
                      scrollX: e.nativeEvent.contentOffset.x
                    })
                  }
                }
                onScroll={e => {
                  if (!this.leftIsScrolling) {
                    this.rightIsScrolling = true;
                    var scrollX = e.nativeEvent.contentOffset.x;
                    this._rightView.scrollTo({ x: scrollX });
                    // this.changeAction()
                  }
                  this.leftIsScrolling = false;
                }}
              >
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  {this.state.workingHourData.length > 0 && this.state.workingHourData.map((item, index) => {
                    return (
                      <React.Fragment key={index}>
                        <View key={index} style={{ width: this.state.elementWidth, height: this.state.elementHeight, alignItems: 'center' }}>
                          <Text style={{ textAlign: 'center', paddingTop: 7 }}>{item.time}</Text>
                        </View>
                        {this.state.todayDate == this.state.selectedDate && (
                          <View style={{ borderLeftWidth: 0.5, height: '100%', width: 1, position: 'absolute', left: this.state.leftSize * 4 + 30, borderColor: 'red', zIndex: 55, backgroundColor: 'transparent' }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </View>
              </ScrollView>
            </View>
            <ScrollView
              nestedScrollEnabled
              scrollEnabled={this.state.toScroll}
              bounces={false}
              contentContainerStyle={{ height: this.state.elementHeight * this.state.elementData.length }}
              ref={scrollView => { this._upView = scrollView; }}
              scrollEventThrottle={16}
              onMomentumScrollEnd={
                e => {
                  this.setState({
                    scrollY: e.nativeEvent.contentOffset.y
                  })
                }
              }
              onScroll={e => {
                if (!this.upIsScrolling) {
                  this.downIsScrolling = true;
                  var scrollY = e.nativeEvent.contentOffset.y;
                  this._downView.scrollTo({ y: scrollY });
                }
                this.upIsScrolling = false;
              }}
            >
              <ScrollView
                horizontal
                scrollEnabled={this.state.toScroll}
                bounces={false}
                style={{ marginLeft: 70.5, marginRight: this.state.showBar ? 45 : 40 }}
                ref={scrollView => { this._rightView = scrollView; }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={
                  e => {
                    this.setState({
                      scrollX: e.nativeEvent.contentOffset.x
                    })
                  }
                }
                onScroll={e => {
                  if (!this.rightIsScrolling) {
                    this.leftIsScrolling = true;
                    var scrollX = e.nativeEvent.contentOffset.x;
                    this._leftView.scrollTo({ x: scrollX });
                  }
                  this.rightIsScrolling = false;
                }}
              >
                <View style={{ marginLeft: 30 }}>
                  {this.state.todayDate == this.state.selectedDate && (
                    <View style={{ borderLeftWidth: 0.5, height: '100%', width: 1, position: 'absolute', left: this.state.leftSize * 4, borderColor: 'red', zIndex: 55, backgroundColor: 'transparent' }} />
                  )}
                  <View style={[styles.scrollView, { width: this.state.elementWidth * this.state.workingHourData.length, height: this.state.elementHeight * this.state.elementData.length, position: 'relative' }]}>
                    {this.state.currentGridData.length > 0 && this.state.currentGridData[0].grid_arr.map((item, index) => {
                      let status = false;
                      let firstCell = false;
                      let colorName = "#F2F2F2";
                      let reservationId = -1;
                      let timeLength = 0;
                      if (this.state.reservationData.length > 0) {
                        let elementId = item.index.split('_')[0];
                        let time = item.index.split('_')[1];
                        this.state.reservationData.map((list, i) => {
                          if (list.element_id == Number(elementId) && list.arrive_time == time) {
                            if (list.times.length > 0) {
                              status = list.times.some(ele => ele == time);
                              list.times.map((lists, j) => {
                                if (lists === time) {
                                  timeLength = list.times.length;
                                  status = true;
                                  if (j == 0) {
                                    firstCell = true;
                                  }
                                }
                              })
                              if (status) {
                                if (this.state.reservationData[i].reservation_status == "occupied") {
                                  colorName = "black";
                                  reservationId = i;
                                }
                                if (this.state.reservationData[i].reservation_status == "booked") {
                                  colorName = "purple";
                                  reservationId = i;
                                }
                              }
                            }
                          }
                        })
                      }
                      return (
                        <React.Fragment
                          key={index}
                        >
                          <React.Fragment>
                            {reservationId > -1 && firstCell ? (
                              <React.Fragment>
                                <DragResizeBlock
                                  x={item.y}
                                  y={item.x}
                                  zIndex={this.state.reservationData[reservationId].status ? 55 : 50}
                                  w={this.state.elementWidth * (timeLength - 1)}
                                  h={this.state.elementHeight}
                                  isDisabled={!this.state.reservationData[reservationId].status}
                                  connectors={this.state.reservationData.length > 0 && this.state.reservationData[reservationId].reservation_status === "occupied" ? ['mr', 'e'] : ['mr', 'ml', 'e']}
                                  leftSize={this.state.leftSize}
                                  reservationStatus={this.state.currentReservationStatus}
                                  onDrag={
                                    (e) => {
                                      let limitDistance = this.state.windowHeight - this.state.statusBarHeight - this.state.elementHeight - this.state.elementHeight + this.state.scrollY;
                                      if (e[1] > limitDistance) {
                                        this._downView.scrollTo({ y: e[1] - limitDistance + this.state.scrollY + 350 * e[3] });
                                      }
                                    }
                                  }
                                  onDragEnd={
                                    (e) => {
                                      this.setState({
                                        dragEndElementX: e[0],
                                        dragEndElementY: e[1],
                                      })
                                    }
                                  }
                                  onResizeEnd={(e) => {
                                    this.setState({
                                      dragEndElementX: e[0],
                                      dragEndElementY: e[1],
                                      resizeWidth: e[2]
                                    })
                                  }}
                                  todayDate={this.state.todayDate}
                                  selectedDate={this.state.selectedDate}
                                >
                                  <TouchableHighlight
                                    style={[
                                      {
                                        borderWidth: 0.5,
                                        borderColor: 'grey',
                                        backgroundColor: colorName,
                                        width: '100%',
                                        height: '100%'
                                      },
                                      // status && { backgroundColor: colorName },
                                    ]}
                                    onPress={() => {
                                      if (!this.state.reservationData[reservationId].status) {
                                        this.setState({
                                          dragEndElementX: item.y,
                                          dragEndElementY: item.x,
                                          resizeWidth: this.state.elementWidth * (timeLength - 1),
                                          originElementX: item.y,
                                          originElementY: item.x,
                                          originWidth: this.state.elementWidth * (timeLength - 1),
                                        })
                                        this.setState({ currentReservationStatus: this.state.reservationData[reservationId].reservation_status })
                                        this.setState({ currentReservationId: this.state.reservationData[reservationId].id });
                                        this.setState({ currentCreatedBy: this.state.reservationData[reservationId].created_by })
                                        this.setState({
                                          customerLate: this.state.reservationData[reservationId].customer_lated,
                                          existCustomerLate: this.state.reservationData[reservationId].customer_lated
                                        })
                                        this.setState({ modalVisible: true })
                                        this.setState({ currentColor: colorName });
                                      }
                                    }}
                                  >
                                    <Animated.View style={{ position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 10 }}>
                                      <View style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                                        {this.state.reservationData[reservationId].customer_lated !== 0 && (
                                          <View style={{ paddingRight: 5 }}>
                                            <View style={{ backgroundColor: "white", borderRadius: 25, width: 25, height: 25 }}>
                                              <Text style={{ alignItems: 'center', textAlign: 'center', paddingTop: 2 }}>{this.state.reservationData[reservationId].customer_lated}</Text>
                                            </View>
                                          </View>
                                        )}
                                        <View>
                                          <Text style={[styles.reservation_text]}>
                                            {reservationId > -1 && firstCell ? `${I18n.t("Name")}` + " : " + this.state.reservationData[reservationId].name : ""}
                                          </Text>
                                          <Text style={styles.reservation_text}>
                                            {reservationId > -1 && firstCell ? `${I18n.t("persons")}` + " : " + this.state.reservationData[reservationId].number_persons : ""}
                                          </Text>
                                        </View>
                                      </View>
                                    </Animated.View>
                                  </TouchableHighlight>
                                </DragResizeBlock>
                                {this.state.showShadow && (
                                  <DragResizeBlock
                                    x={item.y}
                                    y={item.x}
                                    zIndex={40}
                                    w={this.state.elementWidth * (timeLength - 1)}
                                    h={this.state.elementHeight}
                                    isDisabled={true}
                                    reservationStatus={""}
                                    todayDate={this.state.todayDate}
                                    selectedDate={this.state.selectedDate}
                                  >
                                    <View
                                      style={[
                                        {
                                          backgroundColor: 'rgba(28,36,219,0.5)',
                                          width: '100%',
                                          height: '100%'
                                        },
                                      ]}
                                    ></View>
                                  </DragResizeBlock>
                                )}
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                {item.status ? (
                                  <DragResizeBlock
                                    x={item.y}
                                    y={item.x}
                                    zIndex={60}
                                    w={this.state.elementWidth * (this.state.timeOccupied / 15)}
                                    h={this.state.elementHeight}
                                    reservationStatus={"draft"}
                                    todayDate={this.state.todayDate}
                                    selectedDate={this.state.selectedDate}
                                    leftSize={this.state.leftSize}
                                    connectors={['mr', 'ml']}
                                    onDrag={
                                      (e) => {
                                        let limitDistance = this.state.windowHeight - this.state.statusBarHeight - this.state.elementHeight - this.state.elementHeight + this.state.scrollY;
                                        if (e[1] > limitDistance) {
                                          this._downView.scrollTo({ y: e[1] - limitDistance + this.state.scrollY + 350 * e[3] });
                                        }
                                      }
                                    }
                                    onDragEnd={
                                      (e) => {
                                        this.setState({
                                          dragEndElementX: e[0],
                                          dragEndElementY: e[1],
                                        })
                                      }
                                    }
                                    onResizeEnd={(e) => {
                                      let resizeW = (Math.round((e[2]) / this.state.elementWidth) * this.state.elementWidth) / this.state.elementWidth;
                                      let dragXCount = (Math.round((e[0]) / this.state.elementWidth) * this.state.elementWidth) / this.state.elementWidth;
                                      let dragYCount = Math.round((e[1]) / this.state.elementHeight) * this.state.elementHeight / this.state.elementHeight;
                                      this.setState({
                                        dragEndElementX: e[0],
                                        dragEndElementY: e[1],
                                        resizeWidth: e[2],
                                        timeOccupied: 15 * resizeW,
                                        arrive_time: this.state.workingHourData[dragXCount].time,
                                        tableName: this.state.elementData[dragYCount].number
                                      })
                                    }}
                                  // isDisabled={false}
                                  >
                                    <View
                                      style={[
                                        {
                                          backgroundColor: 'rgba(28,36,219,0.5)',
                                          width: '100%',
                                          height: '100%'
                                        },
                                      ]}
                                    >
                                      <Text style={{ fontSize: 12, textAlign: 'center', color: 'black', paddingTop: 8 }}>{this.state.timeOccupied}</Text>
                                    </View>
                                  </DragResizeBlock>
                                ) : (
                                  <TouchableOpacity
                                    key={index}
                                    style={[{ backgroundColor: `${item.index.split('_')[1] == this.state.breakTime ? "#F2F2F2" : '#F2F2F2'}`, borderWidth: 0.2, width: this.state.elementWidth, height: this.state.elementHeight, position: 'absolute', top: item.x, left: item.y, zIndex: 30 },
                                    ]}
                                    onPress={() => {
                                      if (this.state.freeCellStatus) {
                                      } else {
                                        if (!this.state.changeStatus) {
                                          if (item.index.split('_')[1] != this.state.breakTime) {
                                            let elementId = this.state.elementData.filter(ele => ele.elementId == item.index.split('_')[0] * 1);
                                            this.setState({ tableName: elementId[0].number })
                                            this.freeCellActive(item.index);
                                            this.setState({ currentCellIndex: item.index })
                                          }
                                        }
                                      }
                                    }}
                                  >
                                  </TouchableOpacity>
                                )}
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        </React.Fragment>
                      )
                    })}
                  </View>
                </View>
              </ScrollView>
            </ScrollView>
          </React.Fragment>
        ) : (
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 14, textAlign: 'center', color: 'black' }}>Grid not available, location is closed for this day selected.</Text>
          </View>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.calendarModalVisible}
          onBackdropPress={() => {
            this.setState({ calendarModalVisible: !this.state.calendarModalVisible })
          }}
          onRequestClose={() => {
            this.setState({ calendarModalVisible: !this.state.calendarModalVisible })
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
                onDayPress={(day) => { this.selectIndividualDays(day) }}
                markedDates={{
                  [this.state.tempDate]: { selected: true, marked: true, selectedColor: '#CC8C35' },
                }}
                markingType={'multi-dot'}
              />
              <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 5 }}>
                <TouchableOpacity
                  style={styles.openButton}
                  onPress={() => { this.doneAction() }}
                >
                  <Text style={styles.modal_text_style}>{I18n.t('Done')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { backgroundColor: this.state.currentColor }]}>
              <ModalContent
                currentColor={this.state.currentColor}
                changeAction={this.changeActions}
                closeAction={this.closeModalAction}
                completeConfirmAction={this.completeConfirmActions}
                removeConfirmAction={this.removeConfirmActions}
                arriveConfirmAction={this.arriveConfirmActions}
                reservationConfirmAction={this.reservationConfrimActions}
              />
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.crateModalStatus}
          // visible={true}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.startedModalView, { backgroundColor: '#fff', width: '100%', height: '100%' }]}>
              <View style={{ position: 'absolute', top: 10, right: 10 }}>
                <TouchableOpacity onPress={() => {
                  this.setState({ crateModalStatus: !this.state.crateModalStatus })
                  let arr = [...this.state.reservationData];
                  arr.map((item, index) => {
                    item.status = false;
                  })
                  this.setState({ reservationData: arr })
                  //this.state.reservationData[reservationId].status
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
                    placeholder={I18n.t('Phone_Number')}
                    editable={this.state.currentCreatedBy == "user" ? true : false}
                    onChangeText={this.handleChange("phoneValue")}
                    onFocus={() => {
                      this.setState({ focusStatus: true })
                    }}
                    value={this.state.phoneValue}
                  />
                  <TextInput
                    disableFullscreenUI={true}
                    style={styles.input}
                    editable={this.state.currentCreatedBy == "user" ? true : false}
                    onChangeText={this.handleChange("nameValue")}
                    value={this.state.nameValue}
                    onFocus={() => {
                      this.setState({ focusStatus: true })
                    }}
                    placeholder={I18n.t('Name')}
                  />
                  <TextInput
                    disableFullscreenUI={true}
                    style={styles.input}
                    onChangeText={this.handleChange("commentValue")}
                    value={this.state.commentValue}
                    onBlur={() => {
                      Keyboard.dismiss();
                    }}
                    onFocus={() => {
                      this.setState({ focusStatus: true })
                    }}
                    placeholder={I18n.t('Comment')}
                  />
                  <React.Fragment>
                    <Text style={{ paddingTop: 23 }}>{I18n.t('Number_of_persons')}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={{ display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingTop: 10 }}>
                        {this.state.personNumbers.map((item, index) => {
                          let status = false;
                          let filterResult = this.state.reservationData.filter(ele => ele.id == this.state.currentReservationId);
                          if (filterResult.length > 0) {
                            if (item.number == filterResult[0].number_persons) {
                              status = true;
                            }
                          }
                          return (
                            <TouchableOpacity key={index}
                              onPress={() => {
                                if (status) {
                                  this.setState({ updateStatus: false })
                                } else {
                                  this.setState({ updateStatus: true })
                                }
                                this.personSelectAction(item.id)
                              }}
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
                      <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Date')}:</Text>
                      <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Start_Time')}:</Text>
                      <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Range')}:</Text>
                      {(this.state.reservationUpdateStatus && this.state.currentReservationStatus == "booked") && (
                        <Text style={{ textAlign: 'left', paddingVertical: 10 }}>{I18n.t('Late')}:</Text>
                      )}
                    </View>
                    <View>
                      <Text style={{ textAlign: 'right', paddingVertical: 10 }}>{this.state.tableName}</Text>
                      <Text style={{ textAlign: 'right', paddingVertical: 10 }}>{this.state.selectedDate}</Text>
                      <Text style={{ textAlign: 'right', paddingVertical: 10 }}>{this.state.arrive_time}</Text>
                      <Text style={{ textAlign: 'right', paddingVertical: 10 }}>{this.state.timeOccupied}{I18n.t('mins')}</Text>
                      {(this.state.reservationUpdateStatus && this.state.currentReservationStatus == "booked") && (
                        <View>
                          <ModalDropdown
                            onSelect={(e) => { this.handleLate(e) }}
                            textStyle={{ fontSize: 14 }}
                            style={{ fontSize: 14, paddingVertical: 5, marginLeft: 20, marginRight: 0, paddingLeft: 0, paddingRight: 0, backgroundColor: 'lightgrey' }}
                            defaultTextStyle={{ fontSize: 14 }}
                            defaultValue={`${this.state.customerLate}mins`}
                            options={this.state.lateArr}
                            dropdownStyle={{ width: 70, marginLeft: 20, marginRight: -12, marginTop: 5 }}
                            dropdownTextStyle={{ fontSize: 14, textAlign: 'center' }}
                            renderButtonProps
                          />
                        </View>
                      )}
                    </View>
                  </View>
                  {!this.state.reservationView ? (
                    <React.Fragment>
                      <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 23 }}>
                        <TouchableOpacity style={{ backgroundColor: '#B352FF', width: 200, borderRadius: 5 }}
                          onPress={() => {
                            this.createReservation("booked")
                          }}
                        >
                          <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }}>{I18n.t('mark_booked')}</Text>
                        </TouchableOpacity>
                      </View>
                      { this.state.todayDate == this.state.selectedDate && (
                        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 23 }}>
                          <TouchableOpacity style={{ backgroundColor: '#000000', width: 200, borderRadius: 5 }}
                            onPress={() => {
                              this.createReservation("occupied")
                            }}
                          >
                            <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }}>{I18n.t('mark_occupied')}</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {this.state.currentReservationStatus === "booked" ? (
                        <React.Fragment>
                          {this.state.todayDate == this.state.selectedDate && (
                            <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 15 }}>
                              <TouchableOpacity style={{ backgroundColor: '#B352FF', width: 200, borderRadius: 5 }} onPress={() => {
                                this.changeViewResrvationStatus("occupied")
                              }}>
                                <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }}>
                                  {I18n.t('Arrived')}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 15 }}>
                            <TouchableOpacity style={{ backgroundColor: '#000000', width: 200, borderRadius: 5 }} onPress={() => {
                              this.changeViewResrvationStatus("completed")
                            }}>
                              <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }} >{I18n.t('Remove')}</Text>
                            </TouchableOpacity>
                          </View>
                          {this.state.updateStatus && (
                            <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 15 }}>
                              <TouchableOpacity style={{ backgroundColor: 'white', width: 200, borderRadius: 5, borderWidth: 1, borderColor: 'black', }} onPress={() => {
                                this.updateReservationStatus()
                              }}>
                                <Text style={{ textAlign: 'center', color: 'black', paddingHorizontal: 10, paddingVertical: 7 }} >{I18n.t('Update')}</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 23 }}>
                            <TouchableOpacity style={{ backgroundColor: '#000000', width: 200, borderRadius: 5 }} onPress={() => {
                              this.changeViewResrvationStatus("completed")
                            }}>
                              <Text style={{ textAlign: 'center', color: 'white', paddingHorizontal: 10, paddingVertical: 7 }} >{I18n.t('Completed')}</Text>
                            </TouchableOpacity>
                          </View>
                          {this.state.updateStatus && (
                            <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingTop: 23 }}>
                              <TouchableOpacity style={{ backgroundColor: 'white', width: 200, borderRadius: 5, borderWidth: 1, borderColor: 'black', }} onPress={() => {
                                this.updateReservationStatus()
                              }}>
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
      </View >
    )
  }
}
export const Reservation1 = connect(({ userReducer, dataReducer }) => ({ userReducer, dataReducer }))(Reservation1Class);
// export { Reservation1 };
const ModalContent = ({
  currentColor,
  changeAction,
  closeAction,
  completeConfirmAction,
  removeConfirmAction,
  arriveConfirmAction,
  reservationConfirmAction
}) => {
  const dispatch = useDispatch();
  const closeModalAction = () => {
    closeAction()
  }
  const reservationChange = () => {
    dispatch(ShowBarAction(true))
    changeAction()
  }
  const completeConfirm = () => {
    completeConfirmAction()
  }
  const removeConfirm = () => {
    removeConfirmAction()
  }
  const arriveConfirm = () => {
    arriveConfirmAction()
  }
  const reservationView = () => {
    reservationConfirmAction();
  }

  return (
    <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
      {currentColor == "black" ? (
        <Fragment>
          <TouchableOpacity style={styles.reservationButtonStyle}
            onPress={() => {
              reservationView()
            }}
          >
            <Text style={styles.reservation_button_text} >{I18n.t("View")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reservationButtonStyle}
            onPress={() => {
              reservationChange()
            }}>
            <Text style={styles.reservation_button_text} >{I18n.t("Change")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reservationButtonStyle}
            onPress={() => {
              completeConfirm()
            }}
          >
            <Text style={styles.reservation_button_text} >{I18n.t("Completed")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            closeModalAction()
          }}>
            <Image style={styles.close_button} source={Close} />
          </TouchableOpacity>
        </Fragment>
      ) : (
        <Fragment>
          <TouchableOpacity style={styles.reservationButtonStyle}
            onPress={() => {
              reservationView()
            }}
          >
            <Text style={styles.reservation_button_text} >{I18n.t("View")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reservationButtonStyle}
            onPress={() => {
              arriveConfirm()
            }}
          >
            <Text style={styles.reservation_button_text} >{I18n.t("Arrived")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reservationButtonStyle}
            onPress={() => {
              reservationChange()
            }}
          >
            <Text style={styles.reservation_button_text} >{I18n.t("Change")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reservationButtonStyle} onPress={() => {
            removeConfirm()
          }}>
            <Text style={styles.reservation_button_text} >{I18n.t("Remove")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            closeModalAction()
          }}>
            <Image style={styles.close_button} source={Close} />
          </TouchableOpacity>
        </Fragment>
      )}
    </View>
  )
}
const LeftContent = ({ selectedDate, tomorrowActions, todayActions, navigation, calendarAction }) => {
  const [active, setActive] = useState(1);
  const dispatch = useDispatch();
  useEffect(() => {
    setActive(1)
  }, [])
  const openCalendar = () => {
    setActive(3)
    calendarAction()
  }
  const tomorrowAction = () => {
    tomorrowActions()
    setActive(2)
  }
  const todayAction = () => {
    todayActions()
    setActive(1)
  }
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
        {(active == 1 && selectedDate.length > 0) && (
          <Text style={styles.leftDate}>{selectedDate.split('-')[2]}{"."}{selectedDate.split('-')[1]}</Text>
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
        {(active == 2 && selectedDate.length > 0) && (
          <Text style={styles.leftDate}>{selectedDate.split('-')[2]}{"."}{selectedDate.split('-')[1]}</Text>
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
        {(active == 3 && selectedDate.length > 0) && (
          <Text style={styles.leftDate}>{selectedDate.split('-')[2]}{"."}{selectedDate.split('-')[1]}</Text>
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
      <TouchableOpacity
        onPress={
          () => {
            dispatch(ShowBarAction(false))
            navigation.navigate('HomeNavigator', { screen: 'Table' })
          }
        }
        style={styles.buttonContainerGridmap}
        activeOpacity={0.8}
      >
        <Image
          style={
            [styles.calendarIcon, active == 4 && { tintColor: '#CC8C35' }]
          }
          source={GridMap}
        />
      </TouchableOpacity>
    </View>)
}
const RightContent = ({ cancelAction, confirmReservation }) => {
  const dispatch = useDispatch();
  const cancel = () => {
    dispatch(ShowBarAction(false))
    cancelAction();
  }
  const changeConfirmReservation = () => {
    // dispatch(ShowBarAction(false))
    confirmReservation();
  }
  return (
    <View style={styles.reservation_layout}>
      <View style={{ zIndex: 200 }}>
        <TouchableOpacity
          style={[styles.button_contain, { backgroundColor: 'green' }]}
          activeOpacity={0.8}
          onPress={changeConfirmReservation}
        >
          <Image
            style={[
              styles.anyIcon, {
                tintColor: 'white'
              }
            ]}
            source={require('../../assets/img/confirm.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button_contain, { backgroundColor: 'red' }]}
          activeOpacity={0.8}
          onPress={cancel}
        >
          <Image
            style={[
              styles.anyIcon, {
                tintColor: 'white'
              }
            ]}
            source={require('../../assets/img/close_img.png')}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  content: {
    // flex: 1,
    backgroundColor: '#D9CBC4',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    height: 1000,
    width: 1000,
  },
  timeLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  timeLayoutWrap: {

  },
  timeline_layout: {
    backgroundColor: '#cc8c35',
    justifyContent: 'center',
    height: 30
  },
  leftContent_layout: {
    zIndex: 5,
    top: 30,
    // bottom: 30,
    width: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.53,
    // shadowRadius: 2.62,
    // elevation: 4,
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
  buttonContainerGridmap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 1
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
    top: 0,
    left: 0,
    paddingLeft: 80
  },
  dots: {
    width: 6,
    height: 6,
    backgroundColor: "white",
    borderRadius: 5,
  },
  timeline_text: {
    color: 'white',
    fontSize: 12,
    // paddingLeft: 4.5
    textAlign: 'center'
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
    left: '42%',
    borderWidth: 5,
    borderTopColor: 'red',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  bottomRetangular_text: {
    position: 'absolute',
    bottom: -7,
    left: '42%',
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
  box: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white'
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
  modalView: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  reservationButtonStyle: {

  },
  reservation_button_text: {
    fontSize: 13,
    color: 'white',
    paddingHorizontal: 13,
    paddingVertical: 8
  },
  close_button: {
    width: 20,
    height: 20,
    marginLeft: 7
  },
  reservationButtonStyle: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    margin: 10
  },
  RightResize: {
    position: 'absolute',
    top: 9,
    right: -15.5,
  },
  resize_img: {
    width: 30,
    height: 16,
    tintColor: '#f9b430'
  },
  reservation_text: {
    textAlign: 'left',
    fontSize: 12,
    color: 'white',
  },
  reservation_confirm_button: {
    tintColor: 'green',
    zIndex: 200,
  },
  reservation_cancel_button: {
    tintColor: 'red',
    zIndex: 200,
  },
  scrollView: {
    flex: 1,
  },
  reservation_layout: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.53,
    shadowRadius: 2.62,
    elevation: 4,
    zIndex: 130
  },
  button_contain: {
    height: '50%',
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200
  },
  anyIcon: {
    height: 25,
    width: 25,
    tintColor: '#828282',
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
  },
  loadingWrap: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    alignItems: "center",
    position: 'absolute',
    backgroundColor: 'transparent',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 150
  },
});
