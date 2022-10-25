import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, ActivityIndicator, AppState, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import tw from 'twrnc';

export default function DashboardScreen({ navigation }) {
    const [isLoadingToken, setIsLoadingToken] = React.useState(true);
    const [user, setUser] = React.useState(JSON);
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
                        fetch(`${value}/api/tokens`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${value2}`
                            }
                        }).then(res => res.json())
                            .then(json => {
                                if (json.token) {
                                    SecureStore.setItemAsync('token', json.token);
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
                                    fetch(`${value}/api/users/me?expand=permissions`, {
                                        method: 'GET',
                                        signal: controller.signal,
                                        headers: {
                                            'Authorization': `Bearer ${json.token}`
                                        }
                                    }).then(res => res.json())
                                        .then(json => {
                                            clearTimeout(id);
                                            setUser(json);
                                            setIsLoadingToken(false);
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
                            })
                            .catch(e => {
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
            <Text style={[tw`text-2xl`]}>Welcome back {user.nickname}</Text>
            {user.roles[0] === "admin" ? <Text style={[tw`text-sm mb-4`]}>Administrator</Text> : <Text></Text>}
            {user.permissions.proxy_hosts === "hidden" ?
                <></>
                :
                <TouchableOpacity onPress={() => navigation.navigate('Proxy Hosts')} style={[tw`items-center text-white bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2`]}>
                    <Text style={[tw`text-white`]}>Proxy Hosts</Text>
                </TouchableOpacity>
            }

            <TouchableOpacity onPress={() => navigation()} style={[tw`items-center text-white bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2`]}>
                <Text style={[tw`text-white`]}>Redirection Hosts</Text>
            </TouchableOpacity>
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