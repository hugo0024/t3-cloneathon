-- Storage policies for attachments bucket

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to view files in their own folder
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete files in their own folder
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ); 