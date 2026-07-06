import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Appbar, Card, Text, useTheme, Menu, Button, DataTable } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import SimpleChart from '../components/SimpleChart';

export default function StatsScreen() {
  const theme = useTheme();
  const [exercises, setExercises] = useState([]);
  const [sets, setSets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [exs, allSets] = await Promise.all([api.getExercises(), api.getSets()]);
      setExercises(exs);
      setSets(allSets);
      if (!selected && exs.length > 0) {
        setSelected(exs[0].NAME);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const filteredSets = selected ? sets.filter((s) => s.NAME === selected) : [];
  const totalPages = Math.ceil(filteredSets.length / PAGE_SIZE);
  const paginatedSets = filteredSets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const chartData = filteredSets.slice(-30);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="Statistics" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="chevron-down"
              contentStyle={{ flexDirection: 'row-reverse' }}
              style={styles.selector}
            >
              {selected || 'Select Exercise'}
            </Button>
          }
          contentStyle={{ maxHeight: 400 }}
        >
          {exercises.map((ex) => (
            <Menu.Item
              key={ex.ID}
              title={ex.NAME}
              onPress={() => { setSelected(ex.NAME); setMenuVisible(false); setPage(0); }}
            />
          ))}
        </Menu>

        {chartData.length > 0 && (
          <>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleSmall" style={{ marginBottom: 8 }}>Weight</Text>
                <SimpleChart
                  data={chartData.map((s) => parseFloat(s.WEIGHT) || 0)}
                  color={theme.colors.primary}
                  height={120}
                />
              </Card.Content>
            </Card>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleSmall" style={{ marginBottom: 8 }}>Reps</Text>
                <SimpleChart
                  data={chartData.map((s) => parseInt(s.REPS, 10) || 0)}
                  color={theme.colors.tertiary}
                  height={120}
                  type="bar"
                />
              </Card.Content>
            </Card>
          </>
        )}

        {filteredSets.length > 0 && (
          <Card style={styles.card} mode="elevated">
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title numeric>Weight</DataTable.Title>
                <DataTable.Title numeric>Reps</DataTable.Title>
              </DataTable.Header>
              {paginatedSets.map((s, i) => (
                <DataTable.Row key={s.ID || i}>
                  <DataTable.Cell>{s.DATE}</DataTable.Cell>
                  <DataTable.Cell numeric>{s.WEIGHT}</DataTable.Cell>
                  <DataTable.Cell numeric>{s.REPS}</DataTable.Cell>
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

        {filteredSets.length === 0 && selected && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.secondary }}>
                No data yet for {selected}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  selector: { marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 16 },
});
