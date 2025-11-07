import React, { useState, useRef, useEffect } from 'react';
import { FeatureGate } from './feature-gate';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  position?: 'bottom-right' | 'bottom-left';
  welcomeMessage?: string;
  placeholder?: string;
}

export const AIChatbot: React.FC<ChatbotProps> = ({
  position = 'bottom-right',
  welcomeMessage = 'Hi! I\'m your SmartFlow AI assistant. How can I help you today?',
  placeholder = 'Type your message...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: welcomeMessage,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate AI responses (replace with actual API call)
  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Intent detection
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
      return 'Our plans start at $29/month for the Starter tier. Would you like me to show you our pricing options?';
    }

    if (lowerMessage.includes('booking') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
      return 'I can help you schedule a demo or book an appointment. What time works best for you?';
    }

    if (lowerMessage.includes('feature') || lowerMessage.includes('what can')) {
      return 'SmartFlow offers analytics, booking systems, email automation, social media scheduling, and more! Which feature interests you?';
    }

    if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return 'Our support team is available 24/7. You can also check our documentation or schedule a call with our team. What would you prefer?';
    }

    if (lowerMessage.includes('demo')) {
      return 'I\'d love to show you a demo! Let me connect you with our sales team to schedule a personalized walkthrough. What industry are you in?';
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! Thanks for reaching out. Are you looking to learn more about SmartFlow, or do you have a specific question?';
    }

    // Default response
    return 'That\'s a great question! Let me connect you with a team member who can provide detailed information. Meanwhile, feel free to explore our documentation or schedule a call.';
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick actions
  const quickActions = [
    { label: 'View Pricing', icon: '💰' },
    { label: 'Schedule Demo', icon: '📅' },
    { label: 'Features', icon: '⚡' },
    { label: 'Support', icon: '💬' }
  ];

  return (
    <FeatureGate feature="chatbot_ai">
      <div
        className={`fixed ${
          position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'
        } z-50`}
      >
        {/* Chat Window */}
        {isOpen && (
          <div className="mb-4 w-96 max-w-[calc(100vw-3rem)] panel-dark border-gold shadow-gold-lg animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black-900"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gold">SmartFlow AI</h3>
                  <p className="text-xs text-gold-300">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gold-300 hover:text-gold-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-gold">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${message.role}`}
                >
                  <div className={`chat-bubble ${message.role}`}>
                    {message.content}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-message bot">
                  <div className="chat-bubble bot">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-gold-800">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInputValue(action.label)}
                    className="text-xs btn-gold-ghost px-3 py-1"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gold-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="input-dark flex-1 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="btn-gold px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gold-300 mt-2">
                Powered by SmartFlow AI • Press Enter to send
              </p>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center text-2xl shadow-gold-lg hover:scale-110 transition-transform"
          aria-label="Toggle chat"
        >
          {isOpen ? '✕' : '💬'}
        </button>

        {/* Notification Badge */}
        {!isOpen && messages.length > 1 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-black-900 animate-bounce">
            {messages.length - 1}
          </div>
        )}
      </div>
    </FeatureGate>
  );
};

// Inline Chat Component (for embedding in pages)
export const InlineChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Welcome! Ask me anything about SmartFlow Systems.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const generateResponse = (userMessage: string): string => {
    // Same logic as above
    return 'Thanks for your message! Our team will get back to you shortly.';
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <FeatureGate feature="chatbot_ai">
      <div className="panel-dark border-gold max-w-2xl mx-auto">
        <div className="p-4 border-b border-gold-800">
          <h3 className="text-xl font-bold text-gold">Chat with AI Assistant</h3>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-gold">
          {messages.map((message) => (
            <div key={message.id} className={`chat-message ${message.role}`}>
              <div className={`chat-bubble ${message.role}`}>
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message bot">
              <div className="chat-bubble bot">
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gold-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="input-dark flex-1"
            />
            <button onClick={handleSend} className="btn-gold px-6">
              Send
            </button>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

export default AIChatbot;
