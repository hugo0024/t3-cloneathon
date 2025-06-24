'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Bot, Brain, ChevronDown, BarChart3 } from 'lucide-react';

interface ChatModeToggleProps {
  isConsensusMode: boolean;
  selectedModels: string[];
  selectedModel: string;
  isLoading: boolean;
  activeConversation: any;
  onConsenusModeToggle: () => void;
  onMultiModelSelectorOpen: () => void;
  onSingleModelSelectorOpen: () => void;
  formatModelName: (model: string) => {
    name: string;
    provider: string;
    logo: string | null;
  };
}

export function ChatModeToggle({
  isConsensusMode,
  selectedModels,
  selectedModel,
  isLoading,
  activeConversation,
  onConsenusModeToggle,
  onMultiModelSelectorOpen,
  onSingleModelSelectorOpen,
  formatModelName,
}: ChatModeToggleProps) {
  const selectedModelInfo = formatModelName(selectedModel);

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <div className="relative group/consensus-toggle">
        <button
          type="button"
          onClick={onConsenusModeToggle}
          disabled={isLoading || activeConversation !== null}
          className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all ${
            activeConversation !== null
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer'
          } ${isLoading || activeConversation !== null ? 'opacity-50' : ''} ${
            isConsensusMode
              ? 'glass-strong border-purple-400/30 bg-purple-500/10 text-purple-300'
              : 'glass-hover border-white/10 text-white/80 hover:text-white hover:scale-[1.02]'
          }`}
        >
          <Users
            size={14}
            className={`sm:w-4 sm:h-4 ${isConsensusMode ? 'text-purple-400' : 'text-white/60'}`}
          />
          <span className="hidden sm:inline">Consensus Mode</span>
          <span className="sm:hidden">Consensus</span>
        </button>

        {activeConversation !== null && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/consensus-toggle:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Mode locked for existing conversation
          </div>
        )}
      </div>

      {isConsensusMode ? (
        <div className="relative group/model-selector">
          <button
            type="button"
            onClick={onMultiModelSelectorOpen}
            disabled={isLoading || activeConversation !== null}
            className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all ${
              activeConversation !== null
                ? 'cursor-not-allowed opacity-50 text-white/40'
                : 'cursor-pointer glass-hover text-white/80 hover:text-white hover:scale-[1.02]'
            } ${isLoading || activeConversation !== null ? 'opacity-50' : ''}`}
          >
            <Brain size={14} className="text-purple-400 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {selectedModels.length} Model
              {selectedModels.length !== 1 ? 's' : ''}
            </span>
            <span className="sm:hidden">
              {selectedModels.length}M
            </span>
            <ChevronDown size={12} className="text-white/40 sm:w-3.5 sm:h-3.5" />
          </button>

          {activeConversation !== null && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/model-selector:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Models locked for existing conversation
            </div>
          )}
        </div>
      ) : (
        <div className="relative group/single-model-selector">
          <button
            onClick={onSingleModelSelectorOpen}
            disabled={isLoading || activeConversation !== null}
            className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all ${
              activeConversation !== null
                ? 'cursor-not-allowed opacity-50 text-white/40'
                : 'cursor-pointer glass-hover text-white/80 hover:text-white hover:scale-[1.02]'
            } ${isLoading || activeConversation !== null ? 'opacity-50' : ''}`}
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded flex-shrink-0">
              {selectedModelInfo.logo ? (
                <img
                  src={selectedModelInfo.logo}
                  alt={`${selectedModelInfo.provider} logo`}
                  className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Bot
                size={12}
                className={`text-blue-400 sm:w-3.5 sm:h-3.5 ${selectedModelInfo.logo ? 'hidden' : ''}`}
              />
            </div>
            <span className="hidden sm:inline">{selectedModelInfo.name}</span>
            <span className="sm:hidden truncate max-w-[60px]">{selectedModelInfo.name.split('/')[1] || selectedModelInfo.name}</span>
            <ChevronDown size={12} className="text-white/40 sm:w-3.5 sm:h-3.5" />
          </button>

          {activeConversation !== null && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/single-model-selector:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Model locked for existing conversation
            </div>
          )}
        </div>
      )}

      {/* Quality Scoring Indicator */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-white/50 ml-3">
        <BarChart3 size={14} className="text-purple-400" />
        <span>Quality Analysis Enabled</span>
      </div>
      
      {/* Mobile Quality Indicator - just icon */}
      <div className="sm:hidden flex items-center">
        <BarChart3 size={12} className="text-purple-400" />
      </div>
    </div>
  );
}
