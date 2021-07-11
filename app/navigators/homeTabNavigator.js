import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Settings
} from '../screens'
import TabBar from './tabBar'
import BeachPool from '../navigators/BeachPool'
import RestaurantClub from '../navigators/RestaurantClub'
import HomeNavigator from './homeNavigator'
import SearchNavigator from './searchNavigator'
import QrcodeNavigator from './qrcodeNavigator';
const Tab = createBottomTabNavigator();

const HomeTabNavigator = () =>
  <Tab.Navigator
    tabBar={props => <TabBar {...props} />}
  >
    <Tab.Screen name="BeachPool" component={BeachPool} />
    <Tab.Screen name="RestaurantClub" component={RestaurantClub} />
    <Tab.Screen name="HomeNavigator" component={HomeNavigator} />
    <Tab.Screen name="Settings" component={Settings} />
    <Tab.Screen name="Qrcode" component={QrcodeNavigator} />
    <Tab.Screen name="SearchNavigator" component={SearchNavigator} />
  </Tab.Navigator>

export default HomeTabNavigator;
