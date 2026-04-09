-- Insert some demo approved skate spots
INSERT INTO skate_spots (name, description, latitude, longitude, address, spot_type, features, difficulty, status, submitted_by)
VALUES 
  (
    'Venice Beach Skate Park',
    'Iconic beachside skate park with ocean views. Features multiple bowls, rails, and street sections.',
    33.9850,
    -118.4695,
    '1800 Ocean Front Walk, Venice, CA 90291',
    'park',
    ARRAY['bowls', 'rails', 'ledges', 'stairs'],
    'intermediate',
    'approved',
    NULL
  ),
  (
    'Hollywood High 16',
    'The legendary Hollywood High 16 stair set. A bucket-list spot for street skaters.',
    34.1017,
    -118.3387,
    '1521 N Highland Ave, Los Angeles, CA 90028',
    'street',
    ARRAY['stairs', 'rails'],
    'advanced',
    'approved',
    NULL
  ),
  (
    'Stoner Skate Plaza',
    'Modern street plaza with ledges, manual pads, and flatbars. Great flow and mellow obstacles.',
    34.0307,
    -118.4504,
    '1835 Stoner Ave, Los Angeles, CA 90025',
    'plaza',
    ARRAY['ledges', 'rails', 'gaps', 'banks'],
    'beginner',
    'approved',
    NULL
  ),
  (
    'The Berrics',
    'Famous indoor private facility. Smooth floors and perfectly built obstacles.',
    34.0224,
    -118.2851,
    '2605 E Vernon Ave, Los Angeles, CA 90058',
    'park',
    ARRAY['rails', 'ledges', 'stairs', 'gaps'],
    'intermediate',
    'approved',
    NULL
  ),
  (
    'Courthouse Ledges',
    'Classic LA ledge spot near the courthouse. Smooth marble ledges.',
    34.0522,
    -118.2437,
    '111 N Hill St, Los Angeles, CA 90012',
    'street',
    ARRAY['ledges'],
    'intermediate',
    'approved',
    NULL
  ),
  (
    'DIY Under the Bridge',
    'Community built DIY spot under the 6th Street Bridge. Raw and creative obstacles.',
    34.0331,
    -118.2315,
    '6th St Bridge, Los Angeles, CA',
    'diy',
    ARRAY['banks', 'rails', 'ledges'],
    'advanced',
    'approved',
    NULL
  );
