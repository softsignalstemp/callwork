import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error.message + '\n\n' + (this.state.error.stack ?? '');
      return (
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ Crash</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.msg} selectable>{msg}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.btn} onPress={() => Clipboard.setString(msg)}>
            <Text style={styles.btnText}>Copia errore</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07070F', padding: 20, paddingTop: 60 },
  title: { color: '#F87171', fontSize: 22, fontWeight: '900', marginBottom: 12 },
  scroll: { flex: 1, backgroundColor: '#13132A', borderRadius: 12, padding: 14 },
  msg: { color: '#F0EEFF', fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  btn: { backgroundColor: '#8B5CF6', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
