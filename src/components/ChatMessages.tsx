'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ScrollToBottomButton } from './ScrollToBottomButton';
import { ChatEmptyState } from './ChatEmptyState';
import { MessageItem } from './MessageItem';

interface ChatMessagesProps {
  isSidebarCollapsed: boolean;
  onQuickAction?: (prompt: string) => void;
}

export function ChatMessages({
  isSidebarCollapsed,
  onQuickAction,
}: ChatMessagesProps) {
  const { messages, activeConversation, isLoading, refreshMessages, user } =
    useChat();

  // Filter messages to only show those for the active conversation
  const conversationMessages = messages.filter(
    (message) =>
      !activeConversation || message.conversation_id === activeConversation.id
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [hasShownMessages, setHasShownMessages] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Track if we've shown messages for this conversation to prevent flickering
  useEffect(() => {
    if (conversationMessages.length > 0) {
      setHasShownMessages(true);
    } else if (!activeConversation) {
      setHasShownMessages(false);
    }
  }, [conversationMessages.length, activeConversation]);

  // Check if user is near bottom of scroll container
  const checkIfNearBottom = () => {
    if (!scrollContainerRef.current) return true;
    
    const container = scrollContainerRef.current;
    const threshold = 100; // pixels from bottom
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    
    return distanceFromBottom <= threshold;
  };

  // Handle scroll events to determine if user scrolled away from bottom
  const handleScroll = () => {
    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);
    setShouldAutoScroll(nearBottom);
  };

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Safety mechanism: if we have an active conversation but no messages after loading
  // and no optimistic messages are being processed, try refreshing
  useEffect(() => {
    if (
      activeConversation &&
      !isLoading &&
      conversationMessages.length === 0 &&
      hasShownMessages === false
    ) {
      const hasActiveOptimistic = messages.some(
        (msg) =>
          msg.conversation_id === activeConversation.id &&
          msg.isOptimistic &&
          (msg.isLoading || msg.isStreaming)
      );

      if (!hasActiveOptimistic) {
        // Wait longer to ensure any optimistic operations have settled
        // and only refresh once
        const timeoutId = setTimeout(() => {
          // Double-check conditions haven't changed
          if (
            activeConversation &&
            conversationMessages.length === 0 &&
            !hasShownMessages
          ) {
            refreshMessages(activeConversation.id);
          }
        }, 2000); // Increased from 1 second to 2 seconds

        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    activeConversation?.id, // Only trigger on conversation ID change, not the whole object
    isLoading,
    conversationMessages.length,
    hasShownMessages,
    refreshMessages,
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Re-enable auto-scrolling when user manually scrolls to bottom
    setShouldAutoScroll(true);
    setIsNearBottom(true);
  };

  // Smart auto-scrolling: only scroll when new messages are added and user is near bottom
  useEffect(() => {
    const currentMessageCount = conversationMessages.length;
    
    // Check if this is a new message (count increased) or if we should auto-scroll
    const isNewMessage = currentMessageCount > lastMessageCount;
    const hasStreamingMessage = conversationMessages.some(msg => msg.isStreaming);
    
    // Auto-scroll in these cases:
    // 1. New message added and user is near bottom
    // 2. First message in a new conversation
    // 3. User explicitly wants to stay at bottom (shouldAutoScroll = true)
    if ((isNewMessage && isNearBottom) || 
        (currentMessageCount === 1 && lastMessageCount === 0) ||
        (shouldAutoScroll && !hasStreamingMessage)) {
      
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesEndRef.current && shouldAutoScroll) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
    
    setLastMessageCount(currentMessageCount);
  }, [conversationMessages.length, isNearBottom, shouldAutoScroll]);

  // Reset auto-scroll when switching conversations
  useEffect(() => {
    setShouldAutoScroll(true);
    setIsNearBottom(true);
    setLastMessageCount(0);
  }, [activeConversation?.id]);

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRetry = async (messageId: string, messageIndex: number) => {
    if (!activeConversation || retryingId) return;

    setRetryingId(messageId);

    try {
      const userMessage = conversationMessages[messageIndex - 1];
      if (!userMessage || userMessage.role !== 'user') {
        console.error('Could not find preceding user message');
        return;
      }

      const deleteResponse = await fetch(
        `/api/conversations/${activeConversation.id}/messages/${messageId}`,
        {
          method: 'DELETE',
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete message');
      }

      const model = activeConversation.model || 'openai/o3-mini';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: model,
          conversationId: activeConversation.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate response');
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.done) {
                  await refreshMessages(activeConversation.id);
                  break;
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error('Error retrying message:', error);
    } finally {
      setRetryingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-white/60">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Show empty state only if we have no conversation or no messages and we're not waiting for optimistic updates
  if (!activeConversation && conversationMessages.length === 0) {
    return <ChatEmptyState onQuickAction={onQuickAction} />;
  }

  // If we have an active conversation but no messages and we've never shown messages,
  // show a loading state while we wait for messages to load
  if (
    activeConversation &&
    conversationMessages.length === 0 &&
    !hasShownMessages
  ) {
    const hasActiveOptimistic = messages.some(
      (msg) =>
        msg.conversation_id === activeConversation.id &&
        msg.isOptimistic &&
        (msg.isLoading || msg.isStreaming)
    );

    if (!hasActiveOptimistic) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="loading-dots mb-4">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="text-white/60">Loading conversation...</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto relative">
      <ScrollToBottomButton
        scrollContainerRef={scrollContainerRef}
        onScrollToBottom={scrollToBottom}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 min-h-full">
        {conversationMessages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            messageIndex={index}
            user={user}
            activeConversation={activeConversation}
            copiedId={copiedId}
            retryingId={retryingId}
            onCopy={handleCopy}
            onRetry={handleRetry}
          />
        ))}
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
}
