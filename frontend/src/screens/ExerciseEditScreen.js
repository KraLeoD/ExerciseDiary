import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, useTheme, Dialog, Portal, Text } from 'react-native-paper';
import { api } from '../api/client';

export default function ExerciseEditScreen({ route, navigation }) {
  const theme = useTheme();
  const { id } = route.params;
  const isNew = id === 'new';

  const [form, setForm] = useState({
    GR: '', PLACE: '', NAME: '', DESCR: '', IMAGE: '', COLOR: '', WEIGHT: '0', REPS: '0',
  });
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.getExercise(id).then((ex) => {
        setForm({
          GR: ex.GR || '',
          PLACE: ex.PLACE || '',
          NAME: ex.NAME || '',
          DESCR: ex.DESCR || '',
          IMAGE: ex.IMAGE || '',
          COLOR: ex.COLOR || '',
          WEIGHT: String(ex.WEIGHT ?? '0'),
          REPS: String(ex.REPS ?? '0'),
        });
      });
    }
  }, [id]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    const data = {
      ...form,
      WEIGHT: form.WEIGHT,
      REPS: parseInt(form.REPS, 10) || 0,
    };

    if (isNew) {
      await api.createExercise(data);
    } else {
      await api.updateExercise(id, data);
    }
    navigation.goBack();
  }

  async function deleteExercise() {
    await api.deleteExercise(id);
    setDeleteDialogVisible(false);
    navigation.goBack();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          mode="outlined"
          label="Name"
          value={form.NAME}
          onChangeText={(v) => update('NAME', v)}
          style={styles.field}
        />
        <TextInput
          mode="outlined"
          label="Group"
          value={form.GR}
          onChangeText={(v) => update('GR', v)}
          style={styles.field}
        />
        <TextInput
          mode="outlined"
          label="Sort Order"
          value={form.PLACE}
          onChangeText={(v) => update('PLACE', v)}
          style={styles.field}
        />
        <TextInput
          mode="outlined"
          label="Description"
          value={form.DESCR}
          onChangeText={(v) => update('DESCR', v)}
          multiline
          numberOfLines={3}
          style={styles.field}
        />
        <TextInput
          mode="outlined"
          label="Image URL"
          value={form.IMAGE}
          onChangeText={(v) => update('IMAGE', v)}
          style={styles.field}
        />
        <View style={styles.row}>
          <TextInput
            mode="outlined"
            label="Default Weight"
            value={form.WEIGHT}
            onChangeText={(v) => update('WEIGHT', v)}
            keyboardType="decimal-pad"
            style={[styles.field, { flex: 1 }]}
          />
          <View style={{ width: 12 }} />
          <TextInput
            mode="outlined"
            label="Default Reps"
            value={form.REPS}
            onChangeText={(v) => update('REPS', v)}
            keyboardType="number-pad"
            style={[styles.field, { flex: 1 }]}
          />
        </View>

        <Button mode="contained" onPress={save} style={styles.button} icon="check">
          {isNew ? 'Create Exercise' : 'Save Changes'}
        </Button>

        {!isNew && (
          <Button
            mode="outlined"
            onPress={() => setDeleteDialogVisible(true)}
            style={styles.button}
            textColor={theme.colors.error}
            icon="delete"
          >
            Delete Exercise
          </Button>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Exercise</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete "{form.NAME}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={deleteExercise} textColor={theme.colors.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  field: { marginBottom: 12 },
  row: { flexDirection: 'row' },
  button: { marginTop: 12, borderRadius: 28 },
});
