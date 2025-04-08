-- Add attachment columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- Create a policy to allow users to access their own attachments
CREATE POLICY "Users can access own chat attachments" ON storage.objects
  FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[1]); 