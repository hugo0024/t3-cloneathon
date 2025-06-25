'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import {
  X,
  Key,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { profile } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-strong rounded-3xl max-w-lg w-full p-8 relative border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center">
                  <Key size={20} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="p-3 glass-hover rounded-2xl text-white/60 hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 relative z-10"
            >
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center"
                >
                  <Sparkles size={24} className="text-blue-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  API Configuration Complete
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  The OpenRouter API is already configured on the server. You can start chatting with AI models right away!
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass border border-blue-400/30 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 glass-strong rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Key size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Server-Side Configuration
                    </h3>
                    <p className="text-sm text-white/70 mb-4 leading-relaxed">
                      The OpenRouter API key is securely configured on the server, 
                      so you don't need to provide your own. Just start chatting!
                    </p>
                  </div>
                </div>
              </motion.div>

              {profile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass rounded-2xl p-4 border border-white/10"
                >
                  <h4 className="font-medium text-white mb-3">
                    Current Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Email:</span>
                      <span className="font-mono text-white/80">
                        {profile.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">API Status:</span>
                      <span className="font-mono text-green-400">
                        Configured (Server-side)
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end gap-3 mt-8 relative z-10"
            >
              <motion.button
                onClick={handleClose}
                className="btn-ghost px-6 py-3"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
