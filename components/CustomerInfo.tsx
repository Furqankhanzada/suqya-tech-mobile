import { MapPin, User, HomeIcon, Navigation } from 'lucide-react-native';
import { Card } from './ui/card';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';
import { Badge, BadgeText } from './ui/badge';
import { Text } from './ui/text';
import { PriorityBadge } from './PriorityBadge';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { Priority } from '@/api/types';
import { memo, useRef } from 'react';
import LocationPicker, { LocationPickerRef } from './LocationPicker';
import { CustomerModel } from '@/database/model/Customer';
import { withObservables } from '@nozbe/watermelondb/react';
import { Relation } from '@nozbe/watermelondb';

type CustomerInfoProps = {
  priority: Priority;
  isCompleted: boolean;
  customer: Relation<CustomerModel>;
};

interface CustomerInfoBaseProps {
  priority: Priority;
  isCompleted: boolean;
  customer: CustomerModel;
}

export const CustomerInfoBase = memo<CustomerInfoBaseProps>(({
  priority,
  isCompleted,
  customer
}) => {
  const locationPickerRef = useRef<LocationPickerRef>(null);

  const handleOpenLocationPicker = () => {
    locationPickerRef.current?.open();
  };

  return (
    <Card className="p-4 bg-transparent border border-border">
      <HStack space="lg" className="justify-between items-start">
        <VStack className="flex-1" space="sm">
          <HStack className="items-center" space="lg">
            <Icon as={User} className="w-4 h-4 text-muted-foreground" />
            <Text className="text-muted-foreground font-medium text-sm">
              Name
            </Text>
          </HStack>

          <HStack space="lg" className="flex-wrap pl-5">
            <Badge className="bg-transparent border border-border px-3 py-1 rounded-full">
              <BadgeText className="text-foreground text-base font-semibold capitalize">
                {customer.name}
              </BadgeText>
            </Badge>
          </HStack>

          <HStack className="items-center" space="lg">
            <Icon as={MapPin} className="w-4 h-4 text-muted-foreground" />
            <Text className="text-muted-foreground font-medium text-sm">
              Area
            </Text>
          </HStack>
          <HStack space="lg" className="flex-wrap pl-5">
            <Badge className="bg-transparent border border-border px-3 py-1 rounded-full">
              <BadgeText className="text-foreground text-base font-semibold capitalize">
                {customer.area.name}
              </BadgeText>
            </Badge>
          </HStack>

          <HStack className="items-center" space="lg">
            <Icon as={HomeIcon} className="w-4 h-4 text-muted-foreground" />
            <Text className="text-muted-foreground font-medium text-sm">
              Address
            </Text>
          </HStack>

          <HStack space="lg" className="flex-wrap pl-5">
            <Badge className="bg-transparent border border-border px-3 py-1 rounded-full">
              <BadgeText className="text-foreground text-base font-semibold capitalize">
                {customer.address}
              </BadgeText>
            </Badge>
          </HStack>
        </VStack>

        <VStack space="sm" className="items-end">
          {isCompleted ? (
            <Badge className="bg-green-600 px-2 py-1 rounded">
              <BadgeText className="text-white text-xs font-semibold">
                Completed
              </BadgeText>
            </Badge>
          ) : (
            <PriorityBadge priority={priority} />
          )}
          <Pressable
            onPress={handleOpenLocationPicker}
            className="p-2 rounded-lg bg-muted/50 border border-border"
          >
            <Icon as={Navigation} className="w-4 h-4 text-muted-foreground" />
          </Pressable>
        </VStack>
      </HStack>
      <LocationPicker ref={locationPickerRef} customer={customer} />
    </Card>
  );
},
);

export const CustomerInfo: React.ComponentType<CustomerInfoProps> = withObservables(
  ['customer'],
  ({ customer }: CustomerInfoProps) => ({
    customer: customer.observe(),
  }),
)(CustomerInfoBase);
