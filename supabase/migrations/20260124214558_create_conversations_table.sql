/*
  # Create conversations and messages tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `title` (text) - عنوان المحادثة
      - `summary` (text) - ملخص تلقائي للمحادثة
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_favorite` (boolean) - لتمييز المحادثات المفضلة
      - `category` (text) - تصنيف تلقائي

    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (text) - 'user' or 'assistant'
      - `content` (text) - محتوى الرسالة
      - `type` (text) - 'text', 'image', 'code'
      - `metadata` (jsonb) - بيانات إضافية (روابط، URLs، إلخ)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for all authenticated users
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_favorite boolean DEFAULT false,
  category text DEFAULT 'عام'
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to view conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow users to delete conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  type text DEFAULT 'text' CHECK (type IN ('text', 'image', 'code')),
  metadata jsonb DEFAULT null,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing messages in conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow creating messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
