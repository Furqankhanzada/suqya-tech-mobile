import React, { memo, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react-native';

import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { CustomerInfo } from '@/components/CustomerInfo';
import { TransactionModel } from '@/database/model/Transactions';
import { withObservables } from '@nozbe/watermelondb/react';
import { CustomerModel } from '@/database/model/Customer';

type SectionHeaderProps = {
  section: { title: string; count: number };
};

type TransactionItemProps = {
  transaction: TransactionModel;
  customer: CustomerModel;
  isCompleted: boolean;
  onPress: (transaction: TransactionModel) => void;
};

export const SectionHeader = memo(({ section }: SectionHeaderProps) => (
  <HStack className="items-center justify-between mb-3 bg-background pb-3 border-b border-border">
    <HStack className="items-center" space="sm">
      <Icon as={MapPin} className="w-4 h-4 text-muted-foreground" />
      <Text className="text-foreground font-medium">{section.title}</Text>
    </HStack>
    <Badge className="bg-transparent border border-border px-3 rounded-full">
      <BadgeText className="text-foreground text-xs">
        {section.count} customers
      </BadgeText>
    </Badge>
  </HStack>
));

export const ListEmptyComponent = memo(
  () => {

    return (
      <VStack className="items-center py-20" space="lg">
        <Icon as={Search} className="w-12 h-12 text-muted-foreground" />
        <Text className="text-muted-foreground">No customers found</Text>
      </VStack>
    );
  },
);

const TransactionItemBase = ({
  transaction,
  onPress,
}: TransactionItemProps) => {
  const isCompleted = useCallback((transaction: TransactionModel) => {
    return transaction.bottleGiven > 0 || transaction.bottleTaken > 0;
  }, []);

  return (
    <Pressable onPress={() => onPress(transaction)} className="mb-3">
      <CustomerInfo
        priority={transaction.priority}
        isCompleted={isCompleted(transaction)}
        customer={transaction.customer}
      />
    </Pressable>
  );
};

export const TransactionItem = withObservables(
  ['transaction'],
  ({ transaction }) => ({
    transaction: transaction
  }),
)(TransactionItemBase);
