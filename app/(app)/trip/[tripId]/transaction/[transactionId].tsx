import React, { useMemo, useRef } from 'react';
import {
  Save,
  CreditCard,
  AlertCircleIcon,
} from 'lucide-react-native';
import { withObservables } from '@nozbe/watermelondb/react';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { ScrollView } from '@/components/ui/scroll-view';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import AppHeader from '@/components/AppHeader';
import { cn } from '@/components/utils';
import { useUpdateTransaction } from '@/hooks/useUpdateTransaction';
import { Controller, useForm } from 'react-hook-form';
import { useLocalSearchParams } from 'expo-router';
import { CustomerInfo } from '@/components/CustomerInfo';
import { database } from '@/database';
import { TransactionModel } from '@/database/model/Transactions';
import Payment, { PaymentRef } from '@/components/Payment';

interface IFormInput {
  bottleGiven?: string;
  bottleTaken?: string;
}

type TransactionScreenViewProps = {
  transaction: TransactionModel;
};

function TransactionScreenView({ transaction }: TransactionScreenViewProps) {
  const { mutate: updateTransaction, isPending } = useUpdateTransaction();
  const paymentRef = useRef<PaymentRef>(null);

  const { handleSubmit, control, watch } = useForm<IFormInput>({
    defaultValues: {
      bottleGiven: String(transaction.bottleGiven),
      bottleTaken: String(transaction.bottleTaken),
    },
    mode: 'onSubmit',
  });

  const bottleGiven = watch('bottleGiven');
  const bottleTaken = watch('bottleTaken');

  const remainingBottles = useMemo(() => {
    const { remainingBottles } = transaction;
    const given = Number(bottleGiven) || 0;
    const taken = Number(bottleTaken) || 0;
    const base = remainingBottles || 0;

    return base + given - taken;
  }, [transaction, bottleGiven, bottleTaken]);

  const onSubmit = async (values: any) => {
    if (!transaction) return;

    const updates: Partial<TransactionModel> = {
      bottleGiven: Number(values.bottleGiven) || 0,
      bottleTaken: Number(values.bottleTaken) || 0,
    };

    updateTransaction({ updates, transaction });
  };

  const handleOpenPayment = () => {
    console.log('handleOpenPayment', paymentRef.current?.open);
    paymentRef.current?.open?.();
  };

  const isCompleted = (transaction: TransactionModel) => {
    return transaction.bottleGiven > 0 || transaction.bottleTaken > 0;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <VStack className="flex-1 px-6">
        <AppHeader showBackButton={true} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <VStack className="py-4" space="xl">
            <CustomerInfo
              priority={transaction.priority}
              isCompleted={isCompleted(transaction)}
              customer={transaction.customer}
            />

            {/* Payment Button */}
            <Button
              variant="outline"
              className="border-border bg-background rounded-lg"
              onPress={handleOpenPayment}
            >
              <ButtonIcon as={CreditCard} className="w-5 h-5 text-primary mr-2" />
              <ButtonText className="text-foreground font-medium text-base">
                Record Payment
              </ButtonText>
            </Button>
            <Card className="p-4 bg-background border border-border">
              <VStack space="lg">
                <VStack space="xs">
                  <Heading className="text-foreground text-xl font-bold">
                    Record Delivery
                  </Heading>
                  <Text className="text-sm text-muted-foreground">
                    Record bottles given and taken for this customer
                  </Text>
                </VStack>

                <VStack space="lg">
                  <Controller
                    control={control}
                    name="bottleGiven"
                    rules={{
                      pattern: {
                        value: /^(100|[1-9]?\d)$/,
                        message: 'Must be a whole number between 0 and 100',
                      },
                    }}
                    render={({ field, formState: { errors } }) => (
                      <FormControl
                        isInvalid={Boolean(errors.bottleGiven?.message)}
                      >
                        <FormControlLabel>
                          <FormControlLabelText className="text-base font-medium text-foreground">
                            Bottles Given
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input className="bg-input-background border-border rounded-lg">
                          <InputField
                            placeholder="Number of bottles given"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            className="text-foreground"
                            value={field.value}
                            onChangeText={field.onChange}
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorIcon
                            as={AlertCircleIcon}
                            className="text-red-500"
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.bottleGiven?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />

                  <Controller
                    control={control}
                    name="bottleTaken"
                    rules={{
                      pattern: {
                        value: /^(100|[1-9]?\d)$/,
                        message: 'Must be a whole number between 0 and 100',
                      },
                    }}
                    render={({ field, formState: { errors } }) => (
                      <FormControl
                        isInvalid={Boolean(errors.bottleTaken?.message)}
                      >
                        <FormControlLabel>
                          <FormControlLabelText className="text-base font-medium text-foreground">
                            Bottles Taken
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input className="bg-input-background border-border rounded-lg">
                          <InputField
                            placeholder="Number of bottles taken"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            className="text-foreground"
                            value={field.value}
                            onChangeText={field.onChange}
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorIcon
                            as={AlertCircleIcon}
                            className="text-red-500"
                          />
                          <FormControlErrorText className="text-red-500">
                            {errors.bottleTaken?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />

                  <Box className="p-3 rounded-lg bg-transparent border border-border">
                    <HStack className="justify-between items-center">
                      <Text className="text-sm font-medium text-foreground">
                        Remaining Bottles:
                      </Text>
                      <Text
                        className={cn(
                          'text-lg font-bold text-muted-foreground',
                          {
                            'text-green-500': remainingBottles > 0,
                            'text-red-500': remainingBottles < 0,
                          },
                        )}
                      >
                        {remainingBottles}
                      </Text>
                    </HStack>
                    <Text className="text-xs mt-1 text-muted-foreground">
                      Bottles at home/office, calculated automatically based on
                      last transaction
                    </Text>
                  </Box>
                </VStack>
              </VStack>
            </Card>
            <Button
              className="bg-primary rounded-lg"
              onPress={handleSubmit(onSubmit)}
              isDisabled={isPending}
            >
              <ButtonIcon as={Save} className="w-5 h-5 text-foreground mr-2" />
              <ButtonText className="text-primary-foreground font-medium text-lg">
                {isPending ? 'Updating...' : 'Update Transaction'}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </VStack>

      {/* Payment Modal */}
      <Payment
        ref={paymentRef}
        customerId={transaction.customer.id}
        tripId={transaction.trip.id}
      />
    </SafeAreaView>
  );
}

// 👇 Enhance with WatermelonDB observable
const enhance = withObservables(
  ['transactionId'],
  ({ transactionId }: { transactionId: string }) => ({
    transaction: database
      .get<TransactionModel>('transactions')
      .findAndObserve(transactionId),
  }),
);

const EnhancedTransactionScreen = enhance(TransactionScreenView);

export default function TransactionScreen() {
  const { transactionId } = useLocalSearchParams<{
    transactionId: string;
  }>();

  return <EnhancedTransactionScreen transactionId={transactionId} />;
}
