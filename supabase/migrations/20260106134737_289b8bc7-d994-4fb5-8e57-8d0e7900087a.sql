-- Create storage bucket for candidate avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-avatars', 'candidate-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own candidate avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'candidate-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow public read access to avatars
CREATE POLICY "Candidate avatars are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'candidate-avatars');

-- Create policy to allow users to update their own avatar
CREATE POLICY "Users can update their own candidate avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'candidate-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own avatar
CREATE POLICY "Users can delete their own candidate avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'candidate-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);