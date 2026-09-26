import { StyleSheet, Text, View } from 'react-native';

export default function VerifyOtpScreen() {
  return (
    <View style={styles.container}>
      <Text>auth/verify-otp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
