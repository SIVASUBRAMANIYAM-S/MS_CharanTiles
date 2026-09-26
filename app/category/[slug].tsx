import { StyleSheet, Text, View } from 'react-native';

export default function CategoryScreen() {
  return (
    <View style={styles.container}>
      <Text>category/[slug]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
