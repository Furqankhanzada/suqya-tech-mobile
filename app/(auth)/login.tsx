import React, { useState } from 'react';
import { User, Users, Eye, EyeOff, Droplets } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { Center } from '@/components/ui/center';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useLogin } from '@/hooks/useAuth';
import { type Collection } from '@/api/types';

export default function LoginScreen() {
  const [collection, setCollection] = useState<Collection>('employee');
  const [credentials, setCredentials] = useState({
    username: '03161137297',
    password: 'shaheem5544',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: signIn, isPending: isLoading } = useLogin();

  const handleLogin = async () => {
    signIn({ ...credentials, collection });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <VStack
        className="flex-1 justify-center items-center px-6 py-8"
        space="xl"
      >
        {/* Logo and Title */}
        <VStack className="items-center" space="lg">
          <Center>
            <Box className="rounded-full p-4 bg-foreground">
              <Icon as={Droplets} className="w-8 h-8 text-background" />
            </Box>
          </Center>
          <VStack className="items-center" space="xs">
            <Heading className="text-foreground text-3xl font-bold">
              SuqyaTech
            </Heading>
            <Text className="text-muted-foreground">
              Water Delivery Management
            </Text>
          </VStack>
        </VStack>

        {/* User Type Selection */}
        <VStack className="w-full" space="lg">
          <HStack className="w-full rounded-lg p-1 flex-row bg-muted">
            <Pressable
              className="flex-1"
              onPress={() => setCollection('employee')}
            >
              <Box
                className={`py-2 px-4 rounded-md ${collection === 'employee' ? 'bg-card' : 'bg-transparent'
                  }`}
              >
                <HStack className="justify-center items-center" space="sm">
                  <Icon as={User} className="w-4 h-4 text-foreground" />
                  <Text className="font-medium text-foreground">Employee</Text>
                </HStack>
              </Box>
            </Pressable>

            <Pressable
              className="flex-1"
              onPress={() => setCollection('customer')}
            >
              <Box
                className={`py-2 px-4 rounded-md ${collection === 'customer' ? 'bg-card' : 'bg-transparent'
                  }`}
              >
                <HStack className="justify-center items-center" space="sm">
                  <Icon as={Users} className="w-4 h-4 text-foreground" />
                  <Text className="font-medium text-foreground">Customer</Text>
                </HStack>
              </Box>
            </Pressable>
          </HStack>

          <Card className="p-6 bg-card rounded-xl border border-border">
            <VStack space="lg">
              <VStack className="items-center" space="xs">
                <Heading className="text-foreground text-xl font-bold capitalize">
                  {collection} Login
                </Heading>
                <Text className="text-sm text-center text-muted-foreground">
                  {collection === 'employee'
                    ? 'Access your delivery dashboard'
                    : 'Place your water orders'}
                </Text>
              </VStack>

              <VStack space="lg">
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-foreground text-sm font-medium">
                      Username
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="bg-input-background border-border">
                    <InputField
                      placeholder="Enter your username"
                      placeholderTextColor="#9CA3AF"
                      value={credentials.username}
                      onChangeText={(text) =>
                        setCredentials((prev) => ({ ...prev, username: text }))
                      }
                      className="text-foreground"
                    />
                  </Input>
                </FormControl>

                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-foreground text-sm font-medium">
                      Password
                    </FormControlLabelText>
                  </FormControlLabel>
                  <HStack className="items-center relative">
                    <Input className="bg-input-background border-border flex-1">
                      <InputField
                        placeholder="Enter your password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={credentials.password}
                        onChangeText={(text) =>
                          setCredentials((prev) => ({
                            ...prev,
                            password: text,
                          }))
                        }
                        className="text-foreground pr-1"
                      />
                    </Input>
                    <Pressable
                      className="absolute right-3 p-2"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Icon
                        as={showPassword ? EyeOff : Eye}
                        className="w-5 h-5 text-foreground"
                      />
                    </Pressable>
                  </HStack>
                </FormControl>

                <Button
                  className="bg-primary rounded-lg"
                  onPress={handleLogin}
                  isDisabled={isLoading}
                >
                  <ButtonText className="text-primary-foreground font-medium text-lg">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </ButtonText>
                </Button>
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
