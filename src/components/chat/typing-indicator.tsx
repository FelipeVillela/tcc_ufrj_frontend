import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function TypingIndicator() {
  return (
    <ThemedView type="backgroundElement" style={styles.bubble}>
      <ThemedText type="small" themeColor="textSecondary">
        digitando…
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.three,
    borderBottomLeftRadius: Spacing.half,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
