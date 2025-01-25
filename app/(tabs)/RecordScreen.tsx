import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as SQLite from 'expo-sqlite';

//const db = SQLite.openDatabaseAsync('recordings.db');

// Initialize database and create table
const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('myDatabase.db');
  return db;
};

const saveRecording = async (title: string, uri: string) => {
  const db = await initDatabase();
  await db.runAsync('BEGIN TRANSACTION');
  await db.runAsync('CREATE TABLE IF NOT EXISTS recordings (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, uri TEXT);');
  await db.runAsync('INSERT INTO recordings (title, uri) values (?, ?)', [title, uri]);
  await db.runAsync('COMMIT');
};

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    setIsRecording(false);
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    console.log('Recording stopped and stored at', uri);

    if (title && uri) {
      await saveRecording(title, uri);
    }

    setRecording(null);
    setTitle('');
  };

  return (
    <View style={styles.container}>
      <Text>Record Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter recording title"
        value={title}
        onChangeText={setTitle}
      />
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 8,
  },
}); 