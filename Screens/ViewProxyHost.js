import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, ActivityIndicator, AppState, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import tw from 'twrnc';

export default function ViewProxyHostScreen({ route, navigation }) {
    const [isLoadingToken, setIsLoadingToken] = React.useState(true);
    const { hostID } = route.params;
    const [host, setHost] = React.useState(JSON);
    const appState = React.useRef(AppState.currentState);

    React.useEffect(() => {
        checkToken();
        const listener = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            console.log('unmount');
            listener.remove();
        };
    }, []);


    const handleAppStateChange = (nextAppState) => {
        console.log('App State: ' + nextAppState);
        if (appState.current != nextAppState) {
            if (appState.current.match(/inactive|background/)
                && nextAppState === 'active') {
                checkToken();
                console.log(
                    'App State: ' +
                    'App has come to the foreground!'
                );
            }
            appState.current = nextAppState;
        }
    };

    function checkToken() {
        SecureStore.getItemAsync('dashboardUrl').then((value) => {
            if (value) {
                SecureStore.getItemAsync('token').then((value2) => {
                    if (value2) {
                        const controller = new AbortController();
                        const id = setTimeout(() => {
                            controller.abort()
                            Alert.alert(
                                "Connection Error",
                                "Connection timed out to the dashboard while trying to verify token",
                                [
                                    { text: "OK" }
                                ]
                            );
                            navigation.navigate('Login');
                            setIsLoadingToken(false);
                        }, 5000);
                        fetch(`${value}/api/tokens`, {
                            method: 'GET',
                            signal: controller.signal,
                            headers: {
                                'Authorization': `Bearer ${value2}`
                            }
                        }).then(res => res.json())
                            .then(json => {
                                clearTimeout(id);
                                if (json.token) {
                                    SecureStore.setItemAsync('token', json.token);
                                    const controller2 = new AbortController();
                                    const id2 = setTimeout(() => {
                                        controller.abort()
                                        Alert.alert(
                                            "Connection Error",
                                            "Connection timed out to the dashboard while trying to fetch proxy hosts",
                                            [
                                                { text: "OK" }
                                            ]
                                        );
                                        navigation.navigate('Login');
                                        setIsLoadingToken(false);
                                    }, 5000);
                                    fetch(`${value}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`, {
                                        method: 'GET',
                                        signal: controller2.signal,
                                        headers: {
                                            'Authorization': `Bearer ${json.token}`
                                        }
                                    }).then(res => res.json())
                                        .then(json => {
                                            clearTimeout(id2);
                                            const found = json.find(host => host.id === hostID);
                                            if (found) {
                                                setHost(found);
                                                setIsLoadingToken(false);
                                            } else {
                                                Alert.alert(
                                                    "Error",
                                                    "Host not found",
                                                    [
                                                        { text: "OK" }
                                                    ]
                                                );
                                                navigation.navigate('Proxy Hosts');
                                                setIsLoadingToken(false);
                                            }
                                        })
                                        .catch(e => {
                                            clearTimeout(id2);
                                            navigation.navigate('Login');
                                            setIsLoadingToken(false);
                                        })
                                } else {
                                    navigation.navigate('Login');
                                    setIsLoadingToken(false);
                                }
                            })
                            .catch(e => {
                                clearTimeout(id);
                                navigation.navigate('Login');
                                setIsLoadingToken(false);
                            })
                    } else {
                        navigation.navigate('Login');
                        setIsLoadingToken(false);
                    }
                });
            } else {
                navigation.navigate('Login');
                setIsLoadingToken(false);
            }
        });
    }

    if (isLoadingToken) return (
        <View style={[styles.container]}>
            <ActivityIndicator />
        </View>
    )

    return (
        <View style={[tw`m-4`]}>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});