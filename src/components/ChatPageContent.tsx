'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { SettingsModal } from '@/components/SettingsModal';
import { useDynamicTitle } from '@/lib/useDynamicTitle';
import { Key, Sparkles } from 'lucide-react';

interface ChatPageContentProps {
  chatId?: string;
}

export function ChatPageContent({ chatId }: ChatPageContentProps) {
  const {
    profile,
    isLoading,
    conversations,
    setActiveConversation,
    activeConversation,
  } = useChat();
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [quickActionPrompt, setQuickActionPrompt] = useState<string>('');

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    // Check on mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Handle quick action selection
  const handleQuickAction = (prompt: string) => {
    setQuickActionPrompt(prompt);
    // Reset after a short delay to allow the effect to trigger
    setTimeout(() => setQuickActionPrompt(''), 100);
  };

  useDynamicTitle(activeConversation);

  useEffect(() => {
    if (!isLoading && conversations.length > 0) {
      if (chatId) {
        const conversation = conversations.find((conv) => conv.id === chatId);
        if (conversation) {
          setActiveConversation(conversation);
        } else {
          // Don't redirect if we're already on a specific chat ID - might be a new conversation being created
          // Only redirect to /chat if the URL doesn't have a chat ID or it's been confirmed the conversation doesn't exist
          console.warn(
            `Conversation with ID ${chatId} not found in conversations list`
          );
          // We'll let the ChatContext handle this case instead of forcing a redirect here
        }
      } else {
        setActiveConversation(null);
      }
    }
  }, [conversations, chatId, isLoading, setActiveConversation]);

  useEffect(() => {
    if (!isLoading && profile && !profile.openrouter_api_key) {
      setShowSettings(true);
    }
  }, [profile, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center animated-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="loading-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-white/60">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile?.openrouter_api_key) {
    return (
      <div className="h-screen flex items-center justify-center animated-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-6 glass rounded-3xl flex items-center justify-center"
          >
            <Key size={32} className="text-blue-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white mb-4"
          >
            Welcome to Convex Chat
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 mb-8 leading-relaxed"
          >
            To get started, you'll need to configure your OpenRouter API key.
            This allows you to chat with various AI models.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowSettings(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={18} />
              Configure API Key
            </motion.button>
          </motion.div>
        </motion.div>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex animated-bg overflow-hidden relative"
    >
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container - responsive sizing */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`shrink-0 transition-all duration-300 ${
          isSidebarCollapsed 
            ? 'w-0 md:w-0' 
            : 'w-80 md:w-64 lg:w-72 xl:w-80'
        } max-w-[85vw] md:max-w-none ${
          !isSidebarCollapsed ? 'md:relative fixed z-40' : ''
        }`}
      >
        <ChatSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </motion.div>

      {/* Main Content Area - responsive and flexible */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 chat-grid-layout relative min-w-0"
      >
        <div className="chat-messages-container">
          <ChatMessages
            isSidebarCollapsed={isSidebarCollapsed}
            onQuickAction={handleQuickAction}
          />
        </div>

        <div className="chat-input-container">
          <ChatInput quickActionPrompt={quickActionPrompt} />
        </div>
      </motion.div>
    </motion.div>
  );
}
