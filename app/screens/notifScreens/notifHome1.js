import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { NotifSelect } from '../../components'
import ApiGraphQl from '../../networking/apiGraphQl';
import API from '../../networking/api';
import AsyncStorage from '@react-native-community/async-storage';
import Close from '../../assets/img/close.png';
import { useRoute } from '@react-navigation/native';
import I18n from '../../constants/i18n';
import { useDebounce } from "use-debounce";
import { useDispatch, useSelector } from "react-redux";
import { SetPositionAction } from '../../store/redux/dataAction'
const NotifHome1 = (props) => {
  const api = new API();
  const apigraphql = new ApiGraphQl();
  const dispatch = useDispatch();
  const inputButtons = [
    {
      icon: require('../../assets/img/phone.png'),
      placeholder: `${I18n.t('Phone_Number')}`
    },
    {
      icon: require('../../assets/img/identification.png'),
      placeholder: `${I18n.t('Name')}`
    },
    {
      icon: require('../../assets/img/hashtag.png'),
      placeholder: `${I18n.t('Reservation_Number')}`
    },
  ]
  const statuses = [
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
  const [select, setSelect] = useState(false);
  const [selectIndex, setSelectIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadPage, setLoadPage] = useState(true);
  const [searchTypeIndex, setSearchTypeIndex] = useState(0);
  const [searchText, setSearchText] = useState(0);
  const [reservationData, setReservationData] = useState([]);
  const [seatName, setSeatName] = useState(["1st", "2nd", "3rd", "4th", "5th"]);
  const [currency, setCurrency] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [releaseModalVisible, setReleaseModalVisible] = useState(false);
  const [releaseDatas, setReleaseDatas] = useState([]);
  const [reservationId, setReservationId] = useState("")
  const [reservation_status, setReservationSatus] = useState("");
  const [moreVisibleModal, setMoreVisibleModal] = useState(false);
  const [moreTitle, setMoreTitle] = useState("");
  const [moreText, setMoreText] = useState([]);
  const [indicateLoading, setIndicateLoading] = useState(false)
  const [searchType, setSearchType] = useState("Phone_Number");
  const [limitCount, setLimitCount] = useState(20);
  const [offSetCount, setOffsetCount] = useState(0);
  const [scrollLoading, setScrollLoading] = useState(true);
  const [responseStatus, setResponseStatus] = useState(false);
  const [debouncedText] = useDebounce(searchText, 1000);
  useEffect(() => {
    getBusinessId();
  }, [])
  useEffect(() => {
    if (debouncedText.length > 0) {
      searchAction(debouncedText, searchType);
    }
  }, [debouncedText])
  useEffect(() => {
    let unsubscribe;
    if (businessId) {
      setReservationData([])
      getAllReservation(businessId, limitCount, 0, true)
      setSelectIndex(null);
      setSearchText("")
      unsubscribe = props.navigation.addListener('focus', () => {
        setReservationData([])
        getAllReservation(businessId, limitCount, 0, true)
        setSelectIndex(null);
        setSearchText("")
      })
    }
    return unsubscribe;
  }, [businessId]);
  const getAllReservation = (id, limitCount, offSetCount, status) => {
    setScrollLoading(true)
    apigraphql.getRestaurantReservation(id, limitCount, offSetCount)
      .then((result) => {
        console.log('----------------------------->id', result)
        if (result.data.reservation_restaurant.length > 0) {
          setReservationSatus(false)
          setScrollLoading(false)
          if (status) {
            setReservationData([...result.data.reservation_restaurant])
          } else {
            setReservationData([...reservationData, ...result.data.reservation_restaurant])
          }
          currencyData();
        } else {
          setIndicateLoading(true)
          setReservationSatus(false)
          setScrollLoading(false)
        }
      })
      .catch((error) => {
        setScrollLoading(false)
        console.log(error);
      });
  }
  const getBusinessId = async () => {
    try {
      let data = await AsyncStorage.getItem('userData')
      if (data != null) {
        setBusinessId(JSON.parse(data).business_id)
      }
      return data
    } catch (error) {
      console.log(error);
    }
  }
  const currencyData = async () => {
    try {
      let data = await AsyncStorage.getItem('currency')
      if (data != null) {
        setIndicateLoading(true)
        setCurrency(data)
      } else {
        setIndicateLoading(true)
      }
      return data
    } catch (error) {
      console.log(error);
    }
  }
  const filterAction = (i) => {
    setSearchText("")
    let statusArr = ['booked', 'pending', 'accepted', 'rejected', 'occpied', 'completed', 'released', 'expired', 'canceled']
    setSelectIndex(i)
    setSelect(false)
    setIndicateLoading(false)
    getFilterStatus(statusArr[i])
  }
  const getFilterStatus = (status) => {
    apigraphql.filterRestaurantReservation(status)
      .then((result) => {
        if (result.data.reservation_restaurant.length > 0) {
          setIndicateLoading(true)
          setReservationData(result.data.reservation_restaurant)
        } else {
          setReservationData([])
          setIndicateLoading(true)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const statusColor = (status) => {
    if (status == "occupied") {
      return 'black'
    }
    if (status == "reserved_paid") {
      return 'red'
    }
    if (status == "pending") {
      return 'yellow'
    }
    if (status == "booked") {
      return 'purple'
    }
    if (status == "paid_online") {
      return 'red'
    }
    if (status == "rejected") {
      return 'grey'
    }
    if (status == "completed") {
      return 'grey'
    }
    if (status == "canceled") {
      return 'grey'
    }
    if (status == "released") {
      return 'grey'
    }
    if (status == "expired") {
      return 'grey'
    }
    if (status == "paid") {
      return 'grey'
    }
  }
  const statusName = (status) => {
    if (status == "occupied") {
      return 'Occupied'
    }
    if (status == "reserved_paid") {
      return 'Paid'
    }
    if (status == "pending") {
      return 'Pending'
    }
    if (status == "booked") {
      return "Booked"
    }
    if (status == "paid_online") {
      return 'Paid Online'
    }
    if (status == "rejected") {
      return 'Rejected'
    }
    if (status == "completed") {
      return 'Completed'
    }
    if (status == "canceled") {
      return 'Canceled'
    }
    if (status == "released") {
      return 'Released'
    }
    if (status == "expired") {
      return 'Expired'
    }
    if (status == "paid") {
      return 'Paid'
    }
  }
  const changeActionAlert = (id, status) => {
    Alert.alert(
      `${status == "paid_online" ? "Pay" : status == "reserved_paid" ? "Pay" : status == "released" ? "Released" : status == "rejected" ? "Reject" : status == "booked" ? "Booked" : "Occupied"}`,
      `${I18n.t('Are_you_sure')}`,
      [
        {
          text: `${I18n.t('No')}`,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: `${I18n.t('Yes')}`, onPress: () => {
            changeStatus(id, status)
          }
        }
      ],
      { cancelable: false }
    );
  }
  const changeStatus = (id, status) => {
    apigraphql.apiChangeReservationRestaurant(id, status)
      .then((result) => {
        if (result.data) {
          let arr = [...reservationData];
          arr.map((item, index) => {
            if (item.id == id) {
              arr[index]["reservation_status"] = status;
            }
          })
          setReservationData(arr)
          alert(`${I18n.t('Success_change_status')}`)
        }
        console.log(result)
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const moreAction = (title, text) => {
    setMoreTitle(title)
    setMoreText(text)
    setMoreVisibleModal(!moreVisibleModal)
  }
  const resetAction = () => {
    setReservationData([])
    getAllReservation(businessId, limitCount, 0, true)
    setIndicateLoading(false)
    setSelectIndex(null);
    setSearchText("")
    setOffsetCount(0)
  }
  const changeSearchAction = (text) => {
    setSearchText(text)
  }
  const searchAction = (text) => {
    console.log(searchType)
    if (searchType == "Phone_Number" && text.length >= 3) {
      setIndicateLoading(false)
      api.RestaurantReservationSearch(text, searchType)
        .then((result) => {
          if (result.data) {
            console.log(result.data, "*************search result")
            setScrollLoading(false)
            setIndicateLoading(true)
            setReservationData(result.data.data)
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (searchType == "Name" || searchType == "Reservation_Number") {
      setIndicateLoading(false)
      api.RestaurantReservationSearch(text, searchType)
        .then((result) => {
          if (result.data) {
            console.log(result.data, "*************search result")
            setScrollLoading(false)
            setIndicateLoading(true)
            setReservationData(result.data.data)
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  const setPosition = (id) => {
    let filterResult = reservationData.filter(ele => ele.id == id);
    if (filterResult.length > 0) {
      dispatch(SetPositionAction(true, filterResult[0].selected_day, filterResult[0].arrive_time))
      props.navigation.navigate("Table1")
    }
  }
  const _renderList = () => {
    return (
      <React.Fragment>
        {reservationData.length > 0 ? (
          <React.Fragment>
            {reservationData.length > 0 && reservationData.map((item, i) => {
              let str = `${item.name}/${item.phone_number}`;
              return (
                <ScrollView
                  key={i}
                  style={[styles.notifItem, { borderBottomColor: statusColor(item.reservation_status), zIndex: 999 }]}>
                  <Text style={[styles.itemTitle, { color: statusColor(item.reservation_status) }]}>
                    {statusName(item.reservation_status)}
                  </Text>
                  <View style={{ minHeight: 190 }}>
                    <Text style={[styles.infoText2, { textAlign: 'center', marginBottom: 3 }]}>
                      {`${item.created_at.split('T')[1].split(":")[0]}:${item.created_at.split('T')[1].split(":")[1]} | ${item.created_at.split('T')[0].split('-')[2]}:${item.created_at.split('T')[0].split('-')[1]}:${item.created_at.split('T')[0].split('-')[0]}`}
                    </Text>
                    {(item.name.length > 0 || item.phone_number.length > 0) && (
                      <View>
                        <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                          <Text style={styles.cardInfoTitle}>{I18n.t('Name_Phone_No')}:  </Text>
                        </View>
                        <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                          <Text style={[styles.cardInfoText, { marginTop: 1 }]}>
                            <React.Fragment>{str.substring(0, 18)}{item.name.length + item.phone_number.length > 20 ? "..." : ""}</React.Fragment>
                          </Text>
                          {item.name.length + item.phone_number.length > 20 && (
                            <TouchableOpacity
                              style={{ borderColor: '#D9D9D9', borderWidth: 1, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2 }}
                              onPress={() => {
                                moreAction("Name & Phone No", [`${item.name}/${item.phone_number}`])
                              }}
                            >
                              <Text style={{ fontSize: 8, color: 'black' }}>{I18n.t("More")}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                    {(item.comment.length > 0) && (
                      <View>
                        <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                          <Text style={styles.cardInfoTitle}>{I18n.t('Comment')}:  </Text>
                        </View>
                        <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                          <Text style={[styles.cardInfoText, { marginTop: 1 }]}>
                            <React.Fragment>{item.comment.substring(0, 18)}{item.comment > 20 ? "..." : ""}</React.Fragment>
                          </Text>
                          {item.comment > 20 && (
                            <TouchableOpacity
                              style={{ borderColor: '#D9D9D9', borderWidth: 1, borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2 }}
                              onPress={() => {
                                moreAction("Comment", [`${item.comment}`])
                              }}
                            >
                              <Text style={{ fontSize: 8, color: 'black' }}>{I18n.t("More")}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                    <View>
                      <Text style={styles.cardInfoTitle}>{I18n.t('Order_No')}:  </Text>
                      <Text style={styles.cardInfoText}>#{item.id}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardInfoTitle}>{I18n.t('Table_Number')}:  </Text>
                      <Text style={styles.cardInfoText}>#{item.element_id}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardInfoTitle}>{I18n.t('Reservation_day')}:  </Text>
                      <Text style={styles.cardInfoText}>{item.selected_day}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardInfoTitle}>{I18n.t('Arrive_time')}:  </Text>
                      <Text style={styles.cardInfoText}>{item.arrive_time}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardInfoTitle}>{I18n.t('number_of_persons')}:  </Text>
                      <Text style={styles.cardInfoText}>{item.number_persons}</Text>
                    </View>
                  </View>
                  <View style={styles.line} />
                  {item.reservation_status == "pending" ?
                    _renderAcceptButtons(item.price, item.id, item.reservation_status) :
                    item.reservation_status == "reserved_not_paid" ?
                      _renderReservedNotPaidButtons(item.price, item.id, item.reservation_status) :
                      (item.reservation_status == "paid_online" || item.reservation_status == "reserved_paid") ?
                        _renderPaidOnlineButtons(item.price, item.id, item.reservation_status) :
                        (item.reservation_status == "rejected"
                          || item.reservation_status == "canceled"
                          || item.reservation_status == "completed"
                          || item.reservation_status == "released"
                          || item.reservation_status == "expired"
                          || item.reservation_status == "paid"
                        ) ?
                          _renderRejectButtons(item.price, item.id, item.reservation_status) :
                          _renderRequestButton(item.price, item.id, item.reservation_status)}
                </ScrollView>
              )
            })}
          </React.Fragment>
        ) : (
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }} >{I18n.t('No_result')}</Text>
          </View>
        )}
      </React.Fragment>
    )
  }
  const _renderRejectButtons = (totalPrice, id, reservationStatus) => {
    return (<View style={styles.buttonsContainer}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10 }}>

      </View>
    </View>)
  }
  const _renderPaidOnlineButtons = (totalPrice, id, reservationStatus) => {
    return (<View style={styles.buttonsContainer}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10 }}>
        <TouchableOpacity
          onPress={() => { changeActionAlert(id, "released") }}
          style={[styles.acceptButton, { marginHorizontal: 2 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Release')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { changeActionAlert(id, "occupied") }}
          style={[styles.acceptButton, { marginHorizontal: 2 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Confirm_Arrival')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>)
  }
  const _renderReservedNotPaidButtons = (totalPrice, id, reservationStatus) => {
    return (<View style={styles.buttonsContainer}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10 }}>
        <TouchableOpacity
          // onPress={() => { releaseDayAlert(id, "released", selected_days) }}
          style={[styles.acceptButton, { marginHorizontal: 2 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Release')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <TouchableOpacity
          onPress={() => { changeActionAlert(id, "occupied") }}
          style={[styles.acceptButton, { padding: 3, marginHorizontal: 3, marginTop: 5 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Confirm_Arrival')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>)
  }

  const _renderRequestButton = (totalPrice, id, reservationStatus) => {
    return (<View style={styles.buttonsContainer}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10 }}>
        <TouchableOpacity
          onPress={() => { changeActionAlert(id, "released") }}
          style={styles.acceptButton}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Release')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>)
  }

  const _renderAcceptButtons = (totalPrice, id, reservationStatus) => {
    return (<View style={styles.buttonsContainer}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10 }}>
        <TouchableOpacity
          onPress={() => { changeActionAlert(id, "rejected") }}
          style={[styles.acceptButton, { zIndex: 5 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Reject')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { changeActionAlert(id, "booked") }}
          style={[styles.acceptButton, { marginHorizontal: 3 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Accept')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setPosition(id) }}
          style={[styles.acceptButton, { padding: 3, marginHorizontal: 3 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Set_Position')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <TouchableOpacity
          onPress={() => { }}
          style={[styles.acceptButton, { padding: 3, marginHorizontal: 3, marginTop: 5 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText2}>
            {I18n.t('Check_Customer')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>)
  }
  const _renderPageLoading = () => {
    return loadPage && !loading ?
      (<View style={styles.loadingContainer}>
        {scrollLoading ? (
          <ActivityIndicator size="large" color="#CC8C35" />
        ) : (
          <View></View>
        )}
      </View>) : null
  }
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 65;
    return layoutMeasurement.width + contentOffset.x >=
      contentSize.width - paddingToBottom;
  };
  const _renderLoading = () => {
    return loading ? (<View ></View>) :
      (<ScrollView
        onScroll={({ nativeEvent }) => {
          // console.log(nativeEvent, "------------->nativeEvent")
          if (loadPage && isCloseToBottom(nativeEvent)) {
            console.log('END LIST');
            if (!responseStatus) {
              setReservationSatus(true)
              setOffsetCount(offSetCount + 1)
              getAllReservation(businessId, limitCount, offSetCount + 1)
            }
            // setCanGetNewPage = false
          }
        }}
        scrollEventThrottle={400}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>

        <View style={styles.scrollInner}>
          {!scrollLoading && _renderList()}
          {_renderPageLoading()}
        </View>
      </ScrollView>)
  }
  const _renderInputButtons = () => {
    return <View style={styles.inputButtonsRow}>
      {inputButtons.map((item, i) => (
        <TouchableOpacity
          onPress={() => {
            setSearchTypeIndex(i)
            if (i == 0) {
              setSearchType("Phone_Number")
              setSearchText("")
            }
            if (i == 1) {
              setSearchType("Name")
              setSearchText("")
            }
            if (i == 2) {
              setSearchType("Reservation_Number")
              setSearchText("")
            }
          }}
          activeOpacity={0.8}
          style={styles.inputButton}
          key={i}>
          <Image
            source={item.icon}
            style={[
              i === searchTypeIndex ? { tintColor: '#151515' } : { tintColor: '#C1C1C1' },
              i === 1 ? { height: 14, width: 14 } : { height: 12, width: 12 }
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  }
  return (
    <React.Fragment>
      <View
        style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => {
                resetAction()
              }}
              style={styles.resetButton}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {I18n.t('Reset')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelect(!select)
              }}
              style={styles.selectButton}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {selectIndex === null ? `${I18n.t('Select')}` : statuses[selectIndex]}
              </Text>
              <Image
                source={require('../../assets/img/dropArrow.png')}
                style={styles.selectArrow}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Image
              source={require('../../assets/img/search.png')}
              style={styles.searchIcon}
            />
            {searchTypeIndex === 0 ? (<Text style={styles.inputMask}>+</Text>) : null}
            <TextInput
              disableFullscreenUI={true}
              keyboardType={searchTypeIndex === 0 ? 'phone-pad' : 'default'}
              onChangeText={(text) => {
                changeSearchAction(text)
              }}
              value={searchText}
              placeholder={inputButtons[searchTypeIndex].placeholder}
              style={styles.searchInput}
            />
            {_renderInputButtons()}
          </View>
        </View>
        {indicateLoading ? (
          _renderLoading()
        ) : (
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View>
              <ActivityIndicator size="large" color="#CC8C35" />
            </View>
          </View>
        )}
        <NotifSelect
          isVisible={select}
          close={() => {
            setSelect(false)
          }}
          select={(i) => {
            filterAction(i)
          }}
          status={true}
        />
      </View>
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
              {moreTitle == "Name & Phone No" && (
                <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10 }}>
                  {moreText[0]}
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
    </React.Fragment>
  )
}
export { NotifHome1 };
const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    paddingRight: 40
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    marginHorizontal: 20
  },
  resetButton: {
    height: 34,
    width: 69,
    borderRadius: 4,
    backgroundColor: 'rgba(88, 88, 88, 0.32)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18
  },
  selectButton: {
    paddingHorizontal: 12,
    height: 34,
    width: 118,
    borderRadius: 4,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 13
  },
  selectArrow: {
    width: 9,
    height: 5.78
  },
  scrollInner: {
    flex: 1,
    paddingHorizontal: 15,
    flexDirection: 'row'
  },
  notifItem: {
    backgroundColor: '#fff',
    // height: 268,
    marginBottom: 10,
    width: 200,
    maxWidth: 200,
    marginHorizontal: 5,
    borderRadius: 2,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Medium',
    marginTop: 5,
    textAlign: 'center',
  },
  infoText1: {
    fontFamily: 'Poppins-Light',
    fontSize: 11,
    color: '#000',
    marginBottom: 1
  },
  infoText2: {
    fontFamily: 'Poppins-Light',
    fontSize: 9,
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    height: 7,
    width: 7,
    marginRight: 5,
    marginBottom: 2
  },
  topRow: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'space-between'
  },
  line: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginTop: 5
  },
  ronText: {
    color: '#000',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10
  },
  infoText3: {
    color: '#FF0101',
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    marginBottom: 8
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 13,
    alignItems: "center"
  },
  requestButton: {
    width: 90,
    height: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3
  },
  buttonText1: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9,
    lineHeight: 13,
    color: '#4A4A4A',
  },
  acceptButton: {
    flex: 1,
    height: 29,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText2: {
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    lineHeight: 11,
    color: '#4A4A4A',
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    alignItems: "center",
  },
  inputContainer: {
    height: 34,
    width: 250,
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row'
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    lineHeight: 16,
    padding: 0,
    paddingLeft: 40,
    paddingTop: 2
  },
  searchIcon: {
    height: 14,
    width: 14,
    position: 'absolute',
    left: 10,
    top: 10,
  },
  inputButtonsRow: {
    height: '100%',
    flexDirection: 'row',
    alignItems: "center",
    marginHorizontal: 5
  },
  inputButton: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: "center",
    marginHorizontal: 2
  },
  inputMask: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    lineHeight: 16,
    position: "absolute",
    top: 9,
    left: 29
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
  discount_layout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  border_bottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    width: '95%',
    paddingTop: 20,
  },
  textStyle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CC8C35'
  },
  discount_modal_done: {
    marginTop: 11
  },
  cardInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Medium'
  },
  cardInfoText: {
    fontFamily: 'Poppins-Light',
    fontSize: 11,
    color: '#000',
  }
});
