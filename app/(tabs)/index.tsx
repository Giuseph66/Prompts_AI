import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GEMINI_API_KEY = 'AIzaSyCMyrx_l5uZR8ZBFEX2xAIBsCfjzTiyjNQ';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAudio?: boolean;
  audioUri?: string;
  audioDuration?: number;
  isImage?: boolean;
  imageUri?: string;
  imageBase64?: string;
}

interface AIPersonality {
  name: string;
  description: string;
  role: string;
}

interface PersonalityExample {
  id: string;
  name: string;
  role: string;
  description: string;
  shortDesc: string;
  icon: string;
  color: string;
}

export default function ChatScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou sua IA personalizada. Clique no cabeçalho para me configurar e definir quem eu sou!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [personalities, setPersonalities] = useState<PersonalityExample[]>([]);
  const [aiPersonality, setAiPersonality] = useState({
    name: 'IA Personalizada',
    description: 'Uma IA amigável e útil que pode ajudar com qualquer assunto.',
    role: 'assistente'
  });
  const flatListRef = useRef<FlatList>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão necessária', 
            'Precisamos de permissão para acessar o microfone para gravar áudio.'
          );
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão de áudio:', error);
      }
    })();
    const data_person =[
      {
        id: '1',
        name: 'Alice',
        role: 'Amiga Conversacional',
        description: 'Uma amiga empática e divertida que adora conversar sobre qualquer assunto. Sempre tem uma opinião interessante e gosta de dar conselhos com bom humor.',
        shortDesc: 'Empática e divertida',
        icon: 'heart',
        color: '#FF6B9D'
      },
      {
        id: '2',
        name: 'Dr. Silva',
        role: 'Professor de História',
        description: 'Um professor apaixonado por história que adora compartilhar conhecimento de forma didática e envolvente. Sempre tem uma história interessante para contar.',
        shortDesc: 'Didático e apaixonado',
        icon: 'school',
        color: '#4ECDC4'
      },
      {
        id: '3',
        name: 'Chef Maria',
        role: 'Chef de Cozinha',
        description: 'Uma chef experiente e criativa que adora compartilhar receitas, dicas de culinária e histórias sobre comida. Sempre tem uma sugestão deliciosa.',
        shortDesc: 'Experiente e criativa',
        icon: 'restaurant',
        color: '#FFA726'
      },
      {
        id: '4',
        name: 'Tech Carlos',
        role: 'Especialista em Tecnologia',
        description: 'Um especialista em tecnologia que adora explicar conceitos complexos de forma simples. Sempre atualizado com as últimas tendências e inovações.',
        shortDesc: 'Inovador e técnico',
        icon: 'laptop',
        color: '#42A5F5'
      },
      {
        id: '5',
        name: 'Coach Ana',
        role: 'Coach de Vida',
        description: 'Uma coach motivacional que ajuda pessoas a alcançarem seus objetivos. Sempre tem palavras de incentivo e estratégias práticas para o sucesso.',
        shortDesc: 'Motivacional e prática',
        icon: 'trending-up',
        color: '#66BB6A'
      },
      {
        id: '6',
        name: 'Dr. Oliveira',
        role: 'Médico Generalista',
        description: 'Um médico atencioso que explica de forma clara questões de saúde e bem-estar. Sempre pronto para orientar sobre prevenção e cuidados diários.',
        shortDesc: 'Atencioso e esclarecedor',
        icon: 'medical',
        color: '#AB47BC'
      },
      {
        id: '7',
        name: 'Eco Lucas',
        role: 'Consultor em Sustentabilidade',
        description: 'Um ambientalista engajado que dá dicas práticas para um estilo de vida mais sustentável e consciente. Adora compartilhar curiosidades sobre o meio ambiente.',
        shortDesc: 'Consciente e prático',
        icon: 'leaf',
        color: '#8BC34A'
      },
      {
        id: '8',
        name: 'Júlia Financeira',
        role: 'Consultora Financeira',
        description: 'Uma especialista em finanças pessoais que ajuda a organizar orçamentos, investimentos e metas financeiras de forma simples e eficiente.',
        shortDesc: 'Organizada e estratégica',
        icon: 'card',
        color: '#FFD54F'
      },
      {
        id: '9',
        name: 'Sofia Decor',
        role: 'Designer de Interiores',
        description: 'Uma designer criativa que dá sugestões de decoração, aproveitamento de espaços e combinações de cores para deixar ambientes mais acolhedores.',
        shortDesc: 'Criativa e estilosa',
        icon: 'home',
        color: '#26C6DA'
      },
      {
        id: '10',
        name: 'Rafael Gamer',
        role: 'Analista de Jogos',
        description: 'Um apaixonado por games que faz análises detalhadas de títulos, dicas de estratégias e recomendações para diferentes perfis de jogadores.',
        shortDesc: 'Detalhista e estratégico',
        icon: 'game-controller',
        color: '#FF7043'
      }
    ];
    setPersonalities(data_person);
  }, []);

  const openPersonalityModal = () => {
    setShowPersonalityModal(true);
  };

  const openImagePickerModal = () => {
    setShowImagePickerModal(true);
  };

  const savePersonality = () => {
    if (!aiPersonality.name.trim() || !aiPersonality.description.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome e a descrição da IA.');
      return;
    }

    setShowPersonalityModal(false);
    
    // Adicionar mensagem de confirmação
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      text: `Perfeito! Agora sou ${aiPersonality.name}. ${aiPersonality.description}`,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, confirmationMessage]);
  };

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove o prefixo "data:image/jpeg;base64," se existir
          const base64Data = base64.split(',')[1] || base64;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw new Error('Falha ao converter imagem para base64');
    }
  };

  const selectFromGallery = async () => {
    try {
      setShowImagePickerModal(false);
      
      // Solicitar permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.uri;
        const imageBase64 = await convertImageToBase64(imageUri);
        await sendImageMessage(imageUri, imageBase64);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem da galeria:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem da galeria.');
    }
  };

  const takePhoto = async () => {
    try {
      setShowImagePickerModal(false);
      
      // Solicitar permissão para acessar a câmera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.uri;
        const imageBase64 = await convertImageToBase64(imageUri);
        await sendImageMessage(imageUri, imageBase64);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const selectImage = async () => {
    openImagePickerModal();
  };

  const getOptimizedHistory = () => {
    // Filtrar apenas mensagens de texto e limitar o histórico para não exceder limites da API
    // O histórico exclui áudios e imagens (base64) para otimizar o uso da API
    // Mantém apenas as últimas 10 mensagens de texto para evitar tokens excessivos
    const textMessages = messages
      .filter(msg => !msg.isAudio && !msg.isImage)
      .slice(-10); // Manter apenas as últimas 10 mensagens de texto
    
    return textMessages
      .map(msg => `${msg.isUser ? 'Usuário' : aiPersonality.name}: ${msg.text}`)
      .join('\n');
  };

  const saveConversationToHistory = async () => {
    try {
      if (messages.length <= 1) return; // Não salvar se só tiver a mensagem inicial
      
      const conversationId = Date.now().toString();
      const conversationData = {
        id: conversationId,
        title: `Conversa com ${aiPersonality.name}`,
        timestamp: new Date(),
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.text || 'Sem mensagens',
        personality: aiPersonality.name
      };

      // Salvar dados da conversa
      const existingHistory = await AsyncStorage.getItem('conversationHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(conversationData);
      
      // Manter apenas as últimas 50 conversas
      const limitedHistory = history.slice(0, 50);
      await AsyncStorage.setItem('conversationHistory', JSON.stringify(limitedHistory));
      
      // Salvar mensagens da conversa
      await AsyncStorage.setItem(`conversation_${conversationId}`, JSON.stringify(messages));
      
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico da conversa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: Date.now().toString(),
                text: `Histórico limpo! Olá novamente, sou ${aiPersonality.name}. Como posso te ajudar?`,
                isUser: false,
                timestamp: new Date(),
              },
            ]);
            // Salvar conversa limpa no histórico
            saveConversationToHistory();
          },
        },
      ]
    );
  };

  const sendImageMessage = async (imageUri: string, imageBase64: string) => {
    const imageMessage: Message = {
      id: Date.now().toString(),
      text: '📷 Imagem enviada',
      isUser: true,
      timestamp: new Date(),
      isImage: true,
      imageUri,
      imageBase64,
    };

    setMessages(prev => [...prev, imageMessage]);
    setIsLoading(true);

    try {
      // Enviar imagem em base64 para o Gemini
      const aiResponse = await sendImageToGemini(imageBase64);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      Alert.alert(
        'Erro de Processamento', 
        'Não foi possível processar a imagem. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendImageToGemini = async (imageBase64: string): Promise<string> => {
    try {
      // Criar histórico apenas com mensagens de texto
      const textHistory = getOptimizedHistory();

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Você é ${aiPersonality.name}. ${aiPersonality.description}
                  
                  Histórico da conversa:
                  ${textHistory}
                  
                  Analise esta imagem e responda de forma natural e conversacional em português brasileiro, mantendo sua personalidade e considerando o contexto da conversa.`
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao processar imagem com a IA');
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Resposta inválida da IA');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao enviar imagem para Gemini:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      // Configurar modo de áudio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Iniciar gravação
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);

      // Timer para mostrar duração da gravação
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação. Verifique as permissões do microfone.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      const finalDuration = recordingTime;
      setRecordingTime(0);

      if (uri) {
        await sendAudioMessage(uri, finalDuration);
      }
    } catch (err) {
      console.error('Erro ao parar gravação:', err);
      Alert.alert('Erro', 'Não foi possível parar a gravação.');
    }
  };

  const sendAudioMessage = async (audioUri: string, duration: number) => {
    const audioMessage: Message = {
      id: Date.now().toString(),
      text: '🎤 Mensagem de áudio',
      isUser: true,
      timestamp: new Date(),
      isAudio: true,
      audioUri,
      audioDuration: duration,
    };

    setMessages(prev => [...prev, audioMessage]);
    setIsLoading(true);

    try {
      // Converter áudio para base64
      const audioBase64 = await convertAudioToBase64(audioUri);
      console.log('Áudio convertido para base64:', audioBase64.substring(0, 100) + '...');
      
      // Enviar áudio em base64 para o Gemini
      const aiResponse = await sendAudioToGemini(audioBase64);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      Alert.alert(
        'Erro de Processamento', 
        'Não foi possível processar o áudio. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const convertAudioToBase64 = async (audioUri: string): Promise<string> => {
    try {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove o prefixo "data:audio/wav;base64," se existir
          const base64Data = base64.split(',')[1] || base64;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter áudio para base64:', error);
      throw new Error('Falha ao converter áudio para base64');
    }
  };

  const sendAudioToGemini = async (audioBase64: string): Promise<string> => {
    try {
      // Criar histórico apenas com mensagens de texto
      const textHistory = getOptimizedHistory();

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Você é ${aiPersonality.name}. ${aiPersonality.description}
                  
                  Histórico da conversa:
                  ${textHistory}
                  
                  Transcreva este áudio e responda de forma natural e conversacional em português brasileiro, mantendo sua personalidade e considerando o contexto da conversa.`
                },
                {
                  inline_data: {
                    mime_type: "audio/wav",
                    data: audioBase64
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao processar áudio com a IA');
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Resposta inválida da IA');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao enviar áudio para Gemini:', error);
      throw error;
    }
  };

  const playAudio = async (messageId: string, audioUri: string) => {
    try {
      setPlayingAudioId(messageId);
      
      // Configurar modo de áudio para reprodução
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Carregar e reproduzir áudio
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioId(null);
          sound.unloadAsync();
        }
      });

      await sound.playAsync();
      
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
      setPlayingAudioId(null);
    }
  };

  const stopAudio = () => {
    setPlayingAudioId(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessageToGemini = async (userMessage: string): Promise<string> => {
    try {
      // Criar histórico apenas com mensagens de texto
      const textHistory = getOptimizedHistory();

      const prompt = `Você é ${aiPersonality.name}. ${aiPersonality.description}
      
      Histórico da conversa:
      ${textHistory}
      
      Responda de forma natural e conversacional em português brasileiro, mantendo a personalidade definida.
      
      Mensagem atual do usuário: ${userMessage}
      
      Responda como ${aiPersonality.name} responderia, considerando o contexto da conversa.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao comunicar com a IA');
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Resposta inválida da IA');
      }

      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Erro na API do Gemini:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToGemini(currentInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert(
        'Erro de Conexão', 
        'Não foi possível conectar com a IA. Verifique sua conexão com a internet e tente novamente.'
      );
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, estou com dificuldades técnicas no momento. Pode tentar novamente em alguns instantes?',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        {item.isAudio ? (
          <View style={styles.audioMessage}>
            <TouchableOpacity
              style={[
                styles.audioPlayButton,
                playingAudioId === item.id && styles.audioPlayButtonPlaying
              ]}
              onPress={() => {
                if (playingAudioId === item.id) {
                  stopAudio();
                } else {
                  playAudio(item.id, item.audioUri || '');
                }
              }}
              disabled={isLoading}
            >
              <Ionicons 
                name={playingAudioId === item.id ? "pause" : "play"} 
                size={16} 
                color="white" 
              />
            </TouchableOpacity>
            
            <View style={styles.audioInfo}>
              <ThemedText style={styles.audioText}>
                {item.text}
              </ThemedText>
              {item.audioDuration && (
                <Text style={styles.audioDuration}>
                  {formatTime(item.audioDuration)}
                </Text>
              )}
            </View>

            {playingAudioId === item.id && (
              <View style={styles.playingIndicator}>
                <View style={styles.playingDot} />
                <View style={styles.playingDot} />
                <View style={styles.playingDot} />
              </View>
            )}
          </View>
        ) : item.isImage ? (
          <View style={styles.imageMessage}>
            <Image
              source={{ uri: item.imageUri }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            <ThemedText style={[
              styles.messageText,
              item.isUser ? styles.userText : styles.aiText
            ]}>
              {item.text}
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[
            styles.messageText,
            item.isUser ? styles.userText : styles.aiText
          ]}>
            {item.text}
          </ThemedText>
        )}
        <Text style={[
          styles.timestamp,
          item.isUser ? styles.userTimestamp : styles.aiTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
    
    // Salvar automaticamente quando houver mais de 10 mensagens
    if (messages.length > 10) {
      saveConversationToHistory();
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color="#00FF41" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerContent} onPress={openPersonalityModal}>
            <ThemedText type="title" style={styles.headerTitle}>
              {aiPersonality.name}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {aiPersonality.role}
            </ThemedText>
            <Ionicons name="settings-outline" size={20} color="#00FF41" style={styles.headerIcon} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <View style={styles.historyIndicator}>
              <ThemedText style={styles.historyCount}>
                {messages.filter(msg => !msg.isAudio && !msg.isImage).length} msgs
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.saveHistoryButton}
              onPress={saveConversationToHistory}
            >
              <Ionicons name="save" size={18} color="#00FF41" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.clearHistoryButton}
              onPress={clearHistory}
            >
              <Ionicons name="trash-outline" size={18} color="#00FF41" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="rgb(45, 134, 99)" />
            <ThemedText style={styles.loadingText}>
              {aiPersonality.name} está processando...
            </ThemedText>
          </View>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <ThemedText style={styles.recordingText}>
                Gravando... {formatTime(recordingTime)}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading && !isRecording}
          />
          
          {/* Image Button */}
          <TouchableOpacity
            style={styles.imageButton}
            onPress={selectImage}
            disabled={isLoading || isRecording}
          >
            <Ionicons 
              name="image" 
              size={24} 
              color="rgb(45, 134, 99)" 
            />
          </TouchableOpacity>

          {/* Audio Button */}
          <TouchableOpacity
            style={[
              styles.audioButton,
              isRecording && styles.audioButtonRecording
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            <Ionicons 
              name={isRecording ? "stop" : "mic"} 
              size={24} 
              color={isRecording ? "white" : "rgb(45, 134, 99)"} 
            />
          </TouchableOpacity>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading || isRecording) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading || isRecording}
          >
            <ThemedText style={styles.sendButtonText}>
              Enviar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Personality Configuration Modal */}
      <Modal
        visible={showPersonalityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPersonalityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Configurar IA
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowPersonalityModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nome da IA:</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={aiPersonality.name}
                  onChangeText={(text) => setAiPersonality(prev => ({ ...prev, name: text }))}
                  placeholder="Ex: Alice, João, Dr. Silva..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Função/Papel:</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  value={aiPersonality.role}
                  onChangeText={(text) => setAiPersonality(prev => ({ ...prev, role: text }))}
                  placeholder="Ex: Assistente, Amigo, Professor..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Descrição da Personalidade:</ThemedText>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={aiPersonality.description}
                  onChangeText={(text) => setAiPersonality(prev => ({ ...prev, description: text }))}
                  placeholder="Descreva como a IA deve se comportar, seus interesses, estilo de comunicação, etc..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.examplesContainer}>
                <ThemedText style={styles.examplesTitle}>Exemplos de Personalidades:</ThemedText>
                
                <ScrollView 
                  style={styles.examplesList}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {personalities.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.exampleButton, 
                        { borderLeftColor: item.color },
                        aiPersonality.name === item.name && styles.exampleButtonSelected
                      ]}
                      onPress={() => {
                        setAiPersonality({
                          name: item.name,
                          role: item.role,
                          description: item.description
                        });
                        // Feedback visual
                        Alert.alert(
                          'Personalidade Selecionada',
                          `${item.name} foi configurado como sua IA!`,
                          [{ text: 'OK' }]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.exampleIcon, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon as any} size={20} color="white" />
                      </View>
                      <View style={styles.exampleContent}>
                        <ThemedText style={styles.exampleTitle}>
                          {item.name} - {item.role}
                        </ThemedText>
                        <ThemedText style={styles.exampleDesc}>
                          {item.shortDesc}
                        </ThemedText>
                      </View>
                      {aiPersonality.name === item.name ? (
                        <Ionicons name="checkmark-circle" size={24} color="rgb(45, 134, 99)" />
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPersonalityModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={savePersonality}
              >
                <ThemedText style={styles.saveButtonText}>Salvar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imagePickerModal}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Enviar Imagem
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowImagePickerModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.imagePickerOptions}>
              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={selectFromGallery}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="images" size={32} color="rgb(45, 134, 99)" />
                </View>
                <ThemedText style={styles.optionTitle}>
                  Escolher da Galeria
                </ThemedText>
                <ThemedText style={styles.optionDesc}>
                  Selecione uma imagem da sua galeria
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={takePhoto}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="camera" size={32} color="rgb(45, 134, 99)" />
                </View>
                <ThemedText style={styles.optionTitle}>
                  Tirar Foto
                </ThemedText>
                <ThemedText style={styles.optionDesc}>
                  Use a câmera para tirar uma foto
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelImageButton}
              onPress={() => setShowImagePickerModal(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#00FF41',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF41',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerIcon: {
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIndicator: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  historyCount: {
    fontSize: 10,
    color: '#00FF41',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#000',
  },
  messagesContainer: {
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
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#000',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666',
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FF41',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioPlayButtonPlaying: {
    backgroundColor: '#FF4444',
  },
  audioInfo: {
    flex: 1,
  },
  audioText: {
    fontSize: 14,
    color: '#00FF41',
    marginBottom: 2,
  },
  audioDuration: {
    fontSize: 12,
    color: '#666',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  playingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00FF41',
    marginHorizontal: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  loadingText: {
    marginLeft: 10,
    color: '#00FF41',
    fontSize: 14,
  },
  recordingContainer: {
    backgroundColor: '#FF4444',
    padding: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderTopWidth: 2,
    borderTopColor: '#00FF41',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#00FF41',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
  },
  imageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgb(45, 134, 99)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  audioButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgb(45, 134, 99)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  audioButtonRecording: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00FF41',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#00FF41',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF41',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF41',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  examplesContainer: {
    marginTop: 20,
    paddingBottom: 50,
    flex: 1,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF41',
    marginBottom: 12,
  },
  examplesList: {
    maxHeight: 350,
    paddingBottom: 20,
  },
  exampleButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exampleContent: {
    flex: 1,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  exampleDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  exampleButtonSelected: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    borderColor: '#00FF41',
    borderWidth: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#00FF41',
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  imageMessage: {
    alignItems: 'flex-start',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  imagePickerModal: {
    backgroundColor: '#111',
    borderRadius: 20,
    width: '90%',
    maxHeight: '60%',
    borderWidth: 2,
    borderColor: '#00FF41',
  },
  imagePickerOptions: {
    marginVertical: 20,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
  },
  optionIcon: {
    marginRight: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: '#888',
  },
  cancelImageButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  clearHistoryButton: {
    padding: 5,
  },
  saveHistoryButton: {
    padding: 5,
  },
  menuButton: {
    padding: 8,
    marginRight: 10,
  },
});
