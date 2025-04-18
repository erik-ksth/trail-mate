import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform, Animated } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Typography } from '../../constants/Typography';
import { Colors } from '../../constants/Colors';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';

import InfoTab from '../components/trip-tabs/info-tab';
import NavigationTab from '../components/trip-tabs/navigation-tab';
import PackingTab from '../components/trip-tabs/packing-tab';
import MissionTab from '../components/trip-tabs/mission-tab';
import ChatTab from '../components/trip-tabs/chat-tab';

function Trip() {
     const { trail } = useLocalSearchParams();
     const router = useRouter();
     const trailData = JSON.parse(trail as string);
     const actionSheetRef = useRef<ActionSheetRef>(null);
     const [activeTab, setActiveTab] = useState<string>('info');
     const tabWidth = Dimensions.get('window').width / 5; // Width for each tab
     const animatedValue = useRef(new Animated.Value(0)).current;

     // Update animation when activeTab changes
     useEffect(() => {
          const tabIndex = ['info', 'navigation', 'packing', 'mission', 'chat'].indexOf(activeTab);
          Animated.spring(animatedValue, {
               toValue: tabIndex * tabWidth / 1.23,
               useNativeDriver: true,
          }).start();
     }, [activeTab]);

     // Use the actual coordinates from the trail data, or fallback to default coordinates
     const initialRegion = {
          latitude: trailData.latitude || 37.7749,
          longitude: trailData.longitude || -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
     };

     const openDirections = () => {
          const { latitude, longitude } = initialRegion;
          const label = encodeURIComponent(trailData.name);

          const scheme = Platform.select({
               ios: 'maps:',
               android: 'geo:',
          });
          const url = Platform.select({
               ios: `${scheme}${latitude},${longitude}?q=${label}`,
               android: `${scheme}${latitude},${longitude}?q=${label}`,
          });
          Linking.openURL(url!);
     };

     const renderTabContent = () => {
          switch (activeTab) {
               case 'info':
                    return <InfoTab />;
               case 'navigation':
                    return <NavigationTab />;
               case 'packing':
                    return <PackingTab />;
               case 'mission':
                    return <MissionTab />;
               case 'chat':
                    return <ChatTab />;
               default:
                    return <InfoTab />;
          }
     };

     return (
          <>
               <Stack.Screen options={{ headerShown: false }} />
               <View style={styles.container}>
                    <MapView
                         style={styles.map}
                         initialRegion={initialRegion}
                         showsCompass={true}
                         showsScale={true}
                         mapPadding={{ top: 80, right: 20, bottom: 0, left: 20 }}
                         onPress={() => actionSheetRef.current?.show()}
                    >
                         <Marker
                              coordinate={{
                                   latitude: trailData.latitude || initialRegion.latitude,
                                   longitude: trailData.longitude || initialRegion.longitude
                              }}
                              title={trailData.name}
                              description={trailData.location}
                         />
                    </MapView>
                    <View style={styles.topBar}>
                         <TouchableOpacity
                              style={styles.backButton}
                              onPress={() => router.back()}
                         >
                              <Ionicons name="close" size={30} color="black" />
                         </TouchableOpacity>

                         <TouchableOpacity
                              style={styles.trailNameContainer}
                              onPress={() => router.back()}
                         >
                              <Text style={styles.trailName}>{trailData.name}</Text>
                         </TouchableOpacity>
                    </View>

                    <View style={styles.bottomButtonsContainer}>
                         <TouchableOpacity
                              style={[styles.directionsButton, { flex: 1 }]}
                              onPress={openDirections}
                         >
                              <Ionicons name="navigate" size={24} color="white" />
                              <Text style={styles.buttonText}>Get Directions</Text>
                         </TouchableOpacity>
                    </View>

                    <ActionSheet
                         ref={actionSheetRef}
                         containerStyle={styles.actionSheet}
                         overlayColor="transparent"
                         gestureEnabled
                         snapPoints={[70, 100]}
                    >
                         <View style={styles.sheetContent}>
                              <View style={styles.tabContainer}>
                                   <View style={styles.tabButtonsContainer}>
                                        <TouchableOpacity
                                             style={styles.tabButton}
                                             onPress={() => setActiveTab('info')}
                                        >
                                             <Ionicons
                                                  name="information-circle"
                                                  size={35}
                                                  color={activeTab === 'info' ? Colors.primary : '#999'}
                                             />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                             style={styles.tabButton}
                                             onPress={() => setActiveTab('navigation')}
                                        >
                                             <Ionicons
                                                  name="compass"
                                                  size={35}
                                                  color={activeTab === 'navigation' ? Colors.primary : '#999'}
                                             />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                             style={styles.tabButton}
                                             onPress={() => setActiveTab('packing')}
                                        >
                                             <Ionicons
                                                  name="bag"
                                                  size={35}
                                                  color={activeTab === 'packing' ? Colors.primary : '#999'}
                                             />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                             style={styles.tabButton}
                                             onPress={() => setActiveTab('mission')}
                                        >
                                             <Ionicons
                                                  name="trophy"
                                                  size={35}
                                                  color={activeTab === 'mission' ? Colors.primary : '#999'}
                                             />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                             style={styles.tabButton}
                                             onPress={() => setActiveTab('chat')}
                                        >
                                             <Ionicons
                                                  name="chatbubble-ellipses"
                                                  size={35}
                                                  color={activeTab === 'chat' ? Colors.primary : '#999'}
                                             />
                                        </TouchableOpacity>
                                   </View>
                                   <View style={styles.tabIndicatorContainer}>
                                        <Animated.View
                                             style={[
                                                  styles.tabIndicator,
                                                  {
                                                       transform: [{ translateX: animatedValue }]
                                                  }
                                             ]}
                                        >
                                             <View style={styles.tabIndicatorSmall} />
                                        </Animated.View>
                                   </View>
                              </View>
                              <View style={styles.tabContent}>
                                   {renderTabContent()}
                              </View>
                         </View>
                    </ActionSheet>
               </View>
          </>
     )
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: 'white',
     },
     title: {
          ...Typography.text.h1,
          marginBottom: 10,
     },
     map: {
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
     },
     topBar: {
          width: '100%',
          position: 'absolute',
          top: 70,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          zIndex: 1,
     },
     backButton: {
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 30,
          shadowColor: '#000',
          shadowOffset: {
               width: 0,
               height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
     },
     trailNameContainer: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '70%',
          height: '100%',
          backgroundColor: 'white',
          borderRadius: 30,
          shadowColor: '#000',
          shadowOffset: {
               width: 0,
               height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
     },
     trailName: {
          ...Typography.text.h4,
          textAlign: 'center',
          color: Colors.primary,
     },
     bottomButtonsContainer: {
          position: 'absolute',
          bottom: 40,
          left: 20,
          right: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 10,
     },
     directionsButton: {
          flex: 1,
          backgroundColor: '#007AFF',
          padding: 18,
          borderRadius: 30,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          shadowColor: '#000',
          shadowOffset: {
               width: 0,
               height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
     },
     buttonText: {
          ...Typography.text.h4,
          color: 'white',
          fontWeight: 'bold',
     },
     actionSheet: {
          flex: 1,
          backgroundColor: 'white',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          padding: 20,
     },
     sheetContent: {
          display: 'flex',
          flexDirection: 'column',
     },
     tabContainer: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          backgroundColor: 'white',
          boxShadow: '0px -4px 31px 0px rgba(0, 0, 0, 0.15)',
          borderRadius: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 70,
     },
     tabButtonsContainer: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
     },
     tabButton: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
     },
     tabIndicatorContainer: {
          width: '100%',
          height: '10%',
          display: 'flex',
     },
     tabIndicator: {
          position: 'absolute',
          bottom: 7,
          height: 7,
          width: '20%',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
     },
     tabIndicatorSmall: {
          width: '70%',
          height: 7,
          backgroundColor: Colors.primary,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
     },
     tabContent: {
          padding: 20,
          height: '80%',
          borderWidth: 1,
          borderBlockColor: 'white',
          borderColor: 'white',
   
     },
});

export default Trip;