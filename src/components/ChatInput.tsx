'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Attachment, ConsensusResponse } from '@/types/chat';
import { MultiModelSelector } from './MultiModelSelector';
import { AttachmentList } from './AttachmentList';
import { ChatModeToggle } from './ChatModeToggle';
import { ModelSelector } from './ModelSelector';
import { FileUploadButton } from './FileUploadButton';
import { SendButton } from './SendButton';
import {
  getModelCapabilities,
  canModelProcessFileType,
  getMaxFileSizeForModel,
} from '@/lib/model-capabilities';
import { formatModelName } from '@/lib/model-utils';

interface ChatInputProps {
  quickActionPrompt?: string;
}

export function ChatInput({ quickActionPrompt }: ChatInputProps = {}) {
  const {
    activeConversation,
    setActiveConversation,
    updateConversationTitle,
    addNewConversation,
    addOptimisticMessage,
    updateStreamingMessage,
    finalizeMessage,
    removeOptimisticMessage,
    user,
  } = useChat();

  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(() => {
    // Initialize with last used model from localStorage, fallback to 'openai/o3'
    if (typeof window !== 'undefined') {
      const lastUsedModel = localStorage.getItem('lastUsedModel');
      return lastUsedModel || 'openai/o3-mini';
    }
    return 'openai/o3-mini';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isConsensusMode, setIsConsensusMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isMultiModelSelectorOpen, setIsMultiModelSelectorOpen] =
    useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle quick action prompt changes
  useEffect(() => {
    if (quickActionPrompt) {
      setMessage(quickActionPrompt + ' ');
      // Focus the textarea after setting the message
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Place cursor at the end
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length
          );
        }
      }, 100);
    }
  }, [quickActionPrompt]);

  useEffect(() => {
    if (activeConversation && activeConversation.model) {
      // Check if this is a consensus conversation
      if (activeConversation.model.startsWith('consensus:')) {
        setIsConsensusMode(true);
        // Extract the models from the consensus string
        const modelsString = activeConversation.model.replace('consensus:', '');
        const models = modelsString ? modelsString.split(',') : [];
        setSelectedModels(models);
      } else {
        setIsConsensusMode(false);
        setSelectedModel(activeConversation.model);
      }
    } else {
      // Reset to defaults for new conversations
      setIsConsensusMode(false);
      // Load last used model from localStorage for new conversations
      const lastUsedModel = localStorage.getItem('lastUsedModel');
      setSelectedModel(lastUsedModel || 'openai/o3-mini');

      // Load last used consensus models from localStorage
      const lastUsedConsensusModels = localStorage.getItem(
        'lastUsedConsensusModels'
      );
      if (lastUsedConsensusModels) {
        try {
          const models = JSON.parse(lastUsedConsensusModels);
          if (Array.isArray(models) && models.length > 0) {
            setSelectedModels(models);
          } else {
            setSelectedModels([]);
          }
        } catch {
          setSelectedModels([]);
        }
      } else {
        setSelectedModels([]);
      }
    }
  }, [activeConversation]);

  // Clear incompatible attachments when model changes
  useEffect(() => {
    if (attachments.length > 0) {
      const compatibleAttachments = attachments.filter((attachment) =>
        canModelProcessFileType(selectedModel, attachment.file_type)
      );

      if (compatibleAttachments.length !== attachments.length) {
        setAttachments(compatibleAttachments);
        if (compatibleAttachments.length === 0) {
          alert(
            `Attachments removed: ${selectedModel} doesn't support the uploaded file types.`
          );
        } else {
          alert(
            `Some attachments removed: ${selectedModel} doesn't support all uploaded file types.`
          );
        }
      }
    }
  }, [selectedModel, attachments]);

  // Save selected consensus models to localStorage when they change
  useEffect(() => {
    if (selectedModels.length > 0 && !activeConversation) {
      localStorage.setItem(
        'lastUsedConsensusModels',
        JSON.stringify(selectedModels)
      );
    }
  }, [selectedModels, activeConversation]);

  // Save selected model to localStorage when it changes
  useEffect(() => {
    if (selectedModel && !activeConversation) {
      localStorage.setItem('lastUsedModel', selectedModel);
    }
  }, [selectedModel, activeConversation]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Constrain the height to a maximum of 128px (8rem)
      const maxHeight = 128;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachments.length === 0) || isLoading) return;

    const userMessage = message;
    const messageAttachments = [...attachments];
    setMessage('');
    setIsLoading(true);
    setStreamingMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    let conversationId: string | null = null;
    let userMessageId: string | undefined;
    let assistantMessageId: string | undefined;
    let isNewConversation = false;

    try {
      if (activeConversation) {
        conversationId = activeConversation.id;
      } else {
        isNewConversation = true;
        const createConversationResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'New Chat',
            model: selectedModel,
          }),
        });

        if (!createConversationResponse.ok) {
          throw new Error('Failed to create conversation');
        }

        const conversationData = await createConversationResponse.json();
        conversationId = conversationData.conversation.id;

        // FIRST: Add the new conversation to the list
        addNewConversation(conversationData.conversation);

        // SECOND: Set active conversation and update URL BEFORE adding messages
        setActiveConversation(conversationData.conversation);
        window.history.pushState(null, '', `/chat/${conversationId}`);

        // Small delay to ensure state is properly updated
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Add optimistic messages only after conversation is properly set
      userMessageId = addOptimisticMessage({
        conversation_id: conversationId!,
        role: 'user',
        content: userMessage,
        attachments: messageAttachments,
      });

      // Add assistant message with loading state
      assistantMessageId = addOptimisticMessage({
        conversation_id: conversationId!,
        role: 'assistant',
        content: '',
        isLoading: true,
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          model: selectedModel,
          conversationId: conversationId,
          attachments: messageAttachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let hasStartedStreaming = false;

      try {
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
                if (parsed.chunk && assistantMessageId) {
                  assistantContent += parsed.chunk;
                  hasStartedStreaming = true;
                  updateStreamingMessage(assistantMessageId, assistantContent);
                } else if (parsed.error && assistantMessageId) {
                  // Handle error from API - show error message in chat
                  const errorContent =
                    parsed.errorContent || `❌ **Error**: ${parsed.error}`;
                  finalizeMessage(assistantMessageId, errorContent);
                  hasStartedStreaming = true; // Prevent fallback finalization
                } else if (
                  parsed.titleUpdate &&
                  parsed.conversationId &&
                  parsed.title
                ) {
                  // Handle title update - update conversation title without switching chats
                  updateConversationTitle(parsed.conversationId, parsed.title);
                } else if (parsed.done && assistantMessageId) {
                  // Ensure we have content before finalizing
                  const finalContent = assistantContent || parsed.content || '';
                  finalizeMessage(
                    assistantMessageId,
                    finalContent,
                    parsed.message
                  );
                  hasStartedStreaming = true; // Mark as handled
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e, 'Data:', data);
              }
            }
          }
        }
      } finally {
        // Ensure reader is always closed
        reader.releaseLock();
      }

      // Fallback: if streaming never started and we have an assistant message, finalize it
      if (!hasStartedStreaming && assistantMessageId) {
        finalizeMessage(
          assistantMessageId,
          assistantContent || 'No response received'
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Clean up optimistic messages on error
      if (userMessageId) removeOptimisticMessage(userMessageId);
      if (assistantMessageId) removeOptimisticMessage(assistantMessageId);

      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Show error as a new message instead of replacing optimistic ones
      if (conversationId) {
        const errorMessageId = addOptimisticMessage({
          conversation_id: conversationId,
          role: 'assistant',
          content: `❌ **Error**: ${errorMessage}`,
        });
        
        // Finalize the error message immediately
        finalizeMessage(errorMessageId, `❌ **Error**: ${errorMessage}`);
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
      setAttachments([]);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  const handleConsensusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!message.trim() && attachments.length === 0) ||
      isLoading ||
      selectedModels.length === 0
    )
      return;

    const userMessage = message;
    const messageAttachments = [...attachments];
    setMessage('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    let conversationId: string | null = null;
    let userMessageId: string | undefined;
    let assistantMessageId: string | undefined;
    let isNewConversation = false;

    try {
      if (activeConversation) {
        conversationId = activeConversation.id;
      } else {
        isNewConversation = true;
        const createConversationResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'New Chat',
            model: `consensus:${selectedModels.join(',')}`,
          }),
        });

        if (!createConversationResponse.ok) {
          throw new Error('Failed to create conversation');
        }

        const conversationData = await createConversationResponse.json();
        conversationId = conversationData.conversation.id;

        // FIRST: Add the new conversation to the list
        addNewConversation(conversationData.conversation);

        // SECOND: Set active conversation and update URL BEFORE adding messages
        setActiveConversation(conversationData.conversation);
        window.history.pushState(null, '', `/chat/${conversationId}`);

        // Small delay to ensure state is properly updated
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Add optimistic messages only after conversation is properly set
      userMessageId = addOptimisticMessage({
        conversation_id: conversationId!,
        role: 'user',
        content: userMessage,
        attachments: messageAttachments,
      });

      assistantMessageId = addOptimisticMessage({
        conversation_id: conversationId!,
        role: 'assistant',
        content: '',
        isLoading: true,
        isConsensus: true,
        consensusResponses: selectedModels.map((model) => ({
          model,
          content: '',
          isLoading: true,
          responseTime: 0,
        })),
      });
      const response = await fetch('/api/chat/consensus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          models: selectedModels,
          conversationId: conversationId,
          attachments: messageAttachments,
        }),
      });

      if (!response.ok) {
        if (userMessageId) removeOptimisticMessage(userMessageId);
        if (assistantMessageId) removeOptimisticMessage(assistantMessageId);
        throw new Error('Failed to send consensus message');
      }

      if (!response.body) {
        if (userMessageId) removeOptimisticMessage(userMessageId);
        if (assistantMessageId) removeOptimisticMessage(assistantMessageId);
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let consensusResponses: ConsensusResponse[] = selectedModels.map(
        (model) => ({
          model,
          content: '',
          isLoading: true,
          responseTime: 0,
        })
      );

      let hasStartedStreaming = false;

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

              if (parsed.type === 'consensus_update' && assistantMessageId) {
                const { modelIndex, content } = parsed;
                if (modelIndex < consensusResponses.length) {
                  consensusResponses[modelIndex] = {
                    ...consensusResponses[modelIndex],
                    content,
                    isStreaming: true,
                    isLoading: false,
                  };

                  hasStartedStreaming = true;
                  updateStreamingMessage(
                    assistantMessageId,
                    JSON.stringify(consensusResponses)
                  );
                }
              } else if (
                parsed.type === 'consensus_complete' &&
                assistantMessageId
              ) {
                const { modelIndex, content, responseTime } = parsed;
                if (modelIndex < consensusResponses.length) {
                  consensusResponses[modelIndex] = {
                    ...consensusResponses[modelIndex],
                    content,
                    isStreaming: false,
                    isLoading: false,
                    responseTime,
                  };

                  updateStreamingMessage(
                    assistantMessageId,
                    JSON.stringify(consensusResponses)
                  );
                }
              } else if (
                parsed.type === 'consensus_error' &&
                assistantMessageId
              ) {
                const { modelIndex, error, responseTime } = parsed;
                if (modelIndex < consensusResponses.length) {
                  consensusResponses[modelIndex] = {
                    ...consensusResponses[modelIndex],
                    error,
                    isLoading: false,
                    isStreaming: false,
                    responseTime,
                  };

                  updateStreamingMessage(
                    assistantMessageId,
                    JSON.stringify(consensusResponses)
                  );
                }
              } else if (
                parsed.type === 'title_update' &&
                parsed.conversationId &&
                parsed.title
              ) {
                // Handle title update for consensus - update conversation title without switching chats
                updateConversationTitle(parsed.conversationId, parsed.title);
              } else if (
                parsed.type === 'consensus_final' &&
                assistantMessageId
              ) {
                finalizeMessage(
                  assistantMessageId,
                  JSON.stringify(parsed.responses),
                  parsed.message
                );
              }
            } catch (e) {
              console.error(
                'Error parsing consensus streaming data:',
                e,
                'Data:',
                data
              );
            }
          }
        }
      }

      // Fallback: if streaming never started and we have an assistant message, finalize it
      if (!hasStartedStreaming && assistantMessageId) {
        finalizeMessage(assistantMessageId, JSON.stringify(consensusResponses));
      }
    } catch (error) {
      console.error('Error sending consensus message:', error);

      if (assistantMessageId) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        finalizeMessage(assistantMessageId, `❌ **Error**: ${errorMessage}`);

        // Try to save error to database for new conversations
        if (conversationId && isNewConversation) {
          try {
            await fetch(`/api/conversations/${conversationId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                role: 'assistant',
                content: `❌ **Error**: ${errorMessage}`,
              }),
            });
          } catch (dbError) {
            console.error('Failed to save error message to database:', dbError);
          }
        }
      } else {
        if (userMessageId) {
          removeOptimisticMessage(userMessageId);
        }

        let errorMessage = 'Failed to send consensus message';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setAttachments([]);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const modelCapabilities = getModelCapabilities(selectedModel);
    const maxFileSize = getMaxFileSizeForModel(selectedModel) * 1024 * 1024; // Convert MB to bytes

    // Validate files before uploading
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Check if model supports this file type
      if (!canModelProcessFileType(selectedModel, file.type)) {
        errors.push(
          `${file.name}: File type not supported by ${selectedModel}`
        );
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        errors.push(
          `${file.name}: File too large (max ${getMaxFileSizeForModel(
            selectedModel
          )}MB)`
        );
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(`Upload errors:\n${errors.join('\n')}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', selectedModel);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload file');
        }

        return await response.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments((prev) => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <ModelSelector
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
      />

      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-center">
        <div className="w-full max-w-4xl glass-strong backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 shadow-xl chat-input-container">
          <form
            onSubmit={isConsensusMode ? handleConsensusSubmit : handleSubmit}
            className="w-full"
          >
            <AttachmentList
              attachments={attachments}
              onRemoveAttachment={removeAttachment}
            />

            <div className="relative group/send overflow-visible">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full min-h-[40px] max-h-32 resize-none bg-transparent border-none outline-none focus:outline-none disabled:opacity-50 pr-20 text-white placeholder-white/60 p-3 overflow-y-auto scrollbar-thin"
                rows={1}
                style={{ scrollbarWidth: 'thin' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (isConsensusMode) {
                      handleConsensusSubmit(e);
                    } else {
                      handleSubmit(e);
                    }
                  }
                }}
              />

              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                <FileUploadButton
                  selectedModel={selectedModel}
                  isLoading={isLoading}
                  isUploading={isUploading}
                  fileInputRef={fileInputRef}
                  onFileSelect={handleFileSelect}
                />

                <SendButton
                  isLoading={isLoading}
                  isDisabled={
                    (!message.trim() && attachments.length === 0) ||
                    isLoading ||
                    (isConsensusMode && selectedModels.length === 0)
                  }
                />
              </div>
            </div>
          </form>

          <div className="mt-3 flex items-center justify-between">
            <ChatModeToggle
              isConsensusMode={isConsensusMode}
              selectedModels={selectedModels}
              selectedModel={selectedModel}
              isLoading={isLoading}
              activeConversation={activeConversation}
              onConsenusModeToggle={() => {
                setIsConsensusMode(!isConsensusMode);
                if (!isConsensusMode && selectedModels.length === 0) {
                  // Load last used consensus models from localStorage
                  const lastUsedConsensusModels = localStorage.getItem(
                    'lastUsedConsensusModels'
                  );
                  if (lastUsedConsensusModels) {
                    try {
                      const models = JSON.parse(lastUsedConsensusModels);
                      if (Array.isArray(models) && models.length > 0) {
                        setSelectedModels(models);
                      }
                    } catch {
                      // If parsing fails, don't set any models
                    }
                  }
                }
              }}
              onMultiModelSelectorOpen={() => setIsMultiModelSelectorOpen(true)}
              onSingleModelSelectorOpen={() => setIsModelModalOpen(true)}
              formatModelName={formatModelName}
            />


          </div>
        </div>
      </div>

      <MultiModelSelector
        selectedModels={selectedModels}
        onModelsChange={setSelectedModels}
        isOpen={isMultiModelSelectorOpen}
        onClose={() => setIsMultiModelSelectorOpen(false)}
      />
    </>
  );
}
