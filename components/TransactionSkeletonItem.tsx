import { memo } from 'react';
import { Card } from './ui/card';
import { HStack } from './ui/hstack';
import { Skeleton } from './ui/skeleton';
import { VStack } from './ui/vstack';

export const TransactionSkeletonItem = memo(() => {
  return (
    <VStack space="xl">
      <HStack className="items-center justify-between">
        <HStack className="items-center" space="sm">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-3 w-16 rounded" />
        </HStack>
        <Skeleton className="h-5 w-16 rounded-full" />
      </HStack>
      <Card className="p-4 border border-border">
        <HStack space="lg" className="justify-between items-start">
          <VStack className="flex-1" space="md">
            <VStack space="xs">
              <HStack space="lg" className="items-center">
                <Skeleton className="w-4 h-4 rounded-full" /> 
                <Skeleton className="h-3 w-16 rounded" />
              </HStack>
              <Skeleton className="h-5 w-40 rounded-full ml-5" />
            </VStack>

            <VStack space="xs">
              <HStack space="lg" className="items-center">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-3  w-16 rounded" />
              </HStack>
              <Skeleton className="h-5 w-28 rounded-full ml-5" />
            </VStack>

            <VStack space="xs">
              <HStack space="lg" className="items-center">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-3 w-16 rounded" />
              </HStack>
              <Skeleton className="h-5 w-44 rounded-full ml-5" />
            </VStack>
          </VStack>

          <VStack space="sm" className="items-end">
            <Skeleton className="h-5 w-16 rounded-full" />
          </VStack>
        </HStack>
      </Card>
    </VStack>
  );
});
