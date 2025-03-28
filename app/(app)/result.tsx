import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, ViewStyle, TextStyle, ImageBackground, ImageStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../constants/Typography';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Trail interface for type safety
interface Trail {
     name: string;
     location: string;
     keyFeatures: string;
     facilities: string;
     latitude?: number;
     longitude?: number;
}

// Function to fetch coordinates from OpenStreetMap
const fetchCoordinates = async (name: string, location: string): Promise<{ latitude: number; longitude: number } | null> => {
     try {
          console.log('Fetching coordinates for:', name + ', ' + location);
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ', ' + location)}`);
          const data = await response.json();
          if (data && data[0]) {
               return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
               };
          } else {
               const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
               const data = await response.json();
               if (data && data[0]) {
                    return {
                         latitude: parseFloat(data[0].lat),
                         longitude: parseFloat(data[0].lon)
                    };
               }
          }
          return null;
     } catch (error) {
          console.error('Error fetching coordinates:', error);
          return null;
     }
};

// Parse the recommendation string into structured data
const parseRecommendations = async (recommendationsString: string): Promise<Trail[]> => {
     if (!recommendationsString) return [];

     // Check if the string contains valid trail data (should contain '#' and '!')
     if (!recommendationsString.includes('#') || !recommendationsString.includes('!')) {
          console.error('Invalid recommendations format:', recommendationsString);
          return [];
     }

     // Split the string by '#' to get individual trails (ignoring empty first element if string starts with #)
     const trailStrings = recommendationsString.split('#').filter(Boolean);

     // Process each trail and fetch coordinates
     const trails = await Promise.all(trailStrings.map(async (trailString) => {
          // Split each trail string by the delimiters
          const parts = trailString.split(/[!@%]/);
          const name = parts[0] || '';
          const location = parts[1] || '';
          // Skip if this is an error message
          if (name.toLowerCase().includes('sorry') || name.toLowerCase().includes('error')) {
               console.error('Skipping invalid trail data:', name);
               return null;
          }

          // Fetch coordinates for the location
          const coordinates = await fetchCoordinates(name, location);

          return {
               name: name,
               location: location,
               keyFeatures: parts[2] || '',
               facilities: parts[3] || '',
               ...coordinates
          };
     }));

     // Filter out any null entries from invalid trails
     return trails.filter((trail): trail is Trail => trail !== null);
};

// Sample trail images - in a real app, these could come from an API or be specific to each trail
const trailImages = [
     'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1000',
     'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&q=80&w=1000',
     'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000'
];

export default function Result() {
     const router = useRouter();
     const [loading, setLoading] = useState(true);
     const [recommendationsString, setRecommendationsString] = useState<string | null>(null);
     const [parsedTrails, setParsedTrails] = useState<Trail[]>([]);
     const [summary, setSummary] = useState<string | null>(null);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          // Retrieve data from AsyncStorage
          const loadData = async () => {
               setLoading(true);
               try {
                    // Get recommendations, summary, and any error
                    const [recommendationsValue, summaryValue, errorValue] = await Promise.all([
                         AsyncStorage.getItem('trailRecommendations'),
                         AsyncStorage.getItem('trailSummary'),
                         AsyncStorage.getItem('trailError')
                    ]);

                    if (errorValue) {
                         setError(errorValue);
                         setLoading(false);
                         return;
                    }

                    if (summaryValue) {
                         setSummary(summaryValue);
                    }

                    if (recommendationsValue) {
                         setRecommendationsString(recommendationsValue);
                         // Parse the recommendations string into structured data with coordinates
                         const trails = await parseRecommendations(recommendationsValue);

                         if (trails.length === 0) {
                              setError("No valid trail recommendations found. Please try again.");
                         } else {
                              setParsedTrails(trails);
                              // Store the parsed JSON in AsyncStorage for potential use elsewhere
                              await AsyncStorage.setItem('parsedTrails', JSON.stringify(trails));
                         }
                    } else {
                         setError("No trail recommendations found. Please try again.");
                    }
               } catch (err) {
                    console.error("Error loading data from AsyncStorage:", err);
                    setError("Failed to load recommendations. Please try again.");
               } finally {
                    setLoading(false);
               }
          };

          loadData();
     }, []);

     const handleClose = () => {
          router.push('/(app)/home');
          // Clear storage when closing
          // AsyncStorage.multiRemove(['trailRecommendations', 'trailSummary', 'trailError'])
          //      .then(() => router.push('/(app)/home'))
          //      .catch((err: any) => console.error("Error clearing AsyncStorage:", err));
     };

     const handleRetry = () => {
          // Clear any previous error before returning to preferences
          AsyncStorage.removeItem('trailError')
               .then(() => {
                    // Return to preferences page to try again
                    router.push('/(app)/preferences');
               })
               .catch((err: any) => console.error("Error clearing error state:", err));
     };

     const handleTrailPress = (trail: Trail) => {
          router.push({
               pathname: '/trip',
               params: { trail: JSON.stringify(trail) }
          });
     };

     // Render a trail card for each parsed trail
     const renderTrailCard = (trail: Trail, index: number) => {
          // Use a placeholder image from our array, cycling through them
          const backgroundImage = trailImages[index % trailImages.length];

          return (
               <TouchableOpacity key={index} style={styles.trailCard} onPress={() => handleTrailPress(trail)}>
                    <ImageBackground
                         source={{ uri: backgroundImage }}
                         style={{ width: '100%', height: '100%', justifyContent: 'flex-end' }}
                         imageStyle={{ borderRadius: 15 }}
                    >
                         <View style={styles.cardOverlay}>
                              <Text style={styles.trailName}>{trail.name}</Text>

                              <View style={styles.detailsContainer}>
                                   <View style={styles.detailRow}>
                                        <Ionicons name="location-outline" size={18} color="white" />
                                        <Text style={styles.detailText}>{trail.location}</Text>
                                   </View>

                                   <View style={styles.detailRow}>
                                        <Ionicons name="leaf-outline" size={18} color="white" />
                                        <Text style={styles.detailText}>{trail.keyFeatures}</Text>
                                   </View>

                                   <View style={styles.detailRow}>
                                        <Ionicons name="shield-checkmark-outline" size={18} color="white" />
                                        <Text style={styles.detailText}>{trail.facilities}</Text>
                                   </View>
                              </View>
                         </View>
                    </ImageBackground>
               </TouchableOpacity>
          );
     };

     return (
          <SafeAreaView style={styles.safeArea}>
               <View style={styles.container}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                         <Ionicons name="close" size={40} color={Colors.black} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Handpicked for you -</Text>
                    <Text style={styles.secondTitle}>Select Your Trail!</Text>

                    <ScrollView
                         style={styles.scrollView}
                         contentContainerStyle={styles.scrollContent}
                         showsVerticalScrollIndicator={false}
                    >

                         {loading ? (
                              <View style={styles.loadingContainer}>
                                   <ActivityIndicator size="large" color={Colors.primary} />
                                   <Text style={styles.loadingText}>Loading your trail recommendations...</Text>
                              </View>
                         ) : error ? (
                              <View style={styles.errorContainer}>
                                   <Text style={styles.errorText}>{error}</Text>
                                   <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                                        <Text style={styles.retryButtonText}>Retry</Text>
                                   </TouchableOpacity>
                              </View>
                         ) : parsedTrails.length > 0 ? (
                              <View style={styles.trailsContainer}>
                                   {parsedTrails.map(renderTrailCard)}
                              </View>
                         ) : recommendationsString ? (
                              <View style={styles.section}>
                                   <Text style={styles.recommendationsText}>{recommendationsString}</Text>
                              </View>
                         ) : null}
                    </ScrollView>
               </View>
          </SafeAreaView>
     );
}

const styles = StyleSheet.create({
     safeArea: {
          flex: 1,
          backgroundColor: 'white',
     } as ViewStyle,
     container: {
          flex: 1,
          backgroundColor: 'white',
          paddingHorizontal: 20,
     } as ViewStyle,
     scrollView: {
          flex: 1,
     } as ViewStyle,
     scrollContent: {
          paddingTop: 20,
     } as ViewStyle,
     closeButton: {
          zIndex: 10,
          marginBottom: 20,
     } as ViewStyle,
     title: {
          ...Typography.text.h2,
          marginBottom: 5,
          color: Colors.primary,
          textAlign: 'left',
     } as TextStyle,
     secondTitle: {
          ...Typography.text.h1,
          fontWeight: 'thin',
          color: Colors.primary,
          textAlign: 'left',
     } as TextStyle,
     section: {
          padding: 15,
          backgroundColor: '#f5f5f5',
          borderRadius: 10,
     } as ViewStyle,
     sectionTitle: {
          ...Typography.text.h3,
          marginBottom: 10,
     } as TextStyle,
     text: {
          ...Typography.text.body,
          lineHeight: 22,
     } as TextStyle,
     recommendationsText: {
          ...Typography.text.body,
          lineHeight: 24,
     } as TextStyle,
     loadingContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
     } as ViewStyle,
     loadingText: {
          ...Typography.text.body,
          marginTop: 10,
          color: Colors.inactive,
     } as TextStyle,
     errorContainer: {
          padding: 20,
          alignItems: 'center',
     } as ViewStyle,
     errorText: {
          ...Typography.text.body,
          color: 'red',
          marginBottom: 15,
          textAlign: 'center',
     } as TextStyle,
     retryButton: {
          backgroundColor: Colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
     } as ViewStyle,
     retryButtonText: {
          ...Typography.text.button,
          color: 'white',
     } as TextStyle,
     trailsContainer: {
          marginBottom: 30,
     } as ViewStyle,
     trailCard: {
          marginBottom: 10,
          borderRadius: 20,
          overflow: 'hidden',
          height: 210,
          elevation: 4,
     } as ViewStyle,
     cardOverlay: {
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: 20,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
     } as ViewStyle,
     trailName: {
          ...Typography.text.h2,
          color: 'white',
     } as TextStyle,
     detailsContainer: {
          marginTop: 5,
     } as ViewStyle,
     detailRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 3,
          gap: 5,
     } as ViewStyle,
     detailText: {
          ...Typography.text.body,
          color: 'white',
          fontSize: 14,
          marginLeft: 10,
     } as TextStyle,
}); 