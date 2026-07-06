import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Appbar, Card, Text, TextInput, Button, IconButton, useTheme, DataTable, Dialog, Portal,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import SimpleChart from '../components/SimpleChart';

export default function WeightScreen() {
  const theme = useTheme();
  const [weights, setWeights] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  useFocusEffect(
    useCallback(() => {
      loadWeights();
    }, [])
  );

  async function loadWeights() {
    try {
      const w = await api.getWeights();
      setWeights(w);
    } catch (e) {
      console.error(e);
    }
  }

  async function addWeight() {
    if (!newWeight) return;
    await api.addWeight(newDate, newWeight);
    setNewWeight('');
    loadWeights();
  }

  async function deleteWeight(id) {
    await api.deleteWeight(id);
    loadWeights();
  }

  const totalPages = Math.ceil(weights.length / PAGE_SIZE);
  const sortedWeights = [...weights].reverse();
  const paginatedWeights = sortedWeights.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const chartData = weights.slice(-30).map((w) => parseFloat(w.WEIGHT) || 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="Body Weight" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleSmall" style={{ marginBottom: 8 }}>Add Entry</Text>
            <View style={styles.addRow}>
              <TextInput
                mode="outlined"
                label="Date"
                value={newDate}
                onChangeText={setNewDate}
                style={[styles.input, { flex: 1.5 }]}
                dense
              />
              <TextInput
                mode="outlined"
                label="Weight"
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                style={[styles.input, { flex: 1 }]}
                dense
              />
              <Button mode="contained" onPress={addWeight} style={styles.addButton} compact>
                Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        {chartData.length > 1 && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleSmall" style={{ marginBottom: 8 }}>Trend</Text>
              <SimpleChart data={chartData} color={theme.colors.primary} height={140} />
            </Card.Content>
          </Card>
        )}

        {weights.length > 0 && (
          <Card style={styles.card} mode="elevated">
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title numeric>Weight</DataTable.Title>
                <DataTable.Title numeric> </DataTable.Title>
              </DataTable.Header>
              {paginatedWeights.map((w) => (
                <DataTable.Row key={w.ID}>
                  <DataTable.Cell>{w.DATE}</DataTable.Cell>
                  <DataTable.Cell numeric>{w.WEIGHT}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <IconButton icon="delete-outline" size={18} onPress={() => deleteWeight(w.ID)} />
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
              <DataTable.Pagination
                page={page}
                numberOfPages={totalPages}
                onPageChange={setPage}
                label={`${page + 1} of ${totalPages}`}
              />
            </DataTable>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  card: { marginBottom: 12, borderRadius: 16 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {},
  addButton: { borderRadius: 20, marginTop: 6 },
});
