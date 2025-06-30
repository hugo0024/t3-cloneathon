'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Languages,
  Code,
  MessageSquare,
  Lightbulb,
  PenTool,
  LogIn,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  prompt: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'summarize',
    icon: FileText,
    title: 'Summarize',
    description: 'Summarize text or documents',
    prompt:
      'Please summarize the following text/document and highlight the key points:',
  },
  {
    id: 'translate',
    icon: Languages,
    title: 'Translate',
    description: 'Translate text between languages',
    prompt:
      'Please translate the following text (automatically detect the source language and ask for target language if needed):',
  },
  {
    id: 'code-review',
    icon: Code,
    title: 'Code Review',
    description: 'Analyze and improve code',
    prompt:
      'Please conduct a code review for the following code. Analyze structure, performance, security and best practices:',
  },
  {
    id: 'explain',
    icon: Lightbulb,
    title: 'Explain',
    description: 'Explain complex topics simply',
    prompt:
      'Please explain the following topic/concept in a clear and structured way:',
  },
  {
    id: 'improve-writing',
    icon: PenTool,
    title: 'Improve Writing',
    description: 'Correct and improve text style',
    prompt:
      'Please improve the following text in terms of grammar, style and clarity:',
  },
  {
    id: 'brainstorm',
    icon: MessageSquare,
    title: 'Brainstorm',
    description: 'Develop and structure ideas',
    prompt: "Let's brainstorm and structure ideas about the following topic:",
  },
];

interface ChatEmptyStateProps {
  onQuickAction?: (prompt: string) => void;
  user?: any | null;
}

export function ChatEmptyState({ onQuickAction, user }: ChatEmptyStateProps) {
  const handleQuickAction = (action: QuickAction) => {
    if (onQuickAction) {
      onQuickAction(action.prompt);
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-8">
      <div className="text-center max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 mx-auto mb-6 glass-strong rounded-3xl flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
          <img
            src="/ai.png"
            alt="AI Assistant"
            className="w-14 h-14 object-contain relative z-10"
          />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-2xl font-bold text-white mb-4"
        >
          Welcome to Convex Chat
        </motion.h3>

        {!user ? (
          // Not logged in - show login prompt
          <>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-white/70 leading-relaxed mb-8"
            >
              Sign in to start chatting with multiple AI models, save your conversations, and unlock advanced features.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8"
            >
              <motion.button
                onClick={handleLogin}
                className="w-full sm:w-auto btn-primary px-8 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-3 min-w-[160px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn size={18} />
                Sign In
              </motion.button>

              <span className="text-white/50 text-sm hidden sm:inline">or</span>

              <motion.button
                onClick={handleLogin}
                className="w-full sm:w-auto glass-hover px-8 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-3 border border-white/20 min-w-[160px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserPlus size={18} />
                Sign Up
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="pt-6 border-t border-white/10"
            >
              <p className="text-white/50 text-sm mb-4">
                Sign in with your preferred method:
              </p>
              
              <div className="flex justify-center gap-4">
                <motion.div
                  className="flex items-center justify-center w-10 h-10 glass rounded-lg border border-white/10"
                  whileHover={{ scale: 1.1 }}
                >
                  <Image
                    src="/logos/google.svg"
                    alt="Google"
                    width={16}
                    height={16}
                    className="brightness-0 invert opacity-70"
                  />
                </motion.div>
                
                <motion.div
                  className="flex items-center justify-center w-10 h-10 glass rounded-lg border border-white/10"
                  whileHover={{ scale: 1.1 }}
                >
                  <Image
                    src="/logos/github.svg"
                    alt="GitHub"
                    width={16}
                    height={16}
                    className="brightness-0 invert opacity-70"
                  />
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : (
          // Logged in - show normal welcome and quick actions
          <>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-white/60 leading-relaxed mb-8"
            >
              Start a new conversation to chat with various AI models. Choose your preferred model and begin chatting!
            </motion.p>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                    onClick={() => handleQuickAction(action)}
                    className="cursor-pointer group p-3 glass-subtle hover:glass-strong rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-200 flex-shrink-0">
                        <action.icon size={16} className="text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-white group-hover:text-white/90 transition-colors duration-200">
                          {action.title}
                        </h5>
                        <p className="text-xs text-white/60 group-hover:text-white/70 transition-colors duration-200 mt-0.5 line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="flex items-center justify-center gap-2 text-sm text-white/40"
            >
              <Sparkles size={16} />
              <span>Press Enter to send, Shift+Enter for new line</span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
