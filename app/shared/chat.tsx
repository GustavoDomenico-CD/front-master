import React, { useState, useEffect, useRef } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  options?: Options;
}

interface Options {
  suggestions?: string[];
}

interface ChatManagerProps {
  apiBaseUrl?: string;
}

const ChatManager: React.FC<ChatManagerProps> = ({ apiBaseUrl = '' }) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('chatTheme') || 'light');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('chatSessionId') || null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiUrl = window.location.hostname.includes('localhost') ? 'http://localhost:8080' : '';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    initBackend();
    showWelcomeMessage();
  }, []);

  const initBackend = async () => {
    let attempts = 0;
    while (attempts < 3) {
      try {
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Falha na inicialização');
        const data = await response.json();
        console.log('Backend inicializado:', data.status);
        return;
      } catch (error) {
        console.error('Erro ao inicializar backend (tentativa ' + (attempts + 1) + '):', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    addMessage("Backend indisponível após retries. Tente recarregar.", false);
  };

  const showWelcomeMessage = () => {
    const welcomeMessage = "Olá! Sou o Gustavinho, a assistente virtual da Edge Machine. Posso ajudar com dúvidas ou agendamentos. Como posso ajudar?";
    addMessage(welcomeMessage, false, {
      suggestions: ["Agendar serviço", "Dúvidas sobre serviços", "Quem Somos"]
    });
  };

  const addMessage = (text: string, isUser: boolean, options: Options = {}) => {
    if (!text) {
      text = 'Mensagem vazia ou erro desconhecido.';
    }
    const newMessage: Message = { text, isUser, timestamp: new Date(), options };
    setChatHistory(prev => [...prev, newMessage]);
    if (options.suggestions && options.suggestions.length > 0) {
      setSuggestions(options.suggestions);
    }
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const formatMessageText = (text: string) => {
    if (!text) return '';
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\- (.*?)(<br>|$)/g, '<li>$1</li>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return ('<ul>' + text + '</ul>').replace(/<br>(<li>.*?<\/li>)/g, '$1');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (message?: string, isAction: boolean = false) => {
    if (!message) {
      message = userInput.trim();
    }
    if (!message || isProcessing) return;
    setIsProcessing(true);
    if (!isAction) {
      addMessage(message, true);
      setUserInput('');
    }
    setTypingIndicator(true);
    // Aqui você implementaria a lógica de agendamento e API
    // Por simplicidade, vou simular uma resposta
    setTimeout(() => {
      addMessage("Resposta simulada do bot.", false);
      setTypingIndicator(false);
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = async () => {
    if (!window.confirm("Tem certeza que deseja iniciar uma nova conversa? Toda a conversa atual será perdida.")) {
      return;
    }
    setChatHistory([]);
    setSuggestions([]);
    setSessionId(null);
    localStorage.removeItem('chatSessionId');
    try {
      const response = await fetch(`${apiUrl}/reiniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status === 'sucesso') {
        addMessage(data.resposta, false);
      } else {
        showWelcomeMessage();
      }
    } catch (error) {
      console.error('Erro ao reiniciar conversa:', error);
      showWelcomeMessage();
    }
  };

  return (
    <section className="container" id="chat-container">
      <div className="chat-app-container">
        <header className="chat-app-header">
          <img src="Agente Virtual.png" className="chat-avatar" alt="Agente Virtual Nexa" />
          <div className="chat-header-content">
            <h1>Gustavinho</h1>
            <p className="chat-subtitle">Seu Agente Virtual da Edge Machine</p>
          </div>
        </header>

        <main className="chat-messages" id="chat-messages" ref={chatContainerRef}>
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
              <div className="message-content" dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
          ))}
          {typingIndicator && (
            <div className="typing-indicator">
              <span>Gustavinho está digitando</span>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="suggestion-buttons">
              {suggestions.map((suggestion, index) => (
                <button key={index} className="suggestion-button" onClick={() => handleSendMessage(suggestion, true)}>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </main>

        <div className="chat-input-container">
          <input
            type="text"
            id="user-input"
            placeholder="Digite sua mensagem..."
            aria-label="Digite sua mensagem"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            ref={inputRef}
          />
          <button id="send-button" onClick={() => handleSendMessage()}>Enviar</button>
          <button id="reset-button" onClick={resetChat}>
            <i className="fas fa-sync-alt"></i> Nova Conversa
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatManager;