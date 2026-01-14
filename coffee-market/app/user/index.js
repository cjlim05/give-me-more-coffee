import Header from '@/components/Header';
import { StyleSheet, Text, View } from 'react-native';

export default function UserScreen() {
  return (
    <View style={styles.container}>
      <Header title="My Page" />

      <View style={styles.content}>
        <Text>유저 화면</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
