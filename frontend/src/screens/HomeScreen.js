import React, { useState, useCallback } from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import {
  Appbar, Card, Text, useTheme, Surface, TouchableRipple,
  Portal, Modal, Button, IconButton,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import Heatmap from '../components/Heatmap';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const [exercises, setExercises] = useState([]);
  const [sets, setSets] = useState([]);
  const [groups, setGroups] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [exs, allSets] = await Promise.all([
        api.getExercises(),
        api.getSets(),
      ]);
      setExercises(exs);
      setSets(allSets);

      const grouped = {};
      exs.forEach((ex) => {
        const group = ex.GR || 'Ungrouped';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(ex);
      });
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => (a.PLACE || '').localeCompare(b.PLACE || ''));
      });
      setGroups(grouped);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const todaySets = sets.filter((s) => s.DATE === today);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="ExerciseDiary" />
        <Appbar.Action icon="plus" onPress={() => navigation.navigate('ExerciseEdit', { id: 'new' })} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Activity</Text>
            <Heatmap sets={sets} onDayPress={(date) => navigation.navigate('Workout', { date })} />
          </Card.Content>
        </Card>

        {todaySets.length > 0 && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Today</Text>
              {todaySets.map((s, i) => (
                <Surface key={i} style={styles.setChip} elevation={1}>
                  <Text variant="bodyMedium">{s.NAME}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                    {s.WEIGHT}kg × {s.REPS}
                  </Text>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        <Text variant="titleMedium" style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>
          Exercises
        </Text>
        {Object.entries(groups).map(([group, exs]) => (
          <Card key={group} style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleSmall" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                {group}
              </Text>
              {exs.map((ex) => (
                <TouchableRipple
                  key={ex.ID}
                  onPress={() => setSelectedExercise(ex)}
                  style={styles.exerciseRow}
                >
                  <View style={styles.exerciseRowInner}>
                    <Text variant="bodyLarge">{ex.NAME}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                      {ex.WEIGHT}kg × {ex.REPS}
                    </Text>
                  </View>
                </TouchableRipple>
              ))}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={!!selectedExercise}
          onDismiss={() => setSelectedExercise(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {selectedExercise && (
            <View>
              <View style={styles.modalHeader}>
                <Text variant="headlineSmall" style={{ flex: 1 }}>{selectedExercise.NAME}</Text>
                <IconButton icon="close" size={20} onPress={() => setSelectedExercise(null)} />
              </View>

              {!!selectedExercise.IMAGE && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: selectedExercise.IMAGE }}
                    style={styles.exerciseImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {!!selectedExercise.DESCR && (
                <Text variant="bodyMedium" style={styles.description}>
                  {selectedExercise.DESCR}
                </Text>
              )}

              <Surface style={styles.defaultsRow} elevation={1}>
                <View style={styles.defaultItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>Group</Text>
                  <Text variant="bodyLarge">{selectedExercise.GR || '—'}</Text>
                </View>
                <View style={styles.defaultItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>Weight</Text>
                  <Text variant="bodyLarge">{selectedExercise.WEIGHT}kg</Text>
                </View>
                <View style={styles.defaultItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>Reps</Text>
                  <Text variant="bodyLarge">{selectedExercise.REPS}</Text>
                </View>
              </Surface>

              <Button
                mode="contained"
                icon="pencil"
                onPress={() => {
                  const id = selectedExercise.ID;
                  setSelectedExercise(null);
                  navigation.navigate('ExerciseEdit', { id });
                }}
                style={styles.editButton}
              >
                Edit Exercise
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  card: { marginBottom: 12, borderRadius: 16 },
  sectionTitle: { marginBottom: 12, fontWeight: '600' },
  setChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  exerciseRow: { paddingVertical: 10, paddingHorizontal: 4, borderRadius: 8 },
  exerciseRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modal: {
    margin: 20,
    borderRadius: 24,
    padding: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  defaultsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  defaultItem: {
    flex: 1,
    alignItems: 'center',
  },
  editButton: {
    borderRadius: 28,
  },
});
