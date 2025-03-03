import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function OnboardingScreen1() {
     const router = useRouter();

     const handleNext = () => {
          router.push('/onboarding/screen2');
     };

     return (
          <View style={styles.container}>
               <Image
                    source={require('../../assets/images/onboarding1.png')}
                    style={styles.image}
                    resizeMode="cover"
               />
               <View style={styles.contentContainer}>
                    <Text style={styles.title}>Discover New Trails & Adventures</Text>
                    <Text style={styles.description}>
                         Find the best trails, campsites, and hidden gems near you. Let TrailMate be your guide to the great outdoors!
                    </Text>
               </View>

               <View style={styles.progressContainer}>
                    <View style={styles.progressIndicatorActive}></View>
                    <View style={styles.progressIndicatorInactive}></View>
                    <View style={styles.progressIndicatorInactive}></View>
               </View>

               <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Next</Text>
               </TouchableOpacity>
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'flex-end',
     },
     image: {
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
     },
     contentContainer: {
          padding: 20,
          marginTop: 10,
     },
     title: {
          ...Typography.text.h1,
          color: 'white',
          marginBottom: 10,
     },
     description: {
          ...Typography.text.body,
          color: 'white',
          opacity: 0.8,
          lineHeight: 24,
     },
     progressContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 30,
          marginBottom: 10,
     },
     progressIndicatorActive: {
          width: 50,
          height: 4,
          borderRadius: 3,
          backgroundColor: 'white',
          marginHorizontal: 5,
     },
     progressIndicatorInactive: {
          width: 50,
          height: 4,
          borderRadius: 3,
          backgroundColor: Colors.inactive,
          marginHorizontal: 5,
     },
     button: {
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 100,
          alignItems: 'center',
          margin: 20,
          marginBottom: 40,
     },
     buttonText: {
          ...Typography.text.button,
          color: Colors.black,
     },
}); 