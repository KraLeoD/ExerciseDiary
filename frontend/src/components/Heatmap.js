import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';

function localDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
      const dateStr = localDateStr(currentDate);
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

function getColor(count, maxCount) {
  if (count === 0) return '#ebedf0';
  const intensity = Math.min(count / Math.max(maxCount, 1), 1);
  if (intensity <= 0.25) return '#9be9a8';
  if (intensity <= 0.5) return '#40c463';
  if (intensity <= 0.75) return '#30a14e';
  return '#216e39';
}

export default function Heatmap({ sets, onDayPress, selectedDate }) {
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

  return (
    <View style={styles.container}>
      {selectedDate && (
        <Text variant="labelSmall" style={[styles.selectedLabel, { color: theme.colors.primary }]}>
          {selectedDate}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((day) => (
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
                      borderWidth: day.date === selectedDate ? 2 : 0,
                      borderColor: day.date === selectedDate ? theme.colors.primary : 'transparent',
                    },
                  ]}
                >
                  <View />
                </TouchableRipple>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  selectedLabel: { marginBottom: 6, fontWeight: '600' },
  grid: { flexDirection: 'row', gap: 2, flexWrap: 'nowrap' },
  week: { flexDirection: 'column', gap: 2 },
  cell: {},
});
