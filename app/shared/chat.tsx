'use client'
import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

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

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const dotBounce = keyframes`
  0%, 20% { transform: translateY(0); opacity: 0.55; }
  50% { transform: translateY(-4px); opacity: 1; }
  80%, 100% { transform: translateY(0); opacity: 0.55; }
`

const ChatSection = styled.section`
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
`

const AppContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: ${fadeIn} 0.25s ease both;
`

const ChatHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #764ba2 100%);
  color: white;
`

const ChatAvatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px;
`

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
`

const HeaderSubtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 12px;
  line-height: 1.2;
`

const MessagesContainer = styled.main`
  height: min(460px, 55vh);
  overflow: auto;
  padding: 14px 14px 6px;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 999px;
  }
`

const MessageBubble = styled.div<{ $isUser: boolean }>`
  display: flex;
  justify-content: ${p => p.$isUser ? 'flex-end' : 'flex-start'};
  margin: 10px 0;
`

const BubbleContent = styled.div<{ $isUser: boolean }>`
  max-width: 85%;
  border-radius: 14px;
  padding: 10px 12px;
  color: ${p => p.$isUser ? 'white' : '#1f2937'};
  background: ${p => p.$isUser ? '#3b82f6' : '#f8fafc'};
  border: ${p => p.$isUser ? 'none' : '1px solid #e5e7eb'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    margin: 4px 0;
  }

  a {
    color: ${p => p.$isUser ? '#dbeafe' : '#3b82f6'};
    text-decoration: underline;
  }
`

const MessageTime = styled.span`
  display: block;
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.7;
  text-align: right;
`

const TypingIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 13px;
  margin: 10px 0;
`

const TypingDot = styled.div<{ $delay: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7280;
  animation: ${dotBounce} 1.1s infinite;
  animation-delay: ${p => p.$delay}ms;
`

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0 0;
`

const SuggestionBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: white;
  color: #1f2937;
  padding: 8px 10px;
  font-size: 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid #e5e7eb;
  background: white;
`

const ChatInput = styled.input`
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #1f2937;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`

const SendButton = styled.button`
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`

const ResetButton = styled.button`
  border: 1px solid #e5e7eb;
  background: white;
  color: #1f2937;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`

const ChatManager: React.FC<ChatManagerProps> = ({ apiBaseUrl = '' }) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('chatTheme') || 'light'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('chatSessionId') || null
  });
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiUrl = useMemo(() => {
    if (apiBaseUrl.trim()) return apiBaseUrl.trim()
    if (typeof window === 'undefined') return ''
    return window.location.hostname.includes('localhost') ? 'http://localhost:8080' : ''
  }, [apiBaseUrl]);

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
    <ChatSection>
      <AppContainer>
        <ChatHeader>
          <ChatAvatar src="Agente Virtual.png" alt="Agente Virtual Nexa" />
          <HeaderContent>
            <HeaderTitle>Gustavinho</HeaderTitle>
            <HeaderSubtitle>Seu Agente Virtual da Edge Machine</HeaderSubtitle>
          </HeaderContent>
        </ChatHeader>

        <MessagesContainer ref={chatContainerRef}>
          {chatHistory.map((msg, index) => (
            <MessageBubble key={index} $isUser={msg.isUser}>
              <BubbleContent $isUser={msg.isUser}>
                <div dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
                <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
              </BubbleContent>
            </MessageBubble>
          ))}
          {typingIndicator && (
            <TypingIndicator>
              <span>Gustavinho está digitando</span>
              <TypingDot $delay={0} />
              <TypingDot $delay={120} />
              <TypingDot $delay={240} />
            </TypingIndicator>
          )}
          {suggestions.length > 0 && (
            <SuggestionsContainer>
              {suggestions.map((suggestion, index) => (
                <SuggestionBtn key={index} onClick={() => handleSendMessage(suggestion, true)}>
                  {suggestion}
                </SuggestionBtn>
              ))}
            </SuggestionsContainer>
          )}
        </MessagesContainer>

        <InputContainer>
          <ChatInput
            type="text"
            placeholder="Digite sua mensagem..."
            aria-label="Digite sua mensagem"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            ref={inputRef}
          />
          <SendButton onClick={() => handleSendMessage()}>Enviar</SendButton>
          <ResetButton onClick={resetChat}>Nova Conversa</ResetButton>
        </InputContainer>
      </AppContainer>
    </ChatSection>
  );
};

export default ChatManager;
