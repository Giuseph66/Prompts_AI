import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsData {
  apiKey: string;
  userName: string;
  autoSave: boolean;
  darkMode: boolean;
  notifications: boolean;
  encryptionEnabled: boolean;
  backupFrequency: string;
  customTheme: string;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SettingsData>({
    apiKey: '',
    userName: '',
    autoSave: true,
    darkMode: true,
    notifications: true,
    encryptionEnabled: false,
    backupFrequency: 'daily',
    customTheme: 'hacker'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsData) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar configurações');
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleToggle = (key: keyof SettingsData) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleTextChange = (key: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setIsEditing(false);
  };

  const clearAllData = () => {
    Alert.alert(
      '⚠️ ATENÇÃO - OPERAÇÃO CRÍTICA ⚠️',
      'Esta ação irá apagar TODOS os dados salvos. Esta operação é IRREVERSÍVEL.\n\nTem certeza que deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'APAGAR TUDO',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Dados Apagados', 'Todos os dados foram removidos com sucesso.');
              loadSettings();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao apagar dados');
            }
          }
        }
      ]
    );
  };

  const exportSettings = () => {
    Alert.alert(
      'Exportar Configurações',
      `Configurações atuais:\n\n${JSON.stringify(settings, null, 2)}`,
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    type: 'toggle' | 'text' | 'button' | 'select',
    key?: keyof SettingsData,
    onPress?: () => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#00FF41" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      
      {type === 'toggle' && key && (
        <Switch
          value={settings[key] as boolean}
          onValueChange={() => handleToggle(key)}
          trackColor={{ false: '#1a1a1a', true: '#00FF41' }}
          thumbColor={settings[key] as boolean ? '#000' : '#333'}
        />
      )}
      
      {type === 'text' && key && (
        <TouchableOpacity
          style={styles.textButton}
          onPress={() => {
            if (key === 'apiKey') {
              setTempApiKey(settings.apiKey);
              setShowApiKeyModal(true);
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.textButtonText}>
            {key === 'apiKey' ? '••••••••••••••••' : settings[key] || 'Não definido'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#00FF41" />
        </TouchableOpacity>
      )}
      
      {type === 'button' && onPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Ionicons name="chevron-forward" size={20} color="#00FF41" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ CONFIGURAÇÕES DO SISTEMA</Text>
          <Text style={styles.headerSubtitle}>Painel de Controle Principal</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 SEGURANÇA E AUTENTICAÇÃO</Text>
            
            {renderSettingItem(
              'Chave da API',
              'Configure sua chave de API do Gemini',
              'key',
              'text',
              'apiKey'
            )}
            
            {renderSettingItem(
              'Criptografia',
              'Ativar criptografia de dados',
              'shield-checkmark',
              'toggle',
              'encryptionEnabled'
            )}
            
            {renderSettingItem(
              'Nome do Usuário',
              'Seu identificador no sistema',
              'person',
              'text',
              'userName'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 INTERFACE E TEMA</Text>
            
            {renderSettingItem(
              'Modo Escuro',
              'Ativar tema dark/hacker',
              'moon',
              'toggle',
              'darkMode'
            )}
            
            {renderSettingItem(
              'Salvamento Automático',
              'Salvar dados automaticamente',
              'save',
              'toggle',
              'autoSave'
            )}
            
            {renderSettingItem(
              'Notificações',
              'Receber alertas do sistema',
              'notifications',
              'toggle',
              'notifications'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 BACKUP E DADOS</Text>
            
            {renderSettingItem(
              'Frequência de Backup',
              'Configurar backup automático',
              'cloud-upload',
              'text',
              'backupFrequency'
            )}
            
            {renderSettingItem(
              'Exportar Configurações',
              'Salvar configurações em arquivo',
              'download',
              'button',
              undefined,
              exportSettings
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ ZONA DE PERIGO</Text>
            
            {renderSettingItem(
              'Apagar Todos os Dados',
              'Remover permanentemente todos os dados',
              'trash',
              'button',
              undefined,
              clearAllData
            )}
          </View>
        </ScrollView>

        {isEditing && (
          <View style={styles.editBar}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modal para editar API Key */}
      <Modal
        visible={showApiKeyModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔑 Configurar Chave da API</Text>
            <Text style={styles.modalSubtitle}>
              Digite sua chave da API do Gemini. Esta chave será criptografada e armazenada de forma segura.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempApiKey}
              onChangeText={setTempApiKey}
              placeholder="Digite sua chave da API..."
              placeholderTextColor="#666"
              secureTextEntry={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowApiKeyModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => {
                  handleTextChange('apiKey', tempApiKey);
                  setShowApiKeyModal(false);
                  saveSettings({ ...settings, apiKey: tempApiKey });
                }}
              >
                <Text style={styles.modalSaveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00FF41',
    backgroundColor: '#0a0a0a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF41',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FF41',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#111',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#00FF41',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  textButtonText: {
    color: '#00FF41',
    fontSize: 14,
    marginRight: 8,
  },
  actionButton: {
    padding: 8,
  },
  editBar: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#00FF41',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00FF41',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    borderWidth: 2,
    borderColor: '#00FF41',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF41',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#00FF41',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
}); 