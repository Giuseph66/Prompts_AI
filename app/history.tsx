import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryItem {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
  lastMessage: string;
  personality: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAudio?: boolean;
  isImage?: boolean;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<HistoryItem | null>(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('conversationHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const savedMessages = await AsyncStorage.getItem(`conversation_${conversationId}`);
      if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        setConversationMessages(messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
    }
  };

  const deleteConversation = (conversationId: string) => {
    Alert.alert(
      '🗑️ Excluir Conversa',
      'Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remover da lista de histórico
              const updatedHistory = history.filter(item => item.id !== conversationId);
              await AsyncStorage.setItem('conversationHistory', JSON.stringify(updatedHistory));
              
              // Remover mensagens da conversa
              await AsyncStorage.removeItem(`conversation_${conversationId}`);
              
              setHistory(updatedHistory);
              Alert.alert('Sucesso', 'Conversa excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir conversa');
            }
          }
        }
      ]
    );
  };

  const exportConversation = (conversation: HistoryItem) => {
    const exportData = {
      conversation: conversation,
      messages: conversationMessages,
      exportDate: new Date().toISOString()
    };

    Alert.alert(
      '📤 Exportar Conversa',
      `Dados da conversa "${conversation.title}":\n\n${JSON.stringify(exportData, null, 2)}`,
      [{ text: 'OK' }]
    );
  };

  const clearAllHistory = () => {
    Alert.alert(
      '⚠️ LIMPAR TODO HISTÓRICO ⚠️',
      'Esta ação irá apagar TODAS as conversas salvas. Esta operação é IRREVERSÍVEL.\n\nTem certeza que deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'LIMPAR TUDO',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('conversationHistory');
              setHistory([]);
              Alert.alert('Histórico Limpo', 'Todo o histórico foi removido com sucesso.');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao limpar histórico');
            }
          }
        }
      ]
    );
  };

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.personality.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => {
        setSelectedConversation(item);
        loadConversation(item.id);
        setShowConversationModal(true);
      }}
    >
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle}>{item.title}</Text>
          <Text style={styles.historyPersonality}>{item.personality}</Text>
        </View>
        <View style={styles.historyActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => exportConversation(item)}
          >
            <Ionicons name="download" size={20} color="#00FF41" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteConversation(item.id)}
          >
            <Ionicons name="trash" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.historyPreview} numberOfLines={2}>
        {item.lastMessage}
      </Text>
      
      <View style={styles.historyFooter}>
        <Text style={styles.historyStats}>
          {item.messageCount} mensagens
        </Text>
        <Text style={styles.historyDate}>
          {item.timestamp.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userText : styles.aiText
        ]}>
          {item.isAudio ? '🎤 Áudio' : item.isImage ? '📷 Imagem' : item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isUser ? styles.userTime : styles.aiTime
        ]}>
          {item.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 HISTÓRICO DE CONVERSAS</Text>
        <Text style={styles.headerSubtitle}>Arquivo de Sessões</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#00FF41" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar conversas..."
            placeholderTextColor="#666"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredHistory.length} conversa{filteredHistory.length !== 1 ? 's' : ''} encontrada{filteredHistory.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllHistory}>
          <Ionicons name="trash" size={16} color="#FF4444" />
          <Text style={styles.clearButtonText}>Limpar Tudo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        style={styles.historyList}
        contentContainerStyle={styles.historyContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para visualizar conversa */}
      <Modal
        visible={showConversationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedConversation?.title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConversationModal(false)}
              >
                <Ionicons name="close" size={24} color="#00FF41" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={conversationMessages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              style={styles.conversationList}
              contentContainerStyle={styles.conversationContainer}
              showsVerticalScrollIndicator={false}
            />
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#0a0a0a',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#00FF41',
    fontSize: 16,
    paddingVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statsText: {
    color: '#666',
    fontSize: 14,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    color: '#FF4444',
    fontSize: 14,
    marginLeft: 5,
  },
  historyList: {
    flex: 1,
  },
  historyContainer: {
    padding: 15,
  },
  historyItem: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FF41',
    marginBottom: 2,
  },
  historyPersonality: {
    fontSize: 12,
    color: '#666',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  historyPreview: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    lineHeight: 18,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyStats: {
    fontSize: 12,
    color: '#00FF41',
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00FF41',
    backgroundColor: '#0a0a0a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF41',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  conversationList: {
    flex: 1,
  },
  conversationContainer: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: '#00FF41',
    borderColor: '#00FF41',
  },
  aiBubble: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
    fontWeight: '600',
  },
  aiText: {
    color: '#00FF41',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 5,
    opacity: 0.7,
  },
  userTime: {
    color: '#000',
    textAlign: 'right',
  },
  aiTime: {
    color: '#666',
  },
}); 