-- Add admin user
INSERT INTO admin_users (email) 
VALUES ('andrewsowinski4@gmail.com')
ON CONFLICT (email) DO NOTHING;
