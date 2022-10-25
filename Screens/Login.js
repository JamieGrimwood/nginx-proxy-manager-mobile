import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, ActivityIndicator, AppState, Alert } from 'react-native';
import tw from 'twrnc';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }) {
    const [dashboardUrl, setDashboardUrl] = React.useState();
    const [email, setEmail] = React.useState();
    const [password, setPassword] = React.useState();
    const [error, setError] = React.useState();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingFull, setIsLoadingFull] = React.useState(true);
    const [lastLogin, setLastLogin] = React.useState();
    const appState = React.useRef(AppState.currentState);

    React.useEffect(() => {
        checkToken();
        SecureStore.getItemAsync('lastLogin').then((value) => {
            if (!value) return
            const login = JSON.parse(value)
            setLastLogin(login)
        })
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
                                    navigation.navigate('Dashboard');
                                } else {
                                    setIsLoadingFull(false);
                                }
                            })
                            .catch(e => {
                                clearTimeout(id);
                                setIsLoadingFull(false);
                            })
                    } else {
                        setIsLoadingFull(false);
                    }
                });
            } else {
                setIsLoadingFull(false);
            }
        });
    }

    function lastLoginFunction() {
        setIsLoading(true);
        if (!lastLogin.dashboardUrl) {
            setError('Last saved login did not have a valid Dashboard URL. Please log in manually');
            return setIsLoading(false);
        }
        if (!lastLogin.email) {
            setError('Last saved login did not have a valid email. Please log in manually');
            return setIsLoading(false);
        }
        if (!lastLogin.password) {
            setError('Last saved login did not have a valid password. Please log in manually.');
            return setIsLoading(false);
        }
        setDashboardUrl(lastLogin.dashboardUrl);
        setEmail(lastLogin.email);
        setPassword(lastLogin.password);
        const controller = new AbortController();
        const id = setTimeout(() => {
            controller.abort()
            Alert.alert(
                "Connection Error",
                "Connection timed out to the dashboard while trying to login",
                [
                    { text: "OK" }
                ]
            );
        }, 5000);
        fetch(`${lastLogin.dashboardUrl}/api/tokens`, {
            method: 'POST',
            signal: controller.signal,
            body: JSON.stringify({
                identity: lastLogin.email,
                secret: lastLogin.password,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json())
            .then(json => {
                clearTimeout(id);
                if (json.token) {
                    SecureStore.setItemAsync('dashboardUrl', lastLogin.dashboardUrl);
                    SecureStore.setItemAsync('token', json.token);
                    SecureStore.setItemAsync('lastLogin', JSON.stringify({ dashboardUrl: lastLogin.dashboardUrl, email: lastLogin.email, password: lastLogin.password }));
                    navigation.navigate('Dashboard');
                    setIsLoading(false);
                    setDashboardUrl(null);
                    setEmail(null);
                    setPassword(null);
                    setError(null);
                } else {
                    setError('Invalid credentials');
                    setIsLoading(false);
                }
            })
            .catch(error => {
                clearTimeout(id);
                setIsLoading(false);
                if (error.message === 'Network request failed') {
                    setError('Please enter a valid dashboard URL');
                } else {
                    setError('An unknown error occurred when trying to connect with the dashboard.');
                }
            })
    }

    function login() {
        setIsLoading(true);
        if (!dashboardUrl) {
            setError('Please enter a dashboard URL');
            return setIsLoading(false);
        }
        if (!email) {
            setError('Please enter a email');
            return setIsLoading(false);
        }
        if (!password) {
            setError('Please enter a password');
            return setIsLoading(false);
        }
        const controller = new AbortController();
        const id = setTimeout(() => {
            controller.abort()
            Alert.alert(
                "Connection Error",
                "Connection timed out to the dashboard while trying to login",
                [
                    { text: "OK" }
                ]
            );
        }, 5000);
        fetch(`${dashboardUrl}/api/tokens`, {
            method: 'POST',
            body: JSON.stringify({
                identity: email,
                secret: password,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(res => res.json())
            .then(json => {
                clearTimeout(id);
                if (json.token) {
                    SecureStore.setItemAsync('dashboardUrl', dashboardUrl);
                    SecureStore.setItemAsync('token', json.token);
                    SecureStore.setItemAsync('lastLogin', JSON.stringify({ dashboardUrl, email, password }));
                    navigation.navigate('Dashboard');
                    setIsLoading(false);
                    setDashboardUrl(null);
                    setEmail(null);
                    setPassword(null);
                    setError(null);
                } else {
                    setError('Invalid credentials');
                    setIsLoading(false);
                }
            })
            .catch(error => {
                clearTimeout(id);
                setIsLoading(false);
                if (error.message === 'Network request failed') {
                    setError('Please enter a valid dashboard URL');
                } else {
                    setError('An unknown error occurred when trying to connect to the dashboard.');
                }
            })
    }

    if (isLoadingFull) return (
        <View style={[styles.container]}>
            <ActivityIndicator />
        </View>
    )

    return (
        <View style={styles.container}>
            {lastLogin ?
                <TouchableOpacity onPress={() => lastLoginFunction()} style={[tw`p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md mb-4 items-center`]}>
                    <Text style={[tw`mb-2 text-xl font-bold tracking-tight text-gray-900`]}>Last Saved Login</Text>
                    <Text style={[tw`mb-2 text-xs font-bold tracking-tight text-gray-500`]}>Dashboard URL: {lastLogin.dashboardUrl}</Text>
                    <Text style={[tw`mb-2 text-xs font-bold tracking-tight text-gray-500`]}>Email: {lastLogin.email}</Text>
                </TouchableOpacity>
                :
                <></>
            }
            {error ?
                <View style={[tw`p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg`]}>
                    <Text style={[tw`font-medium`]}>{error}</Text>
                </View>
                :
                <></>
            }
            <View>
                <Text style={[tw`text-3xl font-bold mb-4`]}>Login</Text>
            </View>
            <Text style={[tw`mb-2 text-sm font-medium text-gray-900`]}>Dashboard URL</Text>
            <TextInput
                style={[tw`bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-60 p-2.5 mb-2`]}
                onChangeText={text => setDashboardUrl(text)}
                value={dashboardUrl}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <Text style={[tw`mb-2 text-sm font-medium text-gray-900`]}>Email</Text>
            <TextInput
                style={[tw`bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-60 p-2.5 mb-2`]}
                onChangeText={text => setEmail(text)}
                value={email}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <Text style={[tw`mb-2 text-sm font-medium text-gray-900`]}>Password</Text>
            <TextInput
                style={[tw`bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-60 p-2.5 mb-2`]}
                onChangeText={text => setPassword(text)}
                value={password}
                autoComplete="password"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity onPress={() => login()} style={[tw`items-center text-white bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2`]}>
                {isLoading ? <Text style={[tw`text-gray-400`]}>Loading...</Text> : <Text style={[tw`text-white`]}>Login</Text>}
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