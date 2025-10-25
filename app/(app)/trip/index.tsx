import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Search,
  MapPin,
  User,
  CheckCircle,
  Clock,
  Truck,
  LogOut,
  Sun,
} from 'lucide-react-native';

import { format } from 'date-fns';

import { Q } from '@nozbe/watermelondb';
import { database } from '@/database';
import { isWeb } from '@gluestack-ui/utils/nativewind-utils';
import { sanitizeLikeString } from '@nozbe/watermelondb/QueryDescription';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { Icon, CalendarDaysIcon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon } from '@/components/ui/button';
import { router } from 'expo-router';
import { cn } from '@/components/utils';
import { useLogout } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { FlatList } from 'react-native';
import { syncTrips } from '@/database/sync/trip';
import type { TripModel } from '@/database/model/Trip';
import { useAuthStore } from '@/store/useAuthStore';

function TripsScreen() {
  const { userId } = useAuthStore();
  const [trips, setTrips] = useState<TripModel[]>([]);
  const [isPending, startTransition] = useTransition();
  const { mutate: signOut, isPending: isLoading } = useLogout();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTrips = useCallback(() => {
    const filters: Q.Clause[] = [Q.sortBy('created_at', Q.desc)];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      const safeTerm = sanitizeLikeString(search);

      if (isWeb) {
        // ✅ Web: LokiJS filtering of nested arrays
        filters.push(
          Q.unsafeLokiExpr({
            $or: [
              { areas: { $containsString: safeTerm } },
              { employee: { $containsString: safeTerm } },
            ],
          }),
        );
      } else {
        // ✅ Native: SQLite JSON filtering with additional safety
        const escapedTerm = safeTerm.replace(/'/g, "''").substring(0, 100);
        filters.push(
          Q.unsafeSqlExpr(
            `EXISTS (
                SELECT 1
                FROM json_each(areas)
                WHERE LOWER(json_each.value ->> '$.name') LIKE '%${escapedTerm}%'
              )
              OR
              EXISTS (
                SELECT 1
                FROM json_each(employee)
                WHERE LOWER(json_each.value ->> '$.name') LIKE '%${escapedTerm}%'
              )`,
          ),
        );
      }
    }

    const observable = database
      .get<TripModel>('trips')
      .query(...filters)
      .observe();

    return observable.subscribe((trips) => {
      setTrips(trips);
    });
  }, [searchTerm]);

  useEffect(() => {
    const subs = fetchTrips();
    return () => subs.unsubscribe();
  }, [fetchTrips]);

  useEffect(() => {
    startTransition(() => syncTrips(userId));
  }, [userId]);

  const total = trips.length;
  const inProgress = trips.filter((t) => t.status === 'inprogress').length;
  const completed = trips.filter((t) => t.status === 'complete').length;

  const handleTripPress = (trip: TripModel) => {
    router.push(`/trip/${trip.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <VStack className="flex-1">
        {/* Header */}
        <Box className="px-6 py-4">
          <HStack className="items-center justify-between">
            <VStack>
              <Heading className="text-2xl font-bold text-foreground">
                Delivery Trips
              </Heading>
              <Text className="text-muted-foreground text-sm">
                Manage and track all delivery trips
              </Text>
            </VStack>
            <HStack className="items-center" space="sm">
              <Button
                className="border-border p-2.5 rounded-full bg-input/30"
                onPress={() => signOut()}
                variant="outline"
              >
                {isLoading ? (
                  <Spinner size="small" color="grey" />
                ) : (
                  <ButtonIcon as={LogOut} className="text-foreground" />
                )}
              </Button>
              <Button
                className="border-border p-2.5 rounded-full bg-input/30"
                onPress={() => console.log('theme')}
                variant="outline"
              >
                <ButtonIcon as={Sun} className="text-foreground" />
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Summary Cards */}
        <Box className="px-6 py-4">
          <HStack space="md">
            <Card className="flex-1 p-4 border border-border bg-transparent">
              <VStack className="items-center" space="xs">
                <Text className="text-foreground text-3xl font-bold">
                  {total}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Total Trips
                </Text>
              </VStack>
            </Card>
            <Card className="flex-1 p-4 border border-border bg-transparent">
              <VStack className="items-center" space="xs">
                <Text className="text-orange-600 text-3xl font-bold">
                  {inProgress}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  In Progress
                </Text>
              </VStack>
            </Card>
            <Card className="flex-1 p-4 border border-border bg-transparent">
              <VStack className="items-center" space="xs">
                <Text className="text-green-600 text-3xl font-bold">
                  {completed}
                </Text>
                <Text className="text-muted-foreground text-sm">Completed</Text>
              </VStack>
            </Card>
          </HStack>
        </Box>

        {/* Search Bar */}
        <Box className={cn('px-6', { 'pb-4': trips.length })}>
          <Input className="bg-input-background border-border">
            <InputSlot className="pl-3">
              <InputIcon
                as={Search}
                className="w-5 h-5 text-muted-foreground"
              />
            </InputSlot>
            <InputField
              placeholder="Search trips by area, employee, or date..."
              placeholderTextColor="#9CA3AF"
              value={searchTerm}
              onChangeText={setSearchTerm}
              className="text-foreground"
            />
          </Input>
        </Box>

        <FlatList
          className="flex-1 px-6"
          contentContainerClassName="gap-3 grow"
          showsVerticalScrollIndicator={false}
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item: trip }) => {
            return (
              <Pressable key={trip.id} onPress={() => handleTripPress(trip)}>
                <Card className="bg-transparent border border-border p-6 rounded-xl">
                  <VStack space="lg">
                    {/* Header with Date and Status */}
                    <HStack className="items-center justify-between">
                      <HStack className="items-center" space="sm">
                        <Icon
                          as={CalendarDaysIcon}
                          className="w-5 h-5 text-muted-foreground"
                        />
                        <Text className="text-foreground font-bold text-lg">
                          {format(new Date(trip.tripAt), 'dd MMM yyyy')}
                        </Text>
                      </HStack>
                      <Badge
                        className={cn(
                          'rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
                          {
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100':
                              trip.status === 'Complete',
                          },
                        )}
                      >
                        <HStack className="items-center" space="xs">
                          <Icon
                            as={
                              trip.status === 'Complete' ? CheckCircle : Clock
                            }
                            className="w-4 h-4 text-foreground"
                          />
                          <BadgeText className="text-foreground text-xs font-medium">
                            {trip.status}
                          </BadgeText>
                        </HStack>
                      </Badge>
                    </HStack>

                    {/* Areas */}
                    <VStack space="sm">
                      <HStack className="items-center" space="sm">
                        <Icon
                          as={MapPin}
                          className="w-4 h-4 text-muted-foreground"
                        />
                        <Text className="text-muted-foreground font-medium text-sm">
                          AREAS
                        </Text>
                      </HStack>
                      <HStack space="sm" className="flex-wrap pl-5">
                        {trip.areas.map((area, index) => (
                          <Badge
                            key={index}
                            className="bg-transparent border border-border px-3 py-1 rounded-full"
                          >
                            <BadgeText className="text-foreground text-xs">
                              {area.name}
                            </BadgeText>
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>

                    {/* Employees */}
                    <VStack space="sm">
                      <HStack className="items-center" space="sm">
                        <Icon as={User} className="w-4 h-4 text-gray-400" />
                        <Text className="text-muted-foreground font-medium text-sm">
                          EMPLOYEES
                        </Text>
                      </HStack>
                      <VStack space="xs" className="pl-6">
                        <Text className="text-foreground font-bold text-sm">
                          {trip.employee[0].name}
                        </Text>
                        {trip.employee.length > 1 && (
                          <Text className="text-muted-foreground text-xs">
                            +{trip.employee.length - 1} more employee
                            {trip.employee.length > 2 ? 's' : ''}
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  </VStack>
                </Card>
              </Pressable>
            );
          }}
          ListEmptyComponent={() => {
            if (isPending) {
              return (
                <VStack space="md" className="pb-4 pt-4">
                  <Card className="bg-transparent border border-border rounded-xl">
                    <Skeleton
                      variant="sharp"
                      className="h-[232px] rounded-xl"
                      startColor="bg-background-100 dark:bg-background-0"
                      speed={4}
                    />
                  </Card>
                  <Card className="bg-transparent border border-border rounded-xl">
                    <Skeleton
                      variant="sharp"
                      className="h-[232px] rounded-xl"
                      startColor="bg-background-100 dark:bg-background-0"
                      speed={4}
                    />
                  </Card>
                  <Card className="bg-transparent border border-border rounded-xl">
                    <Skeleton
                      variant="sharp"
                      className="h-[232px] rounded-xl"
                      startColor="bg-background-100 dark:bg-background-0"
                      speed={4}
                    />
                  </Card>
                </VStack>
              );
            }
            return (
              <VStack className="flex-1 justify-center items-center" space="lg">
                <Icon as={Truck} className="w-20 h-20 text-gray-600" />
                <VStack className="items-center" space="xs">
                  <Text className="text-gray-400 text-xl font-medium">
                    No trips found
                  </Text>
                  <Text className="text-gray-500 text-center px-6">
                    {searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'No delivery trips found'}
                  </Text>
                </VStack>
              </VStack>
            );
          }}
        />
      </VStack>
    </SafeAreaView>
  );
}

export default TripsScreen;
