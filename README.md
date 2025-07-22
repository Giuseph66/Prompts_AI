# Prompts_AI

Aplicativo mobile construído com [Expo React Native](https://expo.dev) que demonstra como integrar diversos recursos de Inteligência Artificial em uma única experiência.

O objetivo é oferecer um **assistente pessoal totalmente personalizável** que possa conversar por texto, voz ou imagem, manter histórico das interações, reconhecer rostos e permitir ajustes finos de configuração sem complicação.

---

## ✨ Funcionalidades principais

- **Chat IA (ChatScreen)**
  - Conversa em tempo-real usando a API **Google Gemini**.
  - Suporte a mensagens de **texto**, **áudio** (gravação e reprodução) e **imagem** (captura ou galeria).
  - Personalidades pré-configuradas (Alice, Dr. Silva, Chef Maria, etc.) e criação/edição de novos perfis de IA.
  - Rolagem automática e indicador de carregamento durante a resposta.

- **Histórico (HistoryScreen)**
  - Lista de conversas anteriores com busca, exportação, exclusão individual ou limpeza total.
  - Cada item exibe título, avatar/persona, quantidade de mensagens e último contato.

- **Reconhecimento Facial (RecoFacial)**
  - Usa a câmera para capturar imagens e envia para um servidor FastAPI em `/recognize`.
  - Exibe em overlay os nomes identificados e permite alternar entre câmeras frontal/traseira.

- **Configurações (SettingsScreen)**
  - Permite definir **API Key**, nome do usuário, tema, notificações, criptografia, backups, etc.
  - Persistência local através de **AsyncStorage**.
  - Exportação das preferências e limpeza de todos os dados.

- **Design responsivo** com suporte a modo escuro e haptics.

---

## 🗂️ Estrutura de pastas

```
app/              # Telas com roteamento baseado em arquivos (expo-router)
  ├─ (tabs)/      # Navegação por abas (Chat)
  ├─ history.tsx  # Histórico de conversas
  ├─ reco_facial.tsx
  └─ settings.tsx
components/       # Componentes reutilizáveis (UI, animações, etc.)
assets/           # Ícones, fontes e imagens estáticas
constants/        # Cores e estilos globais
```

---

## 🚀 Começando

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Defina sua chave da API Gemini em `Settings` ou adicione uma variável de ambiente:
   ```bash
   export GEMINI_API_KEY="SUA_CHAVE_AQUI"
   ```
3. Inicie o projeto:
   ```bash
   npx expo start
   ```
4. Escolha onde abrir:
   - App dev-build
   - Emulador Android / Simulador iOS
   - Expo Go

> Para resetar o exemplo e começar do zero, execute `npm run reset-project`.

---

## 🔐 Requisitos

- Node 18 +
- Expo CLI
- Dispositivo ou emulador com câmera (para reconhecimento facial)
- Servidor FastAPI rodando em `http://192.168.0.25:8000` com endpoint `/recognize` (ajuste no arquivo `app/reco_facial.tsx` se necessário).

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.

---

Feito com ❤️ por **Jesús** e alimentado por IA.
