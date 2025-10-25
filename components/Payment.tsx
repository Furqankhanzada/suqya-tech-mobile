import React, { useRef, useCallback, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { cssInterop } from 'nativewind';
import { Controller, useForm } from 'react-hook-form';
import {
  CreditCard,
  ChevronDown,
  Wallet,
  AlertCircleIcon,
} from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from '@/components/ui/select';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from '@/components/ui/bottomsheet';
import { usePayment } from '@/hooks/usePayment';
import { CustomerModel } from '@/database/model/Customer';
import { PaymentModel } from '@/database/model/Payment';
import { database } from '@/database';

export interface PaymentRef {
  open: () => void;
  close: () => void;
}

interface PaymentProps {
  customerId: string;
  tripId: string;
}

interface PaymentFormInput {
  paymentType: 'cash' | 'online';
  paymentAmount: string;
  paymentNote: string;
}

const Payment = forwardRef<PaymentRef, PaymentProps>(
  ({ customerId, tripId }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { mutate: savePayment, isPending } = usePayment();

    const [payment, setPayment] = useState<PaymentModel | null>(null);
    const [customer, setCustomer] = useState<CustomerModel | null>(null);

    const isExistingPayment = !!payment;

    // Subscribe to payment and customer observables
    useEffect(() => {
      const paymentQuery = database
        .get<PaymentModel>('payments')
        .query(Q.where('customer_id', customerId), Q.where('trip_id', tripId));

      const paymentSubscription = paymentQuery.observe().subscribe((payments) => {
        setPayment(payments[0] || null);
      });

      const customerSubscription = database
        .get<CustomerModel>('customers')
        .findAndObserve(customerId)
        .subscribe((customerData) => {
          setCustomer(customerData);
        });

      return () => {
        paymentSubscription.unsubscribe();
        customerSubscription.unsubscribe();
      };
    }, [customerId, tripId]);

    const { handleSubmit, control, reset } = useForm<PaymentFormInput>({
      defaultValues: {
        paymentType: payment?.type || 'cash',
        paymentAmount: payment?.amount ? String(payment.amount) : '',
        paymentNote: payment?.comments || '',
      },
      mode: 'onSubmit',
    });

    // Update form when payment data changes
    useEffect(() => {
      if (payment) {
        reset({
          paymentType: payment.type,
          paymentAmount: String(payment.amount),
          paymentNote: payment.comments || '',
        });
      }
    }, [payment, reset]);

    // Expose open/close functions via ref
    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          bottomSheetModalRef.current?.present();
        },
        close: () => {
          bottomSheetModalRef.current?.dismiss();
          reset();
        },
      }),
      [reset]
    );

    const handleSheetChanges = useCallback(
      (index: number) => {
        console.log('Payment sheet changes', index);
        if (index === -1) {
          // Sheet is closed - reset only if creating new payment
          if (!isExistingPayment) {
            reset();
          }
        }
      },
      [reset, isExistingPayment]
    );

    const onSubmit = async (values: PaymentFormInput) => {
      savePayment({
        customer: customerId,
        type: values.paymentType,
        amount: parseFloat(values.paymentAmount),
        paidAt: new Date().toISOString(),
        trip: tripId,
        comments: values.paymentNote || null,
        payment: payment || undefined, // Pass existing payment if updating, undefined if creating
      });
    };

    // Backdrop component
    const backdropComponent = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} className="dark:bg-white/40" />,
      []
    );

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        snapPoints={['70%']}
        backdropComponent={backdropComponent}
        handleComponent={BottomSheetDragIndicator}
        // @ts-ignore
        backgroundClassName="bg-background"
        handleIndicatorClassName="bg-muted-foreground mt-2"
        containerClassName="z-10"
      >
        <BottomSheetView className="flex-1 bg-background">
          {/* Header */}
          <Box className="flex-row items-center justify-between p-4 border-b border-border">
            <HStack space="sm" className="items-center">
              <CreditCard size={24} className="text-primary" />
              <Heading size="lg">
                {isExistingPayment ? 'Update Payment' : 'Record Payment'}
              </Heading>
            </HStack>
          </Box>

          {/* Form */}
          <VStack space="lg" className="p-4 flex-1">
            {customer && (
              <Text className="text-sm text-muted-foreground">
                {isExistingPayment ? 'Update' : 'Record'} payment{' '}
                {isExistingPayment ? 'for' : 'received from'} {customer.name}
              </Text>
            )}

            <Controller
              control={control}
              name="paymentType"
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-base font-medium text-foreground">
                      Payment Type
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Select selectedValue={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      variant="outline"
                      className="border border-border rounded-lg bg-input-background"
                    >
                      <SelectInput placeholder="Select Payment Type" />
                      <SelectIcon as={ChevronDown} className="mr-2" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Cash" value="cash" />
                        <SelectItem label="Online" value="online" />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="paymentAmount"
              rules={{
                required: {
                  value: true,
                  message: 'Payment amount is required',
                },
                min: {
                  value: 1,
                  message: 'Amount must be greater than 0',
                },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Must be a valid number (max 2 decimals)',
                },
              }}
              render={({ field: { value, onChange }, formState: { errors } }) => (
                <FormControl
                  isInvalid={Boolean(errors.paymentAmount?.message)}
                  isDisabled={isPending}
                >
                  <FormControlLabel>
                    <FormControlLabelText className="text-base font-medium text-foreground">
                      Payment Amount
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="bg-input-background border-border rounded-lg">
                    <InputSlot className="pl-3">
                      <InputIcon
                        as={Wallet}
                        className="w-5 h-5 text-muted-foreground"
                      />
                    </InputSlot>
                    <InputField
                      placeholder="Enter amount"
                      keyboardType="numeric"
                      className="text-foreground"
                      value={value}
                      onChangeText={onChange}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon
                      as={AlertCircleIcon}
                      className="text-red-500"
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.paymentAmount?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="paymentNote"
              render={({ field }) => (
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-base font-medium text-foreground">
                      Payment Note (Optional)
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Textarea
                    variant="outline"
                    size="sm"
                    className="border border-border rounded-lg bg-input-background"
                  >
                    <TextareaInput
                      placeholder="Add a note about this payment..."
                      className="text-foreground resize-none"
                      numberOfLines={3}
                      value={field.value}
                      onChangeText={field.onChange}
                    />
                  </Textarea>
                </FormControl>
              )}
            />
          </VStack>

          {/* Footer */}
          <Box className="p-4 border-t border-border">
            <Button
              className="bg-primary rounded-lg"
              onPress={handleSubmit(onSubmit)}
              isDisabled={isPending}
            >
              <ButtonText className="text-primary-foreground font-medium text-lg">
                {isPending
                  ? 'Processing...'
                  : isExistingPayment
                    ? 'Update Payment'
                    : 'Record Payment'}
              </ButtonText>
            </Button>
          </Box>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

cssInterop(BottomSheetModal, {
  backgroundClassName: 'backgroundStyle',
  containerClassName: 'containerStyle',
  handleIndicatorClassName: 'handleIndicatorStyle',
});

Payment.displayName = 'Payment';

export default Payment;

