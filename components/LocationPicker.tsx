import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Text,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { cssInterop } from 'nativewind';

import * as Location from 'expo-location';
import { Navigation } from 'lucide-react-native';
import { Box } from './ui/box';
import { HStack } from './ui/hstack';
import { Heading } from './ui/heading';
import { Pressable } from './ui/pressable';
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from '@/components/ui/bottomsheet';
import { useTheme } from '@/store/useTheme';
import { CustomerModel } from '@/database/model/Customer';
import { useUpdateCustomer } from '@/hooks/useUpdateCustomer';

const { height } = Dimensions.get('window');

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface LocationPickerRef {
  open: () => void;
  close: () => void;
}

interface LocationPickerProps {
  customer: CustomerModel;
}


const LocationPicker = forwardRef<LocationPickerRef, LocationPickerProps>(({
  customer,
}, ref) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 24.7136, // Default to Riyadh
    longitude: 46.6753,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const mapRef = useRef<MapView>(null);
  const { theme } = useTheme()
  const { mutate: updateLocation, isPending } = useUpdateCustomer();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Initialize location based on customer coordinates or current location
  const initializeLocation = useCallback(async () => {
    try {
      // Check if customer has coordinates
      if (customer.coordinates &&
        typeof customer.coordinates.latitude === 'number' &&
        typeof customer.coordinates.longitude === 'number' &&
        customer.coordinates.latitude !== 0 &&
        customer.coordinates.longitude !== 0) {
        // Use customer coordinates
        const customerLocation: LocationData = {
          latitude: customer.coordinates.latitude,
          longitude: customer.coordinates.longitude,
        };

        setSelectedLocation(customerLocation);

        const newRegion: Region = {
          latitude: customer.coordinates.latitude,
          longitude: customer.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);

        mapRef.current?.animateToRegion(newRegion);
        return;
      }

      // If no customer coordinates, get current location
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setHasLocationPermission(false);
        return;
      }

      setHasLocationPermission(true);

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const newLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(newLocation);

      // Update map region to show current location
      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);

      // Animate to current location
      mapRef.current?.animateToRegion(newRegion);

    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, [customer.coordinates]);

  // Expose open/close functions via ref
  useImperativeHandle(ref, () => ({
    open: () => {
      bottomSheetModalRef.current?.present();
      initializeLocation();
    },
    close: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }), [initializeLocation]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // Initialize location when component mounts
  useEffect(() => {
    if (!selectedLocation) {
      initializeLocation();
    }
  }, [initializeLocation, selectedLocation]);



  // Handle map press to update selected location
  const handleMapPress = useCallback((event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const newLocation: LocationData = {
      latitude,
      longitude,
    };

    setSelectedLocation(newLocation);
  }, []);

  // Handle location update button press
  const handleUpdateLocation = useCallback(() => {
    if (selectedLocation) {
      updateLocation({
        customer,
        updates: {
          coordinates: selectedLocation,
        },
      });
      bottomSheetModalRef.current?.dismiss();
    }
  }, [selectedLocation, updateLocation, customer]);


  // Get coordinates for display
  const getLocationDisplayText = () => {
    if (!selectedLocation ||
      typeof selectedLocation.latitude !== 'number' ||
      typeof selectedLocation.longitude !== 'number') {
      return 'Select a location on the map';
    }

    return `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`;
  };

  // Backdrop component
  const backdropComponent = useCallback((props: any) => (
    <BottomSheetBackdrop {...props} className='dark:bg-white/40' />
  ), []);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onChange={handleSheetChanges}
      snapPoints={['80%']}
      backdropComponent={backdropComponent}
      handleComponent={BottomSheetDragIndicator}
      // @ts-ignore
      backgroundClassName='bg-background'
      handleIndicatorClassName='bg-muted-foreground mt-2'
      containerClassName='z-10'
    >
      <BottomSheetView className='flex-1 bg-background'>
        {/* Header */}
        <Box className="flex-row items-center justify-between p-4 border-b border-border">
          <Heading size="lg">Add {customer.name} Location</Heading>
          <Pressable
            onPress={handleUpdateLocation}
            disabled={isPending || !selectedLocation}
            className={`px-4 py-2 rounded-lg ${isPending || !selectedLocation
              ? 'bg-muted'
              : 'bg-primary'
              }`}
          >
            <Text className={`font-medium ${isPending || !selectedLocation
              ? 'text-muted-foreground'
              : 'text-primary-foreground'
              }`}>
              {isPending ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </Box>

        {/* Location Info - Only show when location is selected */}
        {selectedLocation && (
          <Box className="p-4 border-b border-border">
            <Text className="text-sm font-medium text-muted-foreground">Coordinates: {getLocationDisplayText()}</Text>
            {!hasLocationPermission && (
              <Text className="text-xs text-red-500 mt-1">
                Enable location permission for better accuracy
              </Text>
            )}
          </Box>
        )}

        {/* Instructions */}
        <Box className="p-4 border-b border-border">
          <HStack space="sm" className="items-center">
            <Navigation size={14} color="#6B7280" />
            <Text className="text-xs text-muted-foreground">
              Tap on the map to select a location
            </Text>
          </HStack>
        </Box>

        {/* Map */}
        <Box className="flex-1 m-4 rounded-lg overflow-hidden border border-border relative">
          <MapView
            ref={mapRef}
            zoomEnabled={true}
            provider={PROVIDER_GOOGLE}
            pitchEnabled={true}
            style={{ height: height - 400 }}
            region={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsScale={true}
            toolbarEnabled={true}
            userInterfaceStyle={theme === 'dark' ? 'dark' : 'light'}
            mapType="standard"
          >
            {selectedLocation &&
              typeof selectedLocation.latitude === 'number' &&
              typeof selectedLocation.longitude === 'number' && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Selected Location"
                  description={`${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
                  pinColor="#3B82F6"
                />
              )}
          </MapView>
        </Box>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

cssInterop(BottomSheetModal, { backgroundClassName: 'backgroundStyle', containerClassName: 'containerStyle', handleIndicatorClassName: 'handleIndicatorStyle' });


LocationPicker.displayName = 'LocationPicker';


export default LocationPicker;