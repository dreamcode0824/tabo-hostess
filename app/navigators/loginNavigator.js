import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
    Login,
    SignUp,
    ReceptionVerify,
    NewPassword,
} from '../screens'

const Stack = createStackNavigator();

function LoginNavigator() {
    return (
        <Stack.Navigator headerMode={'none'}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="ReceptionVerify" component={ReceptionVerify} />
            <Stack.Screen name="NewPassword" component={NewPassword} />
        </Stack.Navigator>
    );
}

export default LoginNavigator;
