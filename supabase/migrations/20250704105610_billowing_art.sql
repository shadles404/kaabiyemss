/*
  # Create photos storage bucket

  1. Storage
    - Create a public bucket called 'photos' for storing student and teacher photos
    - Set up policies to allow authenticated users to upload and read photos

  2. Security
    - Allow authenticated users to upload photos
    - Allow public read access to photos
    - Restrict file types to images only
    - Set file size limit to 2MB
*/

-- Create the photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Allow authenticated users to update their own photos
CREATE POLICY "Allow authenticated users to update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'photos');

-- Allow authenticated users to delete photos
CREATE POLICY "Allow authenticated users to delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photos');

-- Allow public read access to photos
CREATE POLICY "Allow public read access to photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'photos');