'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { createClient } from '@/lib/supabase-client';
import {
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  ArrowLeft,
  LogOut,
  Save,
  User,
  CheckCircle,
  XCircle,
  Settings,
  Palette,
  Globe,
  ChevronRight,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';

type SettingsSection = 'profile' | 'api' | 'appearance' | 'general';

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  isLogoutLoading: boolean;
}

function SettingsSidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  isLogoutLoading,
}: SettingsSidebarProps) {
  const settingsSections = [
    {
      id: 'profile' as SettingsSection,
      label: 'Profile',
      icon: User,
      color: 'blue',
    },
    {
      id: 'api' as SettingsSection,
      label: 'API Keys',
      icon: Key,
      color: 'yellow',
    },
    {
      id: 'appearance' as SettingsSection,
      label: 'Appearance',
      icon: Palette,
      color: 'pink',
    },
    {
      id: 'general' as SettingsSection,
      label: 'General',
      icon: Globe,
      color: 'indigo',
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-4 top-4 z-50 lg:hidden"
          >
            <motion.button
              onClick={onToggleCollapse}
              className="w-10 h-10 bg-white/5 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-lg transition-colors text-white/50 hover:text-white/80 border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -256, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 256 }}
            exit={{ opacity: 0, x: -256, width: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="bg-black/20 backdrop-blur-sm border-r border-white/5 flex flex-col h-screen overflow-hidden fixed lg:relative z-40"
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <Settings size={16} className="text-white/80" />
                  </div>
                  <h2 className="text-white font-semibold">Settings</h2>
                </div>
                <motion.button
                  onClick={onToggleCollapse}
                  className="lg:hidden w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {settingsSections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => onSectionChange(section.id)}
                      className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left relative ${
                        isActive
                          ? 'bg-white/10 text-white/90'
                          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSettingsIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/60 rounded-r-sm"
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          isActive ? `bg-${section.color}-500/20` : 'bg-white/5'
                        }`}
                      >
                        <Icon
                          size={14}
                          className={
                            isActive
                              ? `text-${section.color}-400`
                              : 'text-white/40'
                          }
                        />
                      </div>

                      <span className="text-sm font-medium">
                        {section.label}
                      </span>

                      <ChevronRight
                        size={12}
                        className={`ml-auto transition-transform ${
                          isActive ? 'rotate-90' : ''
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 space-y-3">
              <motion.button
                onClick={onLogout}
                disabled={isLogoutLoading}
                className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLogoutLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                  />
                ) : (
                  <LogOut size={16} />
                )}
                <span className="text-sm font-medium">
                  {isLogoutLoading ? 'Logging out...' : 'Logout'}
                </span>
              </motion.button>

              <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="flex justify-center gap-3 text-xs text-white/30">
                  <a
                    href="/nutzungsbedingungen"
                    className="hover:text-white/50 transition-colors"
                  >
                    Terms
                  </a>
                  <span>•</span>
                  <a
                    href="/datenschutz-chat"
                    className="hover:text-white/50 transition-colors"
                  >
                    Privacy
                  </a>
                  <span>•</span>
                  <a
                    href="/haftungsausschluss"
                    className="hover:text-white/50 transition-colors"
                  >
                    Disclaimer
                  </a>
                </div>
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.a
                    href="https://github.com/lulkebit/t3-cloneathon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-2 py-1.5 text-white/30 hover:text-white/60 transition-all duration-200 hover:bg-white/5 rounded-md text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="opacity-70"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="font-medium">
                      Project Info & Source Code
                    </span>
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
    </>
  );
}

function ProfileSection() {
  const { profile } = useChat();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {profile && (
        <div className="glass-strong rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Email Address
              </label>
              <div className="px-4 py-3 glass rounded-xl text-white font-mono text-sm">
                {profile.email}
              </div>
              <p className="text-xs text-white/40 mt-1">
                This is your login email and cannot be changed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Account Status
              </label>
              <div className="px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30">
                <CheckCircle size={16} />
                Active
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ApiKeysSection() {
  const { profile } = useChat();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">API Configuration</h4>
          <div className="px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle size={14} />
            Configured (Server-side)
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 glass-strong rounded-2xl flex items-center justify-center flex-shrink-0">
                <Key size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Server-Side API Configuration
                </h3>
                <p className="text-sm text-white/70 mb-4 leading-relaxed">
                  The OpenRouter API key is securely configured on the server. You don't need to provide your own API key - just start chatting with AI models!
                </p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <CheckCircle size={12} />
                  <span>20+ AI models available</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                  <CheckCircle size={12} />
                  <span>No setup required</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <h5 className="text-sm font-medium text-white mb-2">
              Available Models
            </h5>
            <p className="text-xs text-white/60 mb-3">
              Access to various AI models including GPT-4, Claude, Gemini, and more through our server-side OpenRouter integration.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="px-2 py-1 bg-white/5 rounded text-white/60">GPT-4</div>
              <div className="px-2 py-1 bg-white/5 rounded text-white/60">Claude</div>
              <div className="px-2 py-1 bg-white/5 rounded text-white/60">Gemini</div>
              <div className="px-2 py-1 bg-white/5 rounded text-white/60">Llama</div>
              <div className="px-2 py-1 bg-white/5 rounded text-white/60">Grok</div>
              <div className="px-2 py-1 bg-white/5 rounded text-white/60">+ More</div>
            </div>
          </div>

          {profile && (
            <div className="glass rounded-xl p-4">
              <h5 className="text-sm font-medium text-white mb-2">
                Account Status
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Email:</span>
                  <span className="font-mono text-white/80">
                    {profile.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">API Access:</span>
                  <span className="font-mono text-green-400">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AppearanceSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6">
        <p className="text-white/60 text-sm">
          Appearance customization will be available in a future update.
        </p>
      </div>
    </motion.div>
  );
}

function GeneralSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6">
        <p className="text-white/60 text-sm">
          General settings will be available in a future update.
        </p>
      </div>
    </motion.div>
  );
}

function SettingsPageContent() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('profile');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'profile':
        return {
          title: 'Profile Information',
          description: 'Manage your account details and preferences.',
        };
      case 'api':
        return {
          title: 'API Keys',
          description: 'Configure your API keys to access AI models.',
        };
      case 'appearance':
        return {
          title: 'Appearance',
          description: 'Customize the look and feel of the application.',
        };
      case 'general':
        return {
          title: 'General Settings',
          description: 'General application preferences and settings.',
        };
      default:
        return {
          title: 'Profile Information',
          description: 'Manage your account details and preferences.',
        };
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'api':
        return <ApiKeysSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'general':
        return <GeneralSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-screen animated-bg flex">
      <SettingsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
        isLogoutLoading={isLogoutLoading}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="h-full">
            <div className="px-4 sm:px-6 lg:px-8 py-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {getSectionTitle().title}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {getSectionTitle().description}
                  </p>
                </div>
                <motion.button
                  onClick={() => router.back()}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm font-medium">Back to Chat</span>
                </motion.button>
              </div>
              <div className="h-[calc(100%-4rem)]">{renderActiveSection()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ChatProvider>
      <SettingsPageContent />
    </ChatProvider>
  );
}
