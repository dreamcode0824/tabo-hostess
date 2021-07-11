import React, { Component, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import Orientation from 'react-native-orientation';
import { connect } from 'react-redux';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';
import ApiGraphQl from '../../networking/apiGraphQl';
import API from '../../networking/api';
import AsyncStorage from '@react-native-community/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import I18n from '../../constants/i18n';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
class Home extends React.Component {
  apigraphql = new ApiGraphQl();
  api = new API();
  constructor(props) {
    super(props);
    this.state = {
      elementData: [],
      rate: 0.5,
      maxWidth: 0,
      maxHeight: 0,
      scaleValue: 1,
      moveX: 0,
      moveY: 0,
      stateFlag: false,
      seatsCount: 0,
      modalVisible: false,
      selectDayFlag: false,
      individualDays: [],
      startDay: "",
      endDay: "",
      rangeSelectFlag: false,
      business_id: "",
      selectElementInformation: [],
      price_value: [],
      seat_zone: "",
      selected_days: [],
      days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      reservationData: [],
      gridStatus: "",
      customerData: [],
      reservationId: "",
      setPositionLock: false,
      reservationStatus: "",
      leftBarSelectId: 1,
      todayDay: "",
      tomorrowDay: "",
      callStatus: false,
      loading: false
    }
    // this.priceData
  }
  UNSAFE_componentWillReceiveProps(navigation) {
    if (navigation.route.params) {
      if (navigation.route.params.elementData) {
        if (navigation.route.params.elementData.length > 0) {
          let arr = [...this.state.elementData]
          arr.map((item, index) => {
            if (item.seatData.length > 0) {
              item.seatData.map((list, i) => {
                list.activeFlag = false;
                navigation.route.params.elementData.map((i) => {
                  if (list.id == i.id) {
                    list.activeFlag = true
                  }
                })
              })
            }
          })
          this.setState({ elementData: arr })
          this.setState({ seatsCount: navigation.route.params.elementData.length })
        } else {
          this.initialize()
        }
      }
      if (navigation.route.params.status == true) {
        this.cancelAction()
        this.setState({ gridStatus: "" })
        this.setState({ customerData: [] })
        this.getPrices();
        // this.readCurrentDay()
        this.readSelectId()
        this.getPricesCahngePosition(navigation.route.params.reservationDays)
        this.setState({ individualDays: navigation.route.params.reservationDays })
        // this.getTodayPrice("today")
      }
      if (navigation.route.params.status == "setPosition") {
        this.cancelAction()
        this.setState({ gridStatus: "setPosition" })
        this.setState({ customerData: navigation.route.params.customerData })
        this.setState({ reservationData: [] })
        this.setState({ reservationId: navigation.route.params.reservationId })
      }
      if (navigation.route.params.status == "changePosition") {
        this.cancelAction()
        this.setState({ gridStatus: "changePosition" })
        this.setState({ reservationData: [] })
        this.setState({ individualDays: navigation.route.params.reservationDays })
        this.setState({ reservationId: navigation.route.params.reservationId })
        this.setState({ reservationStatus: navigation.route.params.reservationStatus })
        this.getPricesCahngePosition(navigation.route.params.reservationDays)
      }
      if (navigation.route.params.status == "update") {
      }
    }
  }
  async componentDidMount() {
    this.elementReadData();
    this.getTodayPrice("today");
    Orientation.lockToLandscape();
  }
  getAllReservation = (ids, businessId) => {
    this.apigraphql.getAllReservationAPI(ids, this.state.buisness_id)
      .then((result) => {
        if (result.data.reservation_beach.length > 0) {
          this.props.navigation.navigate('Price', { status: "reservation_update", data: result.data.reservation_beach[0] })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async readCurrentDay() {
    try {
      const priceData = await AsyncStorage.getItem('currentDay')
      let result = await this.readData();
      if (priceData !== null) {
        this.setState({ individualDays: JSON.parse(priceData).day })
        this.api.getReservationApi(JSON.parse(priceData).day, result).then((res) => {
          this.setState({ reservationData: res.data.data })
        })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  async readSelectId() {
    try {
      const priceData = await AsyncStorage.getItem('index')
      if (priceData !== null) {
        this.setState({ leftBarSelectId: Number(priceData) })
      } else {
        this.setState({ leftBarSelectId: 1 })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  async elementReadData() {
    try {
      const elementData = await AsyncStorage.getItem('elementData')
      const maxWidth = await AsyncStorage.getItem('maxWidth')
      const maxHeight = await AsyncStorage.getItem('maxHeight')
      if (elementData !== null) {
        this.setState({ maxWidth: Number(maxWidth) })
        this.setState({ maxHeight: Number(maxHeight) })
        this.setState({ elementData: JSON.parse(elementData) })
      } else {
        this.setState({ elementData: [] })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  async readElementData() {
    try {
      const priceData = await AsyncStorage.getItem('price')
      if (priceData !== null) {
        this.setState({ price_value: JSON.parse(priceData) })
      } else {
        this.setState({ price_value: [] })
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  async readData() {
    try {
      const userData = await AsyncStorage.getItem('userData')
      if (userData !== null) {
        this.setState({ buisness_id: JSON.parse(userData).business_id })
        return JSON.parse(userData).business_id;
      }
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  getTodayPrice = async (currentDate) => {
    let result = await this.readData();
    this.api.getCurrentSelectApi(currentDate)
      .then((res) => {
        this.setState({ loading: true })
        if (res.data.data) {
          var day = new Date(res.data.selectDays);
          var nextDay = new Date(res.data.selectDays);
          nextDay.setDate(day.getDate() + 1);
          this.setState({ price_value: res.data.data })
          this.setState({ selected_days: [res.data.day] })
          if (!this.state.callStatus) {
            this.setState({ todayDay: res.data.selectDays })
            this.setState({ tomorrowDay: `${nextDay.getFullYear()}-${nextDay.getMonth() + 1 > 9 ? nextDay.getMonth() + 1 : `0${nextDay.getMonth() + 1}`}-${nextDay.getDay() > 9 ? nextDay.getDay() : `0${nextDay.getDay()}`}` })
          }
          this.setState({ individualDays: [res.data.selectDays] })
          this.setState({ callStatus: true })
          this.api.getReservationApi(this.state.individualDays, result).then((res) => {
            this.setState({ reservationData: res.data.data })
          })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getElements = () => {
    this.apigraphql.getElementByLocation()
      .then((result) => {
        if (result.data.business_element.length > 0) {
          let widthArr = [];
          let heightArr = [];
          let calculatedWidth;
          let calculatedHeight;
          result.data.business_element.map((item, index) => {
            widthArr.push(item.position.x)
            heightArr.push(item.position.y)
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
          this.setState({ maxWidth: calculatedWidth })
          this.setState({ maxHeight: calculatedHeight })
          this.setState({ elementData: result.data.business_element })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getPrices = async () => {
    let result = await this.readData();
    this.api.getPricesAPI(this.state.individualDays, result)
      .then((res) => {
        if (res.data.data) {
          this.setState({ loading: true });
          this.setState({ price_value: res.data.data })
        }
      })
      .catch((error) => {
        console.log(error);
      });
    this.api.getReservationApi(this.state.individualDays, result)
      .then((res) => {
        if (res.data) {
          this.setState({ reservationData: res.data.data })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getPricesCahngePosition = async (individualDays) => {
    let result = await this.readData();
    this.api.getPricesAPI(individualDays, result)
      .then((res) => {
        if (res.data.data) {
          this.setState({ price_value: res.data.data })
        }
      })
      .catch((error) => {
        console.log(error);
      });
    this.api.getReservationApi(individualDays, result)
      .then((res) => {
        if (res.data) {
          this.setState({ reservationData: res.data.data })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  activeFuntion = (seatId) => {
    let arr = [...this.state.elementData]
    arr.map((item, index) => {
      if (item.seatData.length > 0) {
        item.seatData.map((list, i) => {
          if (list.id === seatId) {
            if (list.activeFlag) {
              list.activeFlag = false;
              if ((this.state.seatsCount - 1) == 0) {
                this.setState({ stateFlag: false })
                this.setState({ seat_zone: "" })
              }
              this.setState({ setPositionLock: false })
              this.setState({ seatsCount: this.state.seatsCount - 1 })
            } else {
              if (this.state.gridStatus == "setPosition") {
                if (this.state.seatsCount != this.state.customerData[0].number) {
                  list.activeFlag = true;
                  this.setState({ seatsCount: this.state.seatsCount + 1 })
                  this.setState({ stateFlag: true })
                  if (this.state.seatsCount + 1 == this.state.customerData[0].number) {
                    this.setState({ setPositionLock: true })
                  } else {
                    this.setState({ setPositionLock: false })
                  }
                }
              } else {
                list.activeFlag = true;
                this.setState({ seatsCount: this.state.seatsCount + 1 })
                this.setState({ stateFlag: true })
              }
            }
          }
        })
      }
    })
    this.setState({ elementData: arr })
  }
  selectOpen = (seatId, elementType, zoneId, positionNumber, elementId, seatCount, type, filterDatas, isExistReservation, customerStatus) => {
    this.saveLeftBarIndex(this.state.leftBarSelectId);
    if (isExistReservation) {
      filterDatas.map((item, index) => {
        let colors = [...new Set(item.color)];
        item.color = colors;
      })
      if (this.state.seat_zone) {

      } else {
        if (filterDatas[0].color.length < 3) {
          if (filterDatas[0].color.length == 1) {
            if (filterDatas[0].color[0] == "yellow") {
              this.props.navigation.navigate('ReservationInformation', {
                otherParam: filterDatas,
              })
            } else {
              this.getAllReservation(filterDatas[0].reservation_id, this.state.buisness_id)
              this.saveCurrentDay(this.state.individualDays)
              // this.saveLeftBarIndex(this.state.leftBarSelectId);
            }
          }
          if (filterDatas[0].color.length == 2) {
            if (filterDatas[0].color[0] == "yellow" || filterDatas[0].color[1] == "yellow") {
              this.props.navigation.navigate('ReservationInformation', {
                otherParam: filterDatas,
              })
            } else {
              if (filterDatas[0].color[0] == "white" || filterDatas[0].color[1] == "white") {
                this.getAllReservation(filterDatas[0].reservation_id, this.state.business_id)
                this.saveCurrentDay(this.state.individualDays)
                // this.saveLeftBarIndex(this.state.leftBarSelectId);
              } else {
                this.props.navigation.navigate('ReservationInformation', {
                  otherParam: filterDatas,
                })
              }
            }
          }
        } else {
          this.props.navigation.navigate('ReservationInformation', {
            otherParam: filterDatas,
          })
        }
      }
    } else {
      if (this.state.seat_zone) {
        if (this.state.seat_zone == zoneId) {
          if (this.state.gridStatus == "setPosition") {
            if (type == this.state.customerData[0].type && zoneId == this.state.customerData[0].zone_id) {
              this.selectedElementInfo(positionNumber, seatId, elementId, seatCount, zoneId, type)
              this.activeFuntion(seatId)
            }
          } else {
            this.selectedElementInfo(positionNumber, seatId, elementId, seatCount, zoneId, type)
            this.activeFuntion(seatId)
          }
        } else {
          alert(`${I18n.t("zone_alert")}`)
        }
      } else {
        if (this.state.gridStatus == "setPosition") {
          if (type == this.state.customerData[0].type && zoneId == this.state.customerData[0].zone_id) {
            this.setState({ seat_zone: zoneId })
            this.selectedElementInfo(positionNumber, seatId, elementId, seatCount, zoneId, type)
            this.activeFuntion(seatId)
          }
        } else {
          this.setState({ seat_zone: zoneId })
          this.selectedElementInfo(positionNumber, seatId, elementId, seatCount, zoneId, type)
          this.activeFuntion(seatId)
        }
      }
    }
  }
  selectedElementInfo(positionNumber, seatId, elementId, seatCount, zoneId, type) {
    let arr = [...this.state.selectElementInformation];
    const filter = arr.filter(ele => ele.id === seatId);
    if (filter.length > 0) {
      const result = arr.filter(ele => ele.id !== seatId);
      this.setState({ selectElementInformation: result })
    } else {
      this.setState({ selectElementInformation: [...arr, { id: seatId, size: seatCount, zoneId: zoneId, type: type, price: "" }] })
    }
  }
  cancelAction = () => {
    let arr = [...this.state.elementData]
    arr.map((item, index) => {
      if (item.seatData.length > 0) {
        item.seatData.map((list, i) => {
          list.activeFlag = false;
        })
      }
    })
    this.setState({ seat_zone: "" })
    this.setState({ seatsCount: 0 })
    this.setState({ elementData: arr })
    this.setState({ stateFlag: false })
    this.setState({ selectElementInformation: [] })
  }
  selectDateHandle = () => {
    this.initialize();
    this.setState({ modalVisible: !this.state.modalVisible })
  }
  getDaysArray = (start, end) => {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt));
    }
    return arr;
  };
  selectIndividualDays = (days) => {
    if (this.state.selectDayFlag) {
      const isRepeat = this.state.individualDays.some(ele => ele === days.dateString)
      if (isRepeat && this.state.individualDays.length > 0) {
        const result = this.state.individualDays.filter(ele => ele != days.dateString);
        this.setState({ individualDays: result })
      } else {
        this.setState({ individualDays: [...this.state.individualDays, days.dateString] })
      }
    } else {
      if (this.state.startDay) {
        if (this.state.endDay) {
          this.setState({ startDay: days.dateString })
          this.setState({ endDay: "" })
          this.setState({ individualDays: [days.dateString] })
        } else {
          if ((new Date(this.state.startDay).getTime() > new Date(days.dateString).getTime())) {
            var daylist = this.getDaysArray(new Date(days.dateString), new Date(this.state.startDay));
            daylist.map((v) => v.toISOString().slice(0, 10)).join("");
            console.log(typeof daylist)
            let arr = []
            daylist.map((item, index) => {
              arr.push(JSON.stringify(item).split("T")[0].split("\"")[1]);
            })
            this.setState({ endDay: days.dateString })
            this.setState({ individualDays: arr })
          } else {
            var daylist = this.getDaysArray(new Date(this.state.startDay), new Date(days.dateString));
            daylist.map((v) => v.toISOString().slice(0, 10)).join("");
            console.log(typeof daylist)
            let arr = []
            daylist.map((item, index) => {
              arr.push(JSON.stringify(item).split("T")[0].split("\"")[1]);
            })
            this.setState({ endDay: days.dateString })
            this.setState({ individualDays: arr })
          }
        }
      } else {
        this.setState({ startDay: days.dateString })
        this.setState({ individualDays: [days.dateString] })
      }
    }
  }
  DoneAction = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
    this.getPrices();
    this.calculateDay();
    this.setState({ loading: false })
  }
  calculateDay = () => {
    if (this.state.individualDays.length > 0) {
      let arr = [];
      this.state.individualDays.map((item) => {
        let day = new Date(item).getDay();
        arr.push(this.state.days[day])
      })
      this.setState({ selected_days: arr })
    }
  }
  nextPage = () => {
    let resultPrice = this.state.price_value.filter(ele => ele.zone_id === this.state.seat_zone);
    let updatedData = [...this.state.selectElementInformation];
    updatedData.map((item, index) => {
      resultPrice.map((list, i) => {
        if (item.type == list.type) {
          let averagePrice = this.getAverageCalculate(list.price, this.state.selected_days);
          item.price = averagePrice;
        }
      })
    })
    this.setState({ selectElementInformation: updatedData })
    this.saveData(updatedData)
    this.priceSaveData(this.state.price_value, this.state.seat_zone)
    this.currentDaysSave(this.state.selected_days)
    this.selectedDays(this.state.individualDays)
    this.changeStatus("create", 0, "")
    this.saveZoneId(this.state.seat_zone)
    this.props.navigation.push('Price')
  }
  saveCurrentDay = async (data) => {
    try {
      console.log(data)
      let arr = { day: data };
      await AsyncStorage.setItem("currentDay", JSON.stringify(arr))
    } catch (e) {
      alert('Failed to save the data to the storage')
    }
  }
  saveZoneId = async (data) => {
    try {
      await AsyncStorage.setItem("zoneId", `${data}`)
    } catch (e) {
      alert('Failed to save the data to the storage')
    }
  }
  saveLeftBarIndex = async (index) => {
    try {
      console.log(index, "------------->saveData")
      await AsyncStorage.setItem("index", `${index}`)
    } catch (e) {
      alert('Failed to save the data to the storage')
    }
  }
  getAverageCalculate = (priceValue, selectArr) => {
    if (selectArr.length > 0) {
      let price = [];
      let averagePrice = 0;
      let totalPrice = 0;
      selectArr.map((item, index) => {
        if (item == "sunday") {
          price.push(priceValue.sunday);
        }
        if (item == "monday") {
          price.push(priceValue.monday);
        }
        if (item == "tuesday") {
          price.push(priceValue.tuesday);
        }
        if (item == "wednesday") {
          price.push(priceValue.wednesday);
        }
        if (item == "thursday") {
          price.push(priceValue.thursday);
        }
        if (item == "friday") {
          price.push(priceValue.friday);
        }
        if (item == "saturday") {
          price.push(priceValue.saturday);
        }
      })
      price.map(item => {
        totalPrice = totalPrice + item;
      })
      averagePrice = totalPrice / price.length;
      return Math.round(averagePrice * 100) / 100;
    }
  }
  saveData = async (data) => {
    try {
      await AsyncStorage.setItem("selectElement", JSON.stringify(data))
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  priceSaveData = async (priceData, zone_id) => {
    try {
      await AsyncStorage.setItem("price", JSON.stringify(priceData))
      await AsyncStorage.setItem("currentZoneId", JSON.stringify(zone_id))
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  currentDaysSave = async (days) => {
    try {
      await AsyncStorage.setItem("selectedDays", JSON.stringify(days))
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  selectedDays = async (selected_days) => {
    try {
      await AsyncStorage.setItem("individualDays", JSON.stringify(selected_days))
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  changeStatus = async (type, id, status) => {
    try {
      let arr = [{ type: type, reservation_id: id, reservation_status: status }]
      await AsyncStorage.setItem("reservationStatus", JSON.stringify(arr))
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  dateHandleAction = (id) => {
    this.initialize();
    if (id == 1) {
      this.setState({ loading: false })
      this.getTodayPrice("today");
    } else {
      this.setState({ loading: false })
      this.getTodayPrice("tomorrow");
    }
  }
  initialize = () => {
    let arr = [...this.state.elementData]
    arr.map((item, index) => {
      if (item.seatData.length > 0) {
        item.seatData.map((list, i) => {
          list.activeFlag = false;
        })
      }
    })
    this.setState({ elementData: arr })
    this.setState({ seat_zone: "" })
    this.setState({ seatsCount: 0 })
    this.setState({ elementData: arr })
    this.setState({ stateFlag: false })
    this.setState({ selectElementInformation: [] })
  }
  setPositionAction = () => {
    if (this.state.setPositionLock) {
      console.log(this.state.selectElementInformation, "((((((((((((((((((((");
      console.log(this.state.reservationId)
      let elementArr = [];
      for (let i = 0; i < this.state.selectElementInformation.length; i++) {
        elementArr.push(`{
            id: ${i}
            seat_id:"${this.state.selectElementInformation[i].id}"
          }`)
      }
      this.apigraphql.updateSeatPosition(elementArr, this.state.reservationId)
        .then((result) => {
          if (result.data.UpdateSeatPosition) {
            Alert.alert(
              `${I18n.t('Success')}`,
              `${I18n.t('Positions_set_successfully')}`,
              [
                { text: `${I18n.t('OK')}`, onPress: () => this.props.navigation.navigate("NotifHome", { notifyStatus: true }) }
              ],
              { cancelable: false }
            );
            // this.props.navigation.navigate("NotifHome", { notifyStatus: true })
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  changePosition = () => {
    let resultPrice = this.state.price_value.filter(ele => ele.zone_id === this.state.seat_zone);
    let updatedData = [...this.state.selectElementInformation];
    let priceValuesArr = [];
    updatedData.map((item, index) => {
      resultPrice.map((list, i) => {
        if (item.type == list.type) {
          let averagePrice = this.getAverageCalculate(list.price, this.state.selected_days);
          item.price = averagePrice;
        }
      })
    })
    this.saveData(updatedData)
    this.priceSaveData(this.state.price_value, this.state.seat_zone, this.state.selected_days)
    this.selectedDays(this.state.individualDays)
    this.changeStatus("update", this.state.reservationId, this.state.reservationStatus)
    this.props.navigation.push('Price')
  }
  homeMoving = (navigation) => {
    if (this.state.gridStatus == "setPosition") {
      navigation.navigate("NotifHome", { notifyStatus: true })
    }
    if (this.state.gridStatus == "changePosition") {
      this.getAllReservation([this.state.reservationId], this.state.business_id)
    }
  }
  leftTabAction = (id) => {
    this.setState({ leftBarSelectId: id })
  }
  render() {
    const { individualDays } = this.state;
    let windowWidth = Dimensions.get('window').width;
    let windowHeight = Dimensions.get('window').height;
    let maxW = this.state.maxWidth * this.state.rate + 960;
    let maxH = this.state.maxHeight * this.state.rate + 520;
    let zoomRateW = windowWidth / maxW;
    let zoomRateH = windowHeight / maxH;
    let newDaysObject = {};
    if (individualDays && individualDays.length > 0) {
      if (this.state.selectDayFlag) {
        individualDays.forEach((day) => {
          newDaysObject[day] = {
            selected: true,
            selectedColor: '#CC8C35'
          };
        });
      } else {
        if (individualDays.length > 1) {
          individualDays.forEach((day, index) => {
            if (index == 0) {
              newDaysObject[day] = {
                startingDay: true,
                selected: true,
                color: '#CC8C35',
                selectedColor: '#CC8C35',
                textColor: '#fff'
              };
            }
            else if (index == individualDays.length - 1) {
              newDaysObject[day] = {
                endingDay: true,
                selected: true,
                color: '#CC8C35',
                textColor: '#fff',
                selectedColor: '#CC8C35',
              };
            }
            else {
              newDaysObject[day] = {
                selected: true,
                color: '#CC8C35',
                textColor: '#fff',
                selectedColor: '#CC8C35',
              };
            }
          });
        } else {
          individualDays.forEach((day) => {
            newDaysObject[day] = {
              startingDay: true,
              endingDay: true,
              textColor: '#fff',
              color: '#CC8C35',
            };
          });
        }
      }
    }
    if (this.state.selectElementInformation.length > 0) {
      let arr = [];
      this.state.selectElementInformation.map(item => {
        arr.push(item)
      })
    }
    return (
      <React.Fragment>
        {!this.state.loading &&
          <View style={styles.loadingWrap}>
            <ActivityIndicator color='#CC8C35' size='large' />
          </View>
        }
        <View style={styles.content}>
          <View style={styles.scrollView}>
            <ImageZoom
              imageWidth={windowWidth}
              imageHeight={windowHeight}
              cropWidth={windowWidth}
              cropHeight={windowHeight}
              useNativeDriver={true}
              minScale={1}
            >
              <Animated.View
                style={[
                  { width: windowWidth },
                  { height: windowHeight },
                ]}
              >
                {this.state.elementData.length > 1 && this.state.elementData.map((item, index) => {
                  let width1 = this.state.rate * item.element.width * Math.cos(item.rotate_angle * Math.PI / 180);
                  let width2 = this.state.rate * item.element.height * Math.sin(item.rotate_angle * Math.PI / 180);
                  let height1 = this.state.rate * item.element.width * Math.sin(item.rotate_angle * Math.PI / 180);
                  let height2 = this.state.rate * item.element.height * Math.cos(item.rotate_angle * Math.PI / 180);
                  // console.log(item.rotate_angle, Math.round(width1), Math.round(height1), Math.round(width2), Math.round(height2), item.element.width, item.element.height)
                  return (
                    <View style={styles.seats_layin} key={index}>
                      <View style={[
                        { width: item.element ? item.element.width * this.state.rate * zoomRateW : 80 * this.state.rate * zoomRateW },
                        { height: item.element ? item.element.height * this.state.rate * zoomRateH : 102 * this.state.rate * zoomRateH },
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
                        { borderWidth: RFPercentage(0.1), borderColor: '#89756A', position: 'absolute' },
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
                          {item.seatData.length > 0 && item.seatData.map((list, i) => {
                            let white = false;
                            let purple = false;
                            let red = false;
                            let yellow = false;
                            let black = false;
                            let filterData = [];
                            let colorCount = 0;
                            let isReservation = false;
                            let customer_zone_id = "";
                            let customer_type = ""
                            if (this.state.reservationData.length > 0) {
                              let filterData1 = this.state.reservationData.filter(ele => ele.seats === list.id);
                              let filterData2 = filterData1.filter(ele => ele.reservation_status != "rejected");
                              let filterData3 = filterData2.filter(ele => ele.reservation_status != "completed");
                              filterData = filterData3.filter(ele => ele.reservation_status != "canceled");
                              if (filterData.length > 0) {
                                isReservation = true
                              } else {
                                isReservation = false
                              }
                              this.state.reservationData.map((item, index) => {
                                if (list.id == item.seats) {
                                  let colors = [];
                                  if (item.color) {
                                    colors = [...new Set(item.color)];
                                    colorCount = colors.length;
                                  }
                                  colors.map((list, index) => {
                                    if (list == "white") {
                                      white = true;
                                    }
                                    if (list == "purple") {
                                      purple = true;
                                    }
                                    if (list == "red") {
                                      red = true;
                                    }
                                    if (list == "yellow") {
                                      yellow = true;
                                    }
                                    if (list == "black") {
                                      black = true;
                                    }
                                    if (list == null) {
                                      white = true;
                                    }
                                  })
                                }
                              })
                            }
                            if (this.state.customerData.length > 0) {
                              customer_zone_id = this.state.customerData[0].zone_id;
                              customer_type = this.state.customerData[0].type;
                            }
                            return (
                              <Seats
                                key={i}
                                zoomRateW={zoomRateW}
                                zoomRateH={zoomRateH}
                                openAction={this.selectOpen}
                                seatId={list.id}
                                zoneId={item.zone.id}
                                elementType={item.zone ? item.zone.id : 0}
                                type={list.activeFlag ? "active" : this.state.customerData.length > 0 ? "customer" : "default"}
                                positionNumber={item.position.number}
                                elementId={item.id}
                                isBed={item}
                                seatCount={item.seatData.length}
                                whiteColor={white}
                                purpleColor={purple}
                                redColor={red}
                                yellowColor={yellow}
                                blackColor={black}
                                colorCounts={colorCount}
                                filterDatas={filterData}
                                isExistReservation={isReservation}
                                customerZoneId={customer_zone_id}
                                customerType={customer_type}

                              />
                            )
                          })}
                        </View>
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                          <View style={{ position: 'absolute', bottom: -6, backgroundColor: '#D9CBBF' }}>
                            <Text
                              style={{ fontSize: RFPercentage(1) }}
                            >{item.position.number}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )
                })}
              </Animated.View>
            </ImageZoom>
          </View>
          <LeftContent
            selectAction={this.selectDateHandle}
            navigation={this.props.navigation}
            dateHandle={this.dateHandleAction}
            status={this.state.gridStatus}
            movingFunction={this.homeMoving}
            leftBarActivaction={this.leftTabAction}
            selectId={this.state.leftBarSelectId}
            activeDays={individualDays}
            selectDayFlag={this.state.selectDayFlag}
            today={this.state.todayDay}
            tomorrow={this.state.tomorrowDay}
          />
        </View>
        <TouchableWithoutFeedback onPress={() => {
          this.setState({ modalVisible: false })
        }}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onBackdropPress={() => {
              this.setState({ modalVisible: !this.state.modalVisible })
            }}
            onRequestClose={() => {
              this.setState({ modalVisible: !this.state.modalVisible })
            }}
          >
            <ScrollView>
              {/* <TouchableOpacity
                activeOpacity={1}
                onPressOut={() => {
                  this.setState({ modalVisible: !this.state.modalVisible })
                }}> */}
              <View style={[styles.modalView, {
                width: 520, marginLeft: windowWidth / 2 - 255,
                height: 370, marginTop: windowHeight / 2 - 195,
              }]}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Calendar
                    style={{
                      paddingLeft: 20,
                      paddingTop: 10,
                      height: 350
                    }}
                    theme={{
                      arrowColor: '#CC8C35',
                    }}
                    onDayPress={(day) => { this.selectIndividualDays(day) }}
                    // Collection of dates that have to be marked. Default = {}
                    markedDates={newDaysObject}
                    markingType={this.state.selectDayFlag ? 'multi-dot' : 'period'}
                  />
                  <View style={{ width: 300 }}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 60 }}>
                      <TouchableOpacity
                        style={[styles.select_individual_button, this.state.selectDayFlag && { backgroundColor: '#CC8C35' }]}
                        onPress={() => {
                          console.log("ooooooooooooo----------->")
                          this.setState({ selectDayFlag: !this.state.selectDayFlag })
                          this.setState({ individualDays: [] })
                          this.setState({ startDay: "" })
                          this.setState({ endDay: "" })
                        }}
                      >
                        <Text style={[styles.select_individual_text, this.state.selectDayFlag && { color: '#fff' }]}>`${I18n.t("Select_Individual_Days")}`</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 200 }}>
                      <TouchableOpacity
                        style={styles.openButton}
                        onPress={this.DoneAction}
                      >
                        <Text style={styles.modal_text_style}>{I18n.t('Done')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
              {/* </TouchableOpacity> */}
            </ScrollView>
          </Modal>
        </TouchableWithoutFeedback>
        {
          this.state.stateFlag && (
            <View style={styles.bottom_bar}>
              <View style={styles.bot_lay}>
                <View style={styles.bottom_bar_content}>
                  <View style={styles.bottom_bar_element}>
                    {(this.state.gridStatus == "setPosition") ? (
                      <Text style={styles.bottom_font}>{`${I18n.t('Selected_Seats')} (${' '}${this.state.seatsCount}${' '}) of ${this.state.customerData[0].number}`}</Text>
                    ) : (
                      <Text style={styles.bottom_font}>{`${I18n.t('Selected_Seats')} (${' '}${this.state.seatsCount}${' '})`}</Text>
                    )}
                  </View>
                  <View style={styles.bottom_bar_element}>
                    <View style={styles.bottom_right_layout}>
                      <TouchableOpacity
                        onPress={this.cancelAction}
                        style={styles.bottom_button_cancel_style}>
                        <Text style={styles.bottom_font_cancel}>{I18n.t('Cancel')}</Text>
                      </TouchableOpacity>
                      {(this.state.gridStatus == "setPosition") ? (
                        <TouchableOpacity
                          style={[styles.bottom_button_style, !this.state.setPositionLock && { backgroundColor: 'lightgray' }]}
                          onPress={() => {
                            this.setPositionAction()
                          }}
                        >
                          <Text style={styles.bottom_font_open}>{I18n.t('Set_Position')}</Text>
                        </TouchableOpacity>
                      ) : (
                        <React.Fragment>
                          { this.state.gridStatus == "changePosition" ? (
                            <TouchableOpacity
                              style={[styles.bottom_button_style]}
                              onPress={() => {
                                this.changePosition()
                              }}
                            >
                              <Text style={styles.bottom_font_open}>{I18n.t('Change_Position')}</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={styles.bottom_button_style}
                              onPress={() => { this.nextPage() }}
                            >
                              <Text style={styles.bottom_font_open}>{I18n.t('Open')}</Text>
                            </TouchableOpacity>
                          )}
                        </React.Fragment>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        }
      </React.Fragment >
    );
  }
}
// export const Home = connect(({ config }) => ({ config }))(HomeClass);
export { Home };
const LeftContent = ({ selectAction, navigation, dateHandle, status, movingFunction, leftBarActivaction, selectId, activeDays, selectDayFlag, today, tomorrow }) => {
  const [active, setActive] = useState(1);
  React.useEffect(() => {
    setActive(selectId)
    // setActive(1)
  }, [])
  React.useEffect(() => {
    setActive(selectId)
  }, [selectId])
  React.useEffect(() => {
    if (status == "setPosition") {
      setActive(selectId)
    } else {
      setActive(selectId)
    }
  }, [status])
  const select = () => {
    if (status != "setPosition") {
      selectAction()
      setActive(3)
      leftBarActivaction(3)
    }
  }
  const activeAction = (id) => (event) => {
    if (status != "setPosition") {
      dateHandle(id)
      setActive(id)
      leftBarActivaction(id)
    }
  }
  const movingAction = () => {
    movingFunction()
  }
  return (
    <View style={styles.leftContent}>
      {(status == "setPosition" || status == "changePosition") ? (
        <TouchableOpacity
          onPress={movingAction}
          style={
            [styles.buttonContainer1]
          }
          activeOpacity={0.8}
        >
          <Image
            style={
              [styles.calendarIcon]
            }
            source={require('../../assets/img/left.png')}
          />
        </TouchableOpacity>
      ) : (
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
            {(active == 1 && today.length > 0) && (
              <Text style={styles.leftDate}>{today.split('-')[2]}.{today.split('-')[1]}</Text>
            )}
          </TouchableOpacity>
        </React.Fragment>
      )}
      {(status == "setPosition" || status == "changePosition") ? (
        <React.Fragment></React.Fragment>
      ) : (
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
            {I18n.t('Tomorrow')}
          </Text>
          <Image
            style={
              [styles.calendarIcon, active == 2 && { tintColor: '#CC8C35' }]
            }
            source={require('../../assets/img/calendar2.png')}
          />
          {(active == 2 && tomorrow.length > 0) && (
            <Text style={styles.leftDate}>{tomorrow.split('-')[2]}.{tomorrow.split('-')[1]}</Text>
          )}
        </TouchableOpacity>
      )}
      {(status == "setPosition" || status == "changePosition") ? (
        <React.Fragment></React.Fragment>
      ) : (
        <TouchableOpacity
          onPress={select}
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
          {(active == 3 && activeDays.length > 0) && (
            <React.Fragment>
              {selectDayFlag ? (
                <Text style={[styles.leftDate, { color: 'red' }]}>
                  {I18n.t('different_select_days')}
                </Text>
              ) : (
                <React.Fragment>
                  {activeDays.length > 1 ? (
                    <React.Fragment>
                      <Text style={[styles.leftDate]}>{activeDays[0].split('-')[2]}.{activeDays[0].split('-')[1]}</Text>
                      <Text style={[styles.leftDate, { fontWeight: 'bold' }]}>-</Text>
                      <Text style={[styles.leftDate]}>{activeDays[activeDays.length - 1].split('-')[2]}.{activeDays[0].split('-')[1]}</Text>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Text style={[styles.leftDate]}>{activeDays[0].split('-')[2]}.{activeDays[0].split('-')[1]}</Text>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </TouchableOpacity>
      )}
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
    </View>)
}
const Seats = ({
  zoomRateW,
  zoomRateH,
  openAction,
  flag,
  type,
  seatId,
  elementType,
  zoneId,
  positionNumber,
  elementId,
  isBed,
  seatCount,
  whiteColor,
  purpleColor,
  redColor,
  blackColor,
  yellowColor,
  colorCounts,
  filterDatas,
  isExistReservation,
  customerZoneId,
  customerType
}) => {
  const [bedState, setBedState] = useState(false)
  const [seat, setSeat] = useState(0)
  const [types, setTypes] = useState("")
  const [whiteStatus, setWhiteStatus] = useState(false);
  const [purpleStatus, setPurpleStatus] = useState(false);
  const [redStatus, setRedStatus] = useState(false);
  const [blackStatus, setBlackStatus] = useState(false);
  const [yellowStatus, setYellowStatus] = useState(false);
  const [colorCount, setColorCount] = useState(0);
  const [customerStatus, setCustomerStatus] = useState(false)
  const [customerId, setCustomerId] = useState(0);
  const [customerElementType, setCustomerElementType] = useState("")
  React.useEffect(() => {
    if (redColor) {
      setRedStatus(true)
    } else {
      setRedStatus(false)
    }
    if (yellowColor) {
      setYellowStatus(true)
    } else {
      setYellowStatus(false)
    }
    if (blackColor) {
      setBlackStatus(true)
    } else {
      setBlackStatus(false)
    }
    if (purpleColor) {
      setPurpleStatus(true)
    } else {
      setPurpleStatus(false)
    }
    if (whiteColor) {
      setWhiteStatus(true)
    } else {
      setWhiteStatus(false)
    }
    setColorCount(colorCounts)
  }, [redColor, colorCounts, yellowColor, blackColor, purpleColor])
  React.useEffect(() => {
    getTypes(isBed)
    if (isBed.element.type === "bed") {
      setBedState(true)
      setSeat(isBed.element.structure.size)
    } else {
      if (isBed.element.structure.bed) {
        if (isBed.element.structure.bed.left) {
          setBedState(true)
          setSeat(isBed.element.structure.bed.left)
        } else {
          setBedState(true)
          setSeat(isBed.element.structure.bed.center)
        }
      } else {
        setSeat(5)
      }
    }
  }, [])
  React.useEffect(() => {
    setCustomerId(customerZoneId);
    setCustomerElementType(customerType)
    if (customerZoneId == zoneId && types == customerType) {
      setCustomerStatus(true)
    } else {
      setCustomerStatus(false)
    }
  }, [customerZoneId, zoneId])
  const getTypes = (isBed) => {
    if (isBed.element.type == "sunbed") {
      setTypes("bed")
    }
    if (isBed.element.type == "bed") {
      setTypes("bed")
    }
    if (isBed.element.type == "umbrella") {
      if (isBed.element.structure.bed) {
        setTypes("bed")
      }
      else {
        setTypes("sunBed")
      }
    }
    if (isBed.element.type == "umbrellaRequired") {
      setTypes("umbrellaRequired")
    }
    if (isBed.element.type == "addtionalSunbed") {
      setTypes("addtionalSunbed")
    }
  }
  const selectSeat = () => {
    openAction(seatId, elementType, zoneId, positionNumber, elementId, seatCount, types, filterDatas, isExistReservation, customerStatus)
  }
  return (
    seat != 0 && (
      <TouchableOpacity
        onPress={selectSeat}
        style={[
          styles.seatLayout,
          { width: bedState ? seat == 2 ? 13 * zoomRateW * 1.5 : seat == 3 ? 13 * zoomRateW * 1.75 : 13 * zoomRateW * 2 : 13 * zoomRateW },
          { height: RFPercentage(2.5) },
          { marginTop: 2 * zoomRateH },
          { marginBottom: RFPercentage(1.4) },
          { marginLeft: 6 * zoomRateW },
          { marginRight: 6 * zoomRateW },
          { backgroundColor: 'white' },//-------------->
          (type === "default" && colorCount == 0 && !customerStatus) && { backgroundColor: 'white' },
          (type === "customer" && !customerStatus) && { backgroundColor: 'lightgrey' },
          (type === "customer" && customerStatus) && { backgroundColor: 'white' },
          (type === "active") && { backgroundColor: '#CC8C35' },
        ]}>
        {type !== "active" && (
          <React.Fragment>
            {whiteStatus && (
              <View style={{ width: '100%', backgroundColor: 'white', height: `${100 / colorCount}%` }}></View>
            )}
            {yellowStatus && (
              <View style={{ width: '100%', backgroundColor: 'yellow', height: `${100 / colorCount}%` }}></View>
            )}
            {purpleStatus && (
              <View style={{ width: '100%', backgroundColor: 'purple', height: `${100 / colorCount}%` }}></View>
            )}
            {redStatus && (
              <View style={{ width: '100%', backgroundColor: 'red', height: `${103 / colorCount}%` }}></View>
            )}
            {blackStatus && (
              <View style={{ width: '100%', backgroundColor: 'black', height: `${103 / colorCount}%` }}></View>
            )}
          </React.Fragment>
        )}
      </TouchableOpacity>
    )
  )
}
export { Seats, LeftContent };
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#D9CBC4',
  },
  content: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 40,
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
  areaSelect: {
    backgroundColor: '#fff',
    color: 'black',
    width: 200,
    fontSize: 14,
    borderRadius: 8

  },
  chooseAreaText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 30,
    paddingBottom: 11
  },
  areaLayout: {
    position: 'relative',
    backgroundColor: '#D9CBC4',
    width: '100%',
    height: '100%'
  },
  seatLayout: {
    width: 13,
    height: 41,
    margin: 6
  },
  seats_layin: {
    position: 'relative',
  },
  bottom_back_text: {
    color: '#000',
    textAlign: 'center'
  },
  bottom_bar: {
    position: 'absolute',
    zIndex: 10,
    bottom: 0,
    left: 0,
    width: '100%',
    paddingLeft: 40,
    paddingRight: 40,
  },
  bot_lay: {
    backgroundColor: '#fff',
    height: 40,
  },
  bottom_bar_content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  bottom_font: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  },
  bottom_button_style: {
    // width: 75,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 2,
    backgroundColor: '#CC8C35',
    marginRight: 9,
    marginLeft: 9
  },
  bottom_font_open: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#fff',
    paddingTop: 2
  },
  bottom_right_layout: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottom_button_cancel_style: {
    borderColor: '#C5C5C5',
    borderWidth: 1,
    borderRadius: 2,
    width: 75,
    height: 26,
    marginRight: 9,
    marginLeft: 9
  },
  bottom_font_cancel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#575757',
    paddingTop: 2
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
    // width: 252,
    // marginLeft: 230,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  openButton: {
    width: 44,
    height: 22,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modal_text_style: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CC8C35',
    textAlign: 'center'
  },
  select_individual_text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A8A',
  },
  select_individual_button: {
    marginTop: 5,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#CC8C35",
    borderRadius: 10,
    paddingLeft: 25,
    paddingRight: 25,
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
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1
  },
});
