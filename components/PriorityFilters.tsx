// components/PriorityFilters.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import type { Priority } from '@/api/types';

interface Filter {
  label: string;
  value: Priority;
  count: number;
}

interface PriorityFiltersProps {
  filters: Filter[];
  active: Priority;
  onChange: (priority: Priority) => void;
}

// Variants for container
const buttonVariants = tva({
  base: 'px-3 py-1.5 rounded-lg border border-border bg-background',
  variants: {
    priority: {
      ALL: null,
      URGENT: null,
      HIGH: null,
      MEDIUM: null,
      LOW: null,
    },
    selected: {
      true: null,
      false: null,
    },
  },
  compoundVariants: [
    {
      priority: 'URGENT',
      selected: true,
      class: 'bg-priority-urgent',
    },
    {
      priority: 'HIGH',
      selected: true,
      class: 'bg-priority-high border-priority-high-foreground',
    },
    {
      priority: 'MEDIUM',
      selected: true,
      class: 'bg-priority-medium',
    },
    {
      priority: 'LOW',
      selected: true,
      class: 'bg-priority-low border-priority-low-foreground',
    },
    {
      priority: 'ALL',
      selected: true,
      class: 'bg-foreground border-white',
    },
  ],
});

// Variants for text
const textVariants = tva({
  base: 'text-sm font-bold text-foreground',
  variants: {
    priority: {
      ALL: null,
      URGENT: null,
      HIGH: null,
      MEDIUM: null,
      LOW: null,
    },
    selected: {
      true: null,
      false: null,
    },
  },
  compoundVariants: [
    {
      priority: 'URGENT',
      selected: true,
      class: 'text-priority-urgent-foreground',
    },
    {
      priority: 'HIGH',
      selected: true,
      class: 'text-priority-high-foreground',
    },
    {
      priority: 'MEDIUM',
      selected: true,
      class: 'text-priority-medium-foreground',
    },
    {
      priority: 'LOW',
      selected: true,
      class: 'text-priority-low-foreground',
    },
    {
      priority: 'ALL',
      selected: true,
      class: 'text-background',
    },
  ],
});

export const PriorityFilters = ({
  filters,
  active,
  onChange,
}: PriorityFiltersProps) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <HStack space="sm">
        {filters.map((f) => {
          const isActive = active === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => onChange(f.value)}
              className={buttonVariants({
                priority: f.value,
                selected: isActive,
              })}
            >
              <Text
                className={textVariants({
                  priority: f.value,
                  selected: isActive,
                })}
              >
                {f.label} ({f.count})
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </ScrollView>
  );
};
