-- Auto-assign roles on signup and promote configured admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  IF lower(NEW.email) = lower('fernando.garcia@backlinetalent.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Promote existing account if it already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('fernando.garcia@backlinetalent.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Seed starter exercise catalog (idempotent)
INSERT INTO public.exercises (
  name,
  body_region,
  exercise_type,
  difficulty,
  equipment,
  instructions,
  sets_reps,
  duration_minutes,
  benefits,
  contraindications
)
SELECT * FROM (VALUES
  (
    'Chin tuck',
    'neck',
    'mobility',
    'iniciante',
    ARRAY['none']::text[],
    'Sit or stand tall. Gently draw your chin back, creating a double chin. Hold for 5 seconds and release.',
    '2 sets of 10 reps',
    5,
    'Improves neck alignment and reduces forward-head tension.',
    'Avoid if you have acute neck pain or dizziness.'
  ),
  (
    'Upper trap stretch',
    'neck',
    'stretch',
    'iniciante',
    ARRAY['none']::text[],
    'Tilt your head to one side and gently pull with the opposite hand. Hold 20-30 seconds each side.',
    '2 sets per side',
    5,
    'Relieves upper neck and shoulder tension.',
    'Stop if you feel numbness or sharp pain.'
  ),
  (
    'Doorway chest stretch',
    'shoulders',
    'stretch',
    'iniciante',
    ARRAY['none']::text[],
    'Place forearms on a door frame and step forward until you feel a stretch across the chest.',
    'Hold 30 seconds, repeat 2 times',
    5,
    'Opens the chest and reduces rounded-shoulder posture.',
    'Avoid if you have recent shoulder injury.'
  ),
  (
    'Wall angels',
    'shoulders',
    'mobility',
    'iniciante',
    ARRAY['none']::text[],
    'Stand with back against a wall. Slide arms up and down while keeping contact with the wall.',
    '2 sets of 8 reps',
    8,
    'Improves shoulder mobility and posture.',
    'Use a smaller range if you feel pinching.'
  ),
  (
    'Band external rotation',
    'shoulders',
    'strength',
    'intermediario',
    ARRAY['band']::text[],
    'Keep elbow at your side and rotate forearm outward against band resistance.',
    '2 sets of 12 reps',
    8,
    'Strengthens rotator cuff muscles.',
    'Use light resistance only.'
  ),
  (
    'Cat-cow',
    'back',
    'mobility',
    'iniciante',
    ARRAY['mat']::text[],
    'On hands and knees, alternate between arching and rounding your spine with slow breathing.',
    '2 sets of 10 reps',
    8,
    'Mobilizes the spine and eases lower-back stiffness.',
    'Avoid deep flexion if you have acute disc pain.'
  ),
  (
    'Child''s pose',
    'back',
    'stretch',
    'iniciante',
    ARRAY['mat']::text[],
    'Sit back on your heels and reach arms forward on the floor. Breathe deeply.',
    'Hold 30-45 seconds, repeat 2 times',
    5,
    'Gently stretches the lower back and hips.',
    'Skip if knee flexion is painful.'
  ),
  (
    'Bird dog',
    'back',
    'strength',
    'iniciante',
    ARRAY['mat']::text[],
    'From hands and knees, extend opposite arm and leg while keeping your trunk stable.',
    '2 sets of 8 reps per side',
    10,
    'Builds core and back stability.',
    'Keep movements small if you lose balance or feel pain.'
  ),
  (
    'Glute bridge',
    'hips',
    'strength',
    'iniciante',
    ARRAY['mat']::text[],
    'Lie on your back, feet flat, and lift hips by squeezing glutes. Lower with control.',
    '3 sets of 12 reps',
    10,
    'Activates glutes and supports hip stability.',
    'Avoid if you have acute hip flexor strain.'
  ),
  (
    'Figure-four stretch',
    'hips',
    'stretch',
    'iniciante',
    ARRAY['mat', 'chair']::text[],
    'Cross ankle over opposite knee and sit back or lean forward to stretch the hip.',
    'Hold 30 seconds per side',
    8,
    'Reduces hip tightness and improves mobility.',
    'Use a chair for support if balance is limited.'
  ),
  (
    'Clamshell',
    'hips',
    'strength',
    'iniciante',
    ARRAY['mat', 'band']::text[],
    'Lie on your side with knees bent. Open top knee while feet stay together.',
    '2 sets of 12 reps per side',
    8,
    'Strengthens hip abductors.',
    'Keep range pain-free.'
  ),
  (
    'Heel slides',
    'knees',
    'mobility',
    'iniciante',
    ARRAY['mat']::text[],
    'Lie on your back and slowly slide one heel toward your hip, then back out.',
    '2 sets of 10 reps per leg',
    8,
    'Improves knee flexion control with low load.',
    'Stop if you feel sharp knee pain.'
  ),
  (
    'Straight leg raise',
    'knees',
    'strength',
    'iniciante',
    ARRAY['mat']::text[],
    'Lie on your back, keep one knee bent, and lift the straight leg to about 45 degrees.',
    '2 sets of 10 reps per leg',
    8,
    'Builds quad strength with minimal knee stress.',
    'Do not hold your breath.'
  ),
  (
    'Sit-to-stand',
    'knees',
    'strength',
    'intermediario',
    ARRAY['chair']::text[],
    'Stand up from a chair without using your hands, then sit back down with control.',
    '3 sets of 8 reps',
    10,
    'Functional lower-body strength for daily movement.',
    'Use arm support if needed at first.'
  ),
  (
    'March in place',
    'full_body',
    'mobility',
    'iniciante',
    ARRAY['none']::text[],
    'March gently in place, lifting knees to a comfortable height while swinging arms naturally.',
    '2 minutes',
    5,
    'Light warm-up for the whole body.',
    'Hold a stable surface if balance is an issue.'
  ),
  (
    'Bodyweight squat',
    'full_body',
    'strength',
    'intermediario',
    ARRAY['none', 'chair']::text[],
    'Feet shoulder-width apart, sit hips back and down, then stand up while keeping chest lifted.',
    '3 sets of 10 reps',
    10,
    'Builds leg strength and movement confidence.',
    'Only go as deep as your knees allow without pain.'
  )
) AS seed(
  name,
  body_region,
  exercise_type,
  difficulty,
  equipment,
  instructions,
  sets_reps,
  duration_minutes,
  benefits,
  contraindications
)
WHERE NOT EXISTS (SELECT 1 FROM public.exercises LIMIT 1);
