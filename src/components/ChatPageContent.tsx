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
    user,
  } = useChat();
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [quickActionPrompt, setQuickActionPrompt] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Set initial sidebar state based on screen size, but allow manual expansion
  useEffect(() => {
    if (!hasInitialized) {
      const isMobile = window.innerWidth < 768;
      setIsSidebarCollapsed(isMobile);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

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
    // API key is now handled server-side, no need to check for it
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

  // API key is now handled server-side, users can chat directly

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
            ? 'w-0' 
            : 'w-80 md:w-64 lg:w-72 xl:w-80'
        } max-w-[85vw] md:max-w-none fixed md:relative z-40 md:z-auto h-full md:h-auto inset-y-0 md:inset-y-auto left-0 md:left-auto`}
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
        className="flex-1 flex flex-col relative min-w-0 overflow-hidden h-screen"
      >
        {/* Messages Container - takes remaining space */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ChatMessages
            isSidebarCollapsed={isSidebarCollapsed}
            onQuickAction={handleQuickAction}
          />
        </div>

        {/* Input Container - only show for authenticated users */}
        {user && (
          <div className="shrink-0 max-h-[300px] overflow-hidden">
            <ChatInput quickActionPrompt={quickActionPrompt} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
