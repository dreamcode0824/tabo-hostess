import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginNavigator from './loginNavigator'
import HomeTabNavigator from './homeTabNavigator'

const Stack = createStackNavigator();

function MainNavigator(props) {
    return (
        <Stack.Navigator
            headerMode={'none'}
        //  initialRouteName={'HomeTabNavigator'}
        >
            <Stack.Screen name="LoginNavigator" component={LoginNavigator} />
            <Stack.Screen name="HomeTabNavigator" component={HomeTabNavigator} />
        </Stack.Navigator>
    );
}

export default MainNavigator;
