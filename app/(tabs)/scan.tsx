import Button from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  
  // Plant details form
  const [plantName, setPlantName] = useState('');
  const [plantSpecies, setPlantSpecies] = useState('');
  const [plantLocation, setPlantLocation] = useState('');
  const [plantGoal, setPlantGoal] = useState('decorative');

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="camera-outline" size={64} color={Colors.primary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan and identify your plants
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        setCapturedImageUri(photo.uri);
        setShowSaveModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImageUri(result.assets[0].uri);
      setShowSaveModal(true);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const savePlantAndScan = async () => {
    if (!plantName.trim()) {
      Alert.alert('Error', 'Please enter a plant name');
      return;
    }

    if (!capturedImageUri) {
      Alert.alert('Error', 'No image captured');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Create the plant
      const plant = await api.createPlant({
        name: plantName.trim(),
        species: plantSpecies.trim() || undefined,
        goal: plantGoal,
        location: plantLocation.trim() || undefined,
      });

      // 2. Get upload URL
      const { upload_url, key } = await api.getUploadUrl(plant.plant_id, 'photo.jpg');

      // 3. Upload image to S3
      await api.uploadImageToS3(upload_url, capturedImageUri);

      // 4. Confirm upload
      await api.confirmUpload(plant.plant_id, key);

      // 5. Scan the plant
      const scanResult = await api.scanPlant(plant.plant_id);

      // 6. Navigate to results
      setShowSaveModal(false);
      resetForm();
      
      router.push({
        pathname: '/scan-results',
        params: { 
          scanResult: JSON.stringify(scanResult),
          plantId: plant.plant_id,
        },
      } as any);

    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Failed to save and scan plant. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPlantName('');
    setPlantSpecies('');
    setPlantLocation('');
    setPlantGoal('decorative');
    setCapturedImageUri(null);
  };

  const cancelSave = () => {
    setShowSaveModal(false);
    resetForm();
  };

  const goals = [
    { value: 'decorative', label: 'Decorative', icon: 'flower' },
    { value: 'food', label: 'Food', icon: 'nutrition' },
    { value: 'medicinal', label: 'Medicinal', icon: 'medkit' },
    { value: 'air_purifying', label: 'Air Purifying', icon: 'leaf' },
  ];

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash ? 'on' : 'off'}
      >
        {/* Top Controls */}
        <View style={[styles.topControls, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.scanBadge}>
            <Text style={styles.scanBadgeText}>Plant Identification</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setFlash(!flash)}
          >
            <Ionicons name={flash ? 'flash' : 'flash-off'} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Scan Frame */}
        <View style={styles.frameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.frameHint}>Position your plant in the frame</Text>
        </View>

        {/* Bottom Controls */}
        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 80 }]}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Save Plant Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={cancelSave}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Plant</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Plant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Living Room Monstera"
              value={plantName}
              onChangeText={setPlantName}
            />

            <Text style={styles.inputLabel}>Species (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Monstera deliciosa"
              value={plantSpecies}
              onChangeText={setPlantSpecies}
            />

            <Text style={styles.inputLabel}>Location (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kitchen windowsill"
              value={plantLocation}
              onChangeText={setPlantLocation}
            />

            <Text style={styles.inputLabel}>Goal</Text>
            <View style={styles.goalsContainer}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.value}
                  style={[
                    styles.goalChip,
                    plantGoal === goal.value && styles.goalChipActive,
                  ]}
                  onPress={() => setPlantGoal(goal.value)}
                >
                  <Ionicons 
                    name={goal.icon as any} 
                    size={16} 
                    color={plantGoal === goal.value ? '#FFFFFF' : Colors.primary} 
                  />
                  <Text style={[
                    styles.goalChipText,
                    plantGoal === goal.value && styles.goalChipTextActive,
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={isProcessing ? "Saving & Scanning..." : "Save & Scan Plant"}
              onPress={savePlantAndScan}
              loading={isProcessing}
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  permissionTitle: {
    ...Typography.h2,
    color: Colors.light.text,
    marginTop: Spacing.md,
  },
  permissionText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  scanBadgeText: {
    color: '#FFFFFF',
    ...Typography.bodySmall,
    fontFamily: 'Inter-Medium',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 350,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  frameHint: {
    color: 'rgba(255,255,255,0.7)',
    ...Typography.bodySmall,
    marginTop: Spacing.md,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  cancelButton: {
    color: Colors.primary,
    ...Typography.body,
  },
  modalTitle: {
    ...Typography.h3,
  },
  modalContent: {
    padding: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  goalChipActive: {
    backgroundColor: Colors.primary,
  },
  goalChipText: {
    ...Typography.bodySmall,
    color: Colors.primary,
  },
  goalChipTextActive: {
    color: '#FFFFFF',
  },
});