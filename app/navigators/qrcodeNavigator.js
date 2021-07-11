import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
	QrcodeScanners,
} from '../screens'

const Stack = createStackNavigator();

function QrcodeNavigator() {
	return (
		<Stack.Navigator headerMode={'none'}>
			<Stack.Screen name="qrscanner" component={QrcodeScanners} />
		</Stack.Navigator>
	);
}

export default QrcodeNavigator;
