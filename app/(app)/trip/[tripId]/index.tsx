import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { SectionList } from 'react-native';

import { VStack } from '@/components/ui/vstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import AppHeader from '@/components/AppHeader';
import { router, useLocalSearchParams } from 'expo-router';
import type { Priority } from '@/api/types';
import { TransactionModel } from '@/database/model/Transactions';
import {
  ListEmptyComponent,
  SectionHeader,
  TransactionItem,
} from '@/components/TransactionList';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Card } from '@/components/ui/card';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Search } from 'lucide-react-native';
import { PriorityFilters } from '@/components/PriorityFilters';
import {
  fetchPriorityCounts,
  fetchTransactionsObservable,
  defaultCounts,
} from '@/database/service/transaction';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '@/database';
import type { TripModel } from '@/database/model/Trip';
import { format } from 'date-fns';

type TripScreenProps = {
  trip: TripModel;
  tripId: string;
};

function TripScreen({ trip, tripId }: TripScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [count, setCount] = useState(defaultCounts);
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [priority, setPriority] = useState<Priority>('ALL');

  const fetchCounts = useCallback(async () => {
    const counts = await fetchPriorityCounts(tripId);
    setCount(counts);
  }, [tripId]);

  const fetchTransactions = useCallback(() => {
    const observable = fetchTransactionsObservable(
      tripId,
      priority,
      searchTerm,
    );
    return observable.subscribe(async (transactions) => {
      setTransactions(transactions);
      fetchCounts();
    });
  }, [tripId, searchTerm, priority]);

  useEffect(() => {
    const subs = fetchTransactions();
    return () => subs.unsubscribe();
  }, [fetchTransactions]);

  const groupedTransactions = useMemo(() => {
    const grouped = transactions.reduce((acc, transaction) => {
      const groupKey = transaction.block;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(transaction);
      return acc;
    }, {} as Record<string, TransactionModel[]>);

    return grouped;
  }, [transactions]);

  // SectionList formatted data
  const sectionListData = useMemo(() => {
    return Object.entries(groupedTransactions).map(
      ([blockName, blockTransactions]) => ({
        title: blockName,
        data: blockTransactions,
        count: blockTransactions.length,
      }),
    );
  }, [groupedTransactions]);

  const priorityFilters = useMemo(() => {
    const PRIORITY_LABELS: Record<Priority, string> = {
      ALL: 'All',
      URGENT: 'Urgent',
      HIGH: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
    };

    return (Object.keys(PRIORITY_LABELS) as Priority[]).map((priority) => ({
      label: PRIORITY_LABELS[priority],
      value: priority,
      count: count[priority],
    }));
  }, [count]);

  const isCompleted = useCallback((transaction: TransactionModel) => {
    return transaction.bottleGiven > 0 || transaction.bottleTaken > 0;
  }, []);

  const onItemPress = (transaction: TransactionModel) => {
    router.push(`/trip/${transaction.trip.id}/transaction/${transaction.id}`);
  };

  const totalCustomers = transactions.length || 0;
  const completedCustomers = transactions.filter(isCompleted).length || 0;
  const pendingCustomers = totalCustomers - completedCustomers;

  const renderSectionHeader = useCallback(({ section }: any) => {
    return <SectionHeader section={section} />;
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: TransactionModel }) => (
      <TransactionItem transaction={item} onPress={onItemPress} />
    ),
    [],
  );

  const renderEmptyComponent = useCallback(() => {
    return <ListEmptyComponent />;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <VStack className="flex-1 px-6">
        <AppHeader showBackButton={true} />
        <VStack className="flex-1 py-4" space="xl">
          <VStack space="lg">
            <VStack space="xs">
              <Heading className="text-foreground text-2xl font-bold">
                {format(new Date(trip.tripAt), 'dd MMM yyyy')}
              </Heading>
              <Text className="text-sm text-muted-foreground">
                {trip.areas.map((a) => a.name).join(', ')}
              </Text>
            </VStack>

            <HStack className="w-full" space="md">
              <Card className="flex-1 p-4 border border-border bg-transparent">
                <VStack className="items-center" space="xs">
                  <Text className="text-foreground text-2xl font-bold">
                    {totalCustomers}
                  </Text>
                  <Text className="text-sm text-muted-foreground">Total</Text>
                </VStack>
              </Card>
              <Card className="flex-1 p-4 border border-border bg-transparent">
                <VStack className="items-center" space="xs">
                  <Text className="text-orange-600 text-2xl font-bold">
                    {pendingCustomers}
                  </Text>
                  <Text className="text-sm text-muted-foreground">Pending</Text>
                </VStack>
              </Card>
              <Card className="flex-1 p-4 border border-border bg-transparent">
                <VStack className="items-center" space="xs">
                  <Text className="text-green-600 text-2xl font-bold">
                    {completedCustomers}
                  </Text>
                  <Text className="text-sm text-muted-foreground">Done</Text>
                </VStack>
              </Card>
            </HStack>

            <VStack space="md">
              <Input className="bg-input-background border-border">
                <InputSlot className="pl-3">
                  <InputIcon
                    as={Search}
                    className="w-5 h-5 text-muted-foreground"
                  />
                </InputSlot>
                <InputField
                  placeholder="Search by name or area..."
                  placeholderTextColor="#9CA3AF"
                  onChangeText={setSearchTerm}
                  className="text-foreground"
                />
              </Input>
              <PriorityFilters
                filters={priorityFilters}
                active={priority}
                onChange={setPriority}
              />
            </VStack>
          </VStack>
          <SectionList
            className="flex-1"
            contentContainerClassName="grow gap-3"
            sections={sectionListData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
          />
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}

// Enhance TripScreen with WatermelonDB observables
const ObservedTripScreen = withObservables(
  ['tripId'],
  ({ tripId }: { tripId: string }) => ({
    trip: database.get<TripModel>('trips').findAndObserve(tripId),
  }),
)(TripScreen);

export default function TripScreenWrapper() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  // Pass states down into HOC props
  return <ObservedTripScreen tripId={tripId} />;
}
