import { StyleSheet, Text, View } from 'react-native';

export default function CheckoutConfirmationScreen() {
  return (
    <View style={styles.container}>
      <Text>checkout/confirmation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
