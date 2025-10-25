import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import AppHeader from "@/components/AppHeader";

export default function Order() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <VStack className="flex-1">
        {/* App Header */}
        <AppHeader showBackButton={false} />
        
        <Center className="flex-1">
          <Text className="text-white">Order</Text>
        </Center>
      </VStack>
    </SafeAreaView>
  );
};