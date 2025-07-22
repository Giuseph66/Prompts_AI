import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function RecoFacial() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('front');
  const [faces, setFaces] = useState<string[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const [reconhecendo, setReconhecendo] = useState(false);

  // Efeito para tentar reconhecimento a cada 10 segundos
  useEffect(() => {
    if (!permission?.granted) return;

    const timer = setInterval(() => {
      if (!reconhecendo) {
        handleReconhecimento();
      }
    }, 10000); // 10 segundos

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission?.granted, reconhecendo]);
  const handleRequestPermission = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        console.log('Permissão da câmera negada');
      }
    }
  };

  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.permissionText}>Verificando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.permissionText}>
          É necessário permitir o acesso à câmera para reconhecer rostos.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
          <Ionicons name="camera" size={30} color="#007BFF" />
          <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const handleReconhecimento = async () => {
    setReconhecendo(true);
    setFaces([]);
    const imagem = await cameraRef.current?.takePictureAsync({
      skipProcessing: true,
      quality: 0.6,
      base64: true,
    });
    if (!imagem?.uri) return;
    const formData = new FormData();
    // @ts-ignore – React Native aceita esse objeto
    formData.append('file', {
      uri: imagem.uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch('http://192.168.0.25:8000/recognize', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (!response.ok) {
        console.log('Erro na requisição', response.status);
        setReconhecendo(false);
        return;
      }
      const data = await response.json();
      console.log('Resposta da API:', data);
      if (Array.isArray(data.faces)) {
        setFaces(data.faces.map((f: any) => f.name));
      }
      setReconhecendo(false);
    } catch (err) {
      console.log('Falha ao enviar imagem', err);
      setReconhecendo(false);
    } finally {
      setReconhecendo(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scannerContainer}>
        <TouchableOpacity style={styles.cameraButton} onPress={() => {
          setFacing(facing === 'back' ? 'front' : 'back');
        }}>
          <Ionicons name="camera-reverse" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <CameraView
          style={styles.scanner}
          facing={facing}
          ref={cameraRef}
          flash='off'
          mute={true}
        />
        {/* Barra superior com nomes identificados */}
        <View style={styles.topBar}>
          {faces.length === 0 ? (
            <Text style={styles.topBarText}>Nenhum rosto reconhecido</Text>
          ) : (
            faces.map((name, idx) => (
              <Text key={idx} style={styles.topBarText}>{name}</Text>
            ))
          )}
        </View>
        <View style={styles.closeButton}>
          <TouchableOpacity onPress={() => {
            setFaces([]);
            setReconhecendo(false);
            router.back();
          }}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Posicione o rosto dentro da área destacada
          </Text>
        </View>
        <TouchableOpacity style={styles.recoButton} onPress={handleReconhecimento} disabled={reconhecendo}>
          <Ionicons name="person" size={20} color="#fff" />
          <Text style={styles.recoButtonText}>Reconhecer Rosto</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.8,
    height: height * 0.6,
    borderRadius: 260,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 5, 5, 0.1)',
    borderWidth: 1,
    borderColor: '#007BFF',
    gap: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  cameraButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 10,
    left:20,
    zIndex: 1000,
    padding: 4,
  },
  recoButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  recoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  topBar: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  topBarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: { display: 'none' },
  resultText: { display: 'none' },
  closeButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 10,
    right: 20,
    zIndex: 1000,
    padding: 10,
    borderRadius: 100,
  },
}); 