import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar, Card, Text, TextInput, Button, IconButton, Chip, useTheme,
  Menu, Dialog, Portal,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function WorkoutScreen({ route }) {
  const theme = useTheme();
  const [date, setDate] = useState(route?.params?.date || formatDate(new Date()));
  const [sets, setSets] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dirty, setDirty] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [])
  );

  useEffect(() => {
    loadSets();
    setDirty(false);
  }, [date]);

  async function loadExercises() {
    try {
      const exs = await api.getExercises();
      setExercises(exs);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadSets() {
    try {
      const s = await api.getSets(date);
      setSets(s.map((set, i) => ({ ...set, _key: `${set.ID || i}-${Date.now()}` })));
    } catch (e) {
      console.error(e);
    }
  }

  function prevDay() {
    const d = parseDate(date);
    d.setDate(d.getDate() - 1);
    setDate(formatDate(d));
  }

  function nextDay() {
    const d = parseDate(date);
    d.setDate(d.getDate() + 1);
    setDate(formatDate(d));
  }

  function addExercise(ex) {
    setSets((prev) => [
      ...prev,
      { _key: `new-${Date.now()}-${Math.random()}`, NAME: ex.NAME, WEIGHT: ex.WEIGHT, REPS: ex.REPS, COLOR: '' },
    ]);
    setMenuVisible(false);
    setDirty(true);
  }

  function addGroup(group) {
    const groupExs = exercises.filter((e) => e.GR === group);
    const newSets = groupExs.map((ex, i) => ({
      _key: `new-${Date.now()}-${i}`,
      NAME: ex.NAME,
      WEIGHT: ex.WEIGHT,
      REPS: ex.REPS,
      COLOR: '',
    }));
    setSets((prev) => [...prev, ...newSets]);
    setMenuVisible(false);
    setDirty(true);
  }

  function updateSet(index, field, value) {
    setSets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setDirty(true);
  }

  function removeSet(index) {
    setSets((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  }

  async function save() {
    try {
      const payload = sets.map((s) => ({
        NAME: s.NAME,
        COLOR: s.COLOR || '',
        WEIGHT: String(s.WEIGHT),
        REPS: parseInt(s.REPS, 10) || 0,
      }));
      await api.saveDaySets(date, payload);
      setDirty(false);
      loadSets();
    } catch (e) {
      console.error(e);
    }
  }

  const groups = [...new Set(exercises.map((e) => e.GR).filter(Boolean))];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Action icon="chevron-left" onPress={prevDay} />
        <Appbar.Content title={date} titleStyle={{ textAlign: 'center' }} />
        <Appbar.Action icon="chevron-right" onPress={nextDay} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {sets.map((s, i) => (
          <Card key={s._key} style={styles.setCard} mode="outlined">
            <Card.Content style={styles.setContent}>
              <Text variant="titleSmall" style={styles.setName}>{s.NAME}</Text>
              <View style={styles.setInputs}>
                <TextInput
                  mode="outlined"
                  label="Weight"
                  value={String(s.WEIGHT ?? '')}
                  onChangeText={(v) => updateSet(i, 'WEIGHT', v)}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  dense
                />
                <TextInput
                  mode="outlined"
                  label="Reps"
                  value={String(s.REPS ?? '')}
                  onChangeText={(v) => updateSet(i, 'REPS', v)}
                  keyboardType="number-pad"
                  style={styles.input}
                  dense
                />
                <IconButton icon="close" size={20} onPress={() => removeSet(i)} />
              </View>
            </Card.Content>
          </Card>
        ))}

        <View style={styles.addRow}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" icon="plus" onPress={() => setMenuVisible(true)}>
                Add Exercise
              </Button>
            }
            contentStyle={{ maxHeight: 400 }}
          >
            {groups.map((group) => (
              <React.Fragment key={group}>
                <Menu.Item
                  title={`▸ All: ${group}`}
                  onPress={() => addGroup(group)}
                  titleStyle={{ fontWeight: '600', color: theme.colors.primary }}
                />
                {exercises
                  .filter((e) => e.GR === group)
                  .map((ex) => (
                    <Menu.Item key={ex.ID} title={`   ${ex.NAME}`} onPress={() => addExercise(ex)} />
                  ))}
              </React.Fragment>
            ))}
            {exercises.filter((e) => !e.GR).map((ex) => (
              <Menu.Item key={ex.ID} title={ex.NAME} onPress={() => addExercise(ex)} />
            ))}
          </Menu>
        </View>
      </ScrollView>

      {dirty && (
        <Button
          mode="contained"
          style={styles.saveButton}
          onPress={save}
          icon="content-save"
        >
          Save Workout
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 80 },
  setCard: { marginBottom: 8, borderRadius: 12 },
  setContent: { paddingVertical: 8 },
  setName: { marginBottom: 6 },
  setInputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1 },
  addRow: { marginTop: 12, alignItems: 'flex-start' },
  saveButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 28,
  },
});
