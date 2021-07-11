import React from 'react';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store'
import { Provider } from 'react-redux'
import { Platform, StatusBar } from 'react-native'
import MainNavigator from './navigators/mainNavigator'
export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {Platform.OS === 'android' ? <StatusBar backgroundColor="#fff" barStyle={'dark-content'} /> : null}
                <MainNavigator />
            </PersistGate>
        </Provider>
    );
}
