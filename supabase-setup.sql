-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  openrouter_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES messages ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create message_quality_metrics table
CREATE TABLE IF NOT EXISTS message_quality_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES messages ON DELETE CASCADE NOT NULL,
  quality_score DECIMAL(5,2),
  coherence_score DECIMAL(5,2),
  relevance_score DECIMAL(5,2),
  completeness_score DECIMAL(5,2),
  clarity_score DECIMAL(5,2),
  readability_score DECIMAL(5,2),
  response_time INTEGER,
  word_count INTEGER,
  sentence_count INTEGER,
  average_sentence_length DECIMAL(5,2),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost DECIMAL(10,6),
  temperature DECIMAL(3,2),
  top_p DECIMAL(3,2),
  finish_reason TEXT,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from own conversations" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Users can insert messages to own conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM conversations WHERE id = conversation_id
    )
  );

CREATE POLICY "Users can delete messages from own conversations" ON messages
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM conversations WHERE id = conversation_id
    )
  );

-- Attachments policies
CREATE POLICY "Users can view attachments from own messages" ON attachments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT c.user_id 
      FROM conversations c 
      JOIN messages m ON c.id = m.conversation_id 
      WHERE m.id = message_id
    )
  );

CREATE POLICY "Users can insert attachments to own messages" ON attachments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT c.user_id 
      FROM conversations c 
      JOIN messages m ON c.id = m.conversation_id 
      WHERE m.id = message_id
    )
  );

-- Message quality metrics policies
CREATE POLICY "Users can view quality metrics from own messages" ON message_quality_metrics
  FOR SELECT USING (
    auth.uid() IN (
      SELECT c.user_id 
      FROM conversations c 
      JOIN messages m ON c.id = m.conversation_id 
      WHERE m.id = message_id
    )
  );

CREATE POLICY "Users can insert quality metrics for own messages" ON message_quality_metrics
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT c.user_id 
      FROM conversations c 
      JOIN messages m ON c.id = m.conversation_id 
      WHERE m.id = message_id
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 