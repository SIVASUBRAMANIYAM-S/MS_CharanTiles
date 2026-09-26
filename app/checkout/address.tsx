import { StyleSheet, Text, View } from 'react-native';

export default function CheckoutAddressScreen() {
  return (
    <View style={styles.container}>
      <Text>checkout/address</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
