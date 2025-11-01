-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true);

-- Create RLS policies for school logos bucket
CREATE POLICY "School logos are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'school-logos');

CREATE POLICY "Authenticated users can upload school logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-logos');

CREATE POLICY "Users can update their school logo"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'school-logos');

CREATE POLICY "Users can delete their school logo"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'school-logos');