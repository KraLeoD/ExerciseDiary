import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';

function getWeeksData(sets) {
  const counts = {};
  sets.forEach((s) => {
    if (s.DATE) {
      counts[s.DATE] = (counts[s.DATE] || 0) + 1;
    }
  });

  const today = new Date();
  const weeks = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (52 * 7));

  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  while (currentDate <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        count: counts[dateStr] || 0,
        future: currentDate > today,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function getColor(count, maxCount, primaryColor) {
  if (count === 0) return '#e0e0e0';
  const intensity = Math.min(count / Math.max(maxCount, 1), 1);
  if (intensity <= 0.25) return '#c5cae9';
  if (intensity <= 0.5) return '#7986cb';
  if (intensity <= 0.75) return '#3f51b5';
  return '#1a237e';
}

export default function Heatmap({ sets, onDayPress }) {
  const theme = useTheme();
  const weeks = getWeeksData(sets);
  const maxCount = Math.max(...sets.reduce((acc, s) => {
    if (s.DATE) {
      const idx = acc.findIndex((x) => x.date === s.DATE);
      if (idx >= 0) acc[idx].count++;
      else acc.push({ date: s.DATE, count: 1 });
    }
    return acc;
  }, []).map((x) => x.count), 1);

  const CELL_SIZE = 10;
  const GAP = 2;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.week}>
            {week.map((day, di) => (
              <TouchableRipple
                key={day.date}
                onPress={() => !day.future && onDayPress && onDayPress(day.date)}
                style={[
                  styles.cell,
                  {
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: day.future ? 'transparent' : getColor(day.count, maxCount),
                    borderRadius: 2,
                  },
                ]}
              >
                <View />
              </TouchableRipple>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  grid: { flexDirection: 'row', gap: 2, flexWrap: 'nowrap', overflow: 'scroll' },
  week: { flexDirection: 'column', gap: 2 },
  cell: {},
});
