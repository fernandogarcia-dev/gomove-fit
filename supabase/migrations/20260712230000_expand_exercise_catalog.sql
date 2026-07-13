-- Expand exercise catalog beyond the initial 16 starter exercises.
-- Idempotent: skips any exercise name that already exists.

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
SELECT
  v.name,
  v.body_region,
  v.exercise_type,
  v.difficulty,
  v.equipment,
  v.instructions,
  v.sets_reps,
  v.duration_minutes,
  v.benefits,
  v.contraindications
FROM (
  VALUES
    ('Levator scapulae stretch', 'neck', 'stretch', 'iniciante', ARRAY['none']::text[], 'Sit tall and gently pull your head forward and to the side until you feel a stretch along the back of the neck.', 'Hold 20-30 seconds per side', 5, 'Reduces neck stiffness from desk work.', 'Avoid aggressive pulling if you feel nerve symptoms.'),
    ('Neck rotation', 'neck', 'mobility', 'iniciante', ARRAY['none']::text[], 'Turn your head slowly left and right within a comfortable range. Keep shoulders relaxed.', '2 sets of 8 reps each direction', 5, 'Improves neck rotation for daily activities.', 'Move slowly; stop if dizzy.'),
    ('Scapular retraction', 'neck', 'mobility', 'iniciante', ARRAY['none']::text[], 'Pinch shoulder blades together gently, hold briefly, and release without shrugging.', '2 sets of 12 reps', 5, 'Supports better neck and shoulder alignment.', 'Keep movement pain-free.'),
    ('Prone neck extension', 'neck', 'mobility', 'intermediario', ARRAY['mat']::text[], 'Lie face down and gently lift your head a few inches while keeping chin tucked.', '2 sets of 8 reps', 6, 'Builds endurance for neck extensors.', 'Skip if you have acute neck pain.'),

    ('Pendulum swing', 'shoulders', 'mobility', 'iniciante', ARRAY['none']::text[], 'Lean forward with one hand on a table and let the other arm swing gently in small circles.', '30 seconds each direction per arm', 5, 'Relieves shoulder stiffness with low load.', 'Use small ranges if recovering from injury.'),
    ('Cross-body shoulder stretch', 'shoulders', 'stretch', 'iniciante', ARRAY['none']::text[], 'Bring one arm across your chest and use the opposite hand to gently deepen the stretch.', 'Hold 30 seconds per side', 5, 'Stretches the rear shoulder and upper back.', 'Do not force the arm past comfort.'),
    ('Scaption with band', 'shoulders', 'strength', 'intermediario', ARRAY['band']::text[], 'Raise arms diagonally in a V shape with thumbs up and light band resistance.', '2 sets of 10 reps', 8, 'Strengthens shoulder stabilizers safely.', 'Use very light resistance.'),
    ('Prone Y raise', 'shoulders', 'strength', 'intermediario', ARRAY['mat']::text[], 'Lie face down and lift arms into a Y shape while squeezing shoulder blades.', '2 sets of 8 reps', 8, 'Targets lower traps and posture muscles.', 'Keep head neutral.'),
    ('Standing row with band', 'shoulders', 'strength', 'iniciante', ARRAY['band']::text[], 'Anchor a band at chest height and pull elbows back while keeping shoulders down.', '2 sets of 12 reps', 8, 'Builds upper-back strength for shoulder support.', 'Avoid shrugging.'),
    ('Sleeper stretch', 'shoulders', 'stretch', 'intermediario', ARRAY['mat']::text[], 'Lie on your side with bottom arm bent 90 degrees and gently press wrist toward the floor.', 'Hold 30 seconds per side', 6, 'Improves internal rotation mobility.', 'Stop if sharp pinching occurs.'),

    ('Pelvic tilt', 'back', 'mobility', 'iniciante', ARRAY['mat']::text[], 'Lie on your back and gently flatten your lower back into the floor by tilting the pelvis.', '2 sets of 10 reps', 6, 'Teaches lumbar control and reduces stiffness.', 'Keep breathing steady.'),
    ('Dead bug', 'back', 'strength', 'intermediario', ARRAY['mat']::text[], 'On your back, extend opposite arm and leg while keeping your lower back stable.', '2 sets of 8 reps per side', 10, 'Builds core stability to protect the spine.', 'Move slowly and stay pain-free.'),
    ('Side plank', 'back', 'strength', 'intermediario', ARRAY['mat']::text[], 'Support your body on forearm and side of foot while keeping hips lifted in a straight line.', 'Hold 15-30 seconds per side', 8, 'Strengthens lateral core and trunk stability.', 'Modify on knees if needed.'),
    ('Thoracic rotation', 'back', 'mobility', 'iniciante', ARRAY['mat']::text[], 'On hands and knees, place one hand behind your head and rotate your upper back toward the ceiling.', '2 sets of 8 reps per side', 8, 'Improves mid-back rotation for better posture.', 'Keep hips stable.'),
    ('Superman hold', 'back', 'strength', 'intermediario', ARRAY['mat']::text[], 'Lie face down and lift chest and legs slightly off the floor while keeping neck neutral.', 'Hold 5 seconds, 8 reps', 8, 'Strengthens back extensors.', 'Use small lifts only.'),
    ('Seated spinal twist', 'back', 'mobility', 'iniciante', ARRAY['chair']::text[], 'Sit tall and rotate your upper body gently to one side while keeping hips facing forward.', 'Hold 20 seconds per side', 5, 'Adds gentle rotation to the spine.', 'Avoid forcing the twist.'),

    ('Hip flexor stretch', 'hips', 'stretch', 'iniciante', ARRAY['mat']::text[], 'Step into a gentle lunge and tuck your pelvis until you feel a stretch in the front of the hip.', 'Hold 30 seconds per side', 8, 'Reduces hip flexor tightness from sitting.', 'Use a chair for balance if needed.'),
    ('Piriformis stretch', 'hips', 'stretch', 'iniciante', ARRAY['mat']::text[], 'Lie on your back, cross one ankle over the opposite knee, and pull the thigh toward you.', 'Hold 30 seconds per side', 8, 'Relieves deep hip and glute tension.', 'Stop if numbness increases.'),
    ('Side-lying hip abduction', 'hips', 'strength', 'iniciante', ARRAY['mat']::text[], 'Lie on your side and lift the top leg a few inches while keeping toes forward.', '2 sets of 12 reps per side', 8, 'Strengthens hip stabilizers for walking and balance.', 'Keep pelvis still.'),
    ('Standing hip hinge', 'hips', 'mobility', 'intermediario', ARRAY['none']::text[], 'With soft knees, push hips back while keeping a flat back, then return to standing.', '2 sets of 10 reps', 8, 'Teaches safe hip movement patterns.', 'Only hinge as far as comfortable.'),
    ('Frog stretch', 'hips', 'stretch', 'intermediario', ARRAY['mat']::text[], 'On hands and knees, widen knees and sit hips back gently toward your heels.', 'Hold 30-45 seconds', 8, 'Opens inner hips and groin.', 'Use cushions under knees if needed.'),
    ('Single-leg balance', 'hips', 'mobility', 'iniciante', ARRAY['none', 'chair']::text[], 'Stand on one leg near support and hold balance while keeping hips level.', '3 holds of 20 seconds per leg', 5, 'Improves balance and hip control.', 'Hold support as needed.'),

    ('Terminal knee extension', 'knees', 'strength', 'iniciante', ARRAY['band']::text[], 'With a band behind the knee, straighten the leg against light resistance.', '2 sets of 12 reps per leg', 8, 'Activates the quad without heavy knee load.', 'Use light band tension.'),
    ('Calf stretch', 'knees', 'stretch', 'iniciante', ARRAY['none']::text[], 'Place hands on a wall and step one foot back, pressing the heel down to stretch the calf.', 'Hold 30 seconds per side', 5, 'Supports knee and ankle mobility.', 'Keep back heel down.'),
    ('Step-ups', 'knees', 'strength', 'intermediario', ARRAY['chair']::text[], 'Step onto a sturdy step or low chair and control the return down.', '2 sets of 8 reps per leg', 10, 'Builds functional leg strength.', 'Use a stable surface and hand support if needed.'),
    ('Wall sit', 'knees', 'strength', 'intermediario', ARRAY['none']::text[], 'Slide your back down a wall until knees are bent comfortably and hold.', 'Hold 20-30 seconds, 3 reps', 8, 'Builds quad endurance with low impact.', 'Keep knees aligned over ankles.'),
    ('Hamstring stretch', 'knees', 'stretch', 'iniciante', ARRAY['mat']::text[], 'Lie on your back and gently raise one straight leg until you feel a stretch behind the thigh.', 'Hold 30 seconds per side', 6, 'Improves flexibility for walking and bending.', 'Keep opposite knee bent if needed.'),
    ('Mini squat', 'knees', 'strength', 'iniciante', ARRAY['chair']::text[], 'Perform shallow squats to a comfortable depth while keeping chest lifted.', '2 sets of 10 reps', 8, 'Builds knee confidence with controlled range.', 'Do not push through pain.'),

    ('Standing calf raise', 'full_body', 'strength', 'iniciante', ARRAY['none', 'chair']::text[], 'Rise onto the balls of your feet, pause briefly, and lower with control.', '2 sets of 12 reps', 5, 'Strengthens calves and supports ankle stability.', 'Hold support if balance is limited.'),
    ('Side steps', 'full_body', 'mobility', 'iniciante', ARRAY['band']::text[], 'Place a light band above knees and step sideways while keeping tension on the band.', '2 sets of 10 steps each direction', 8, 'Activates hip and glute muscles for stability.', 'Use light band only.'),
    ('Arm circles warm-up', 'full_body', 'mobility', 'iniciante', ARRAY['none']::text[], 'Make small then gradually larger arm circles forward and backward.', '10 circles each direction', 5, 'Warms up shoulders before activity.', 'Reduce range if painful.'),
    ('Plank hold', 'full_body', 'strength', 'intermediario', ARRAY['mat']::text[], 'Hold a forearm plank with a straight line from head to heels.', 'Hold 15-30 seconds, 3 reps', 8, 'Builds full-body core stability.', 'Drop to knees to modify.'),
    ('Modified push-up', 'full_body', 'strength', 'intermediario', ARRAY['mat']::text[], 'Perform push-ups from knees or against a wall while keeping core engaged.', '2 sets of 8 reps', 8, 'Builds upper-body strength progressively.', 'Choose the angle that feels manageable.'),
    ('Standing hip circles', 'full_body', 'mobility', 'iniciante', ARRAY['none', 'chair']::text[], 'Hold support and make slow circles with one knee, then switch sides.', '8 circles each direction per leg', 5, 'Loosens hips before walking or exercise.', 'Stay near support for balance.'),
    ('Toe taps', 'full_body', 'mobility', 'iniciante', ARRAY['none']::text[], 'Stand tall and tap one foot forward lightly, alternating sides with control.', '2 sets of 20 taps', 5, 'Improves coordination and gentle cardio.', 'Hold a wall if needed.'),
    ('Shoulder rolls', 'full_body', 'mobility', 'iniciante', ARRAY['none']::text[], 'Roll shoulders forward and backward in smooth circles.', '10 rolls each direction', 5, 'Releases upper-body tension quickly.', 'Keep neck relaxed.'),
    ('Standing side bend', 'full_body', 'stretch', 'iniciante', ARRAY['none']::text[], 'Reach one arm overhead and lean gently to the opposite side.', 'Hold 20 seconds per side', 5, 'Stretches the side body and trunk.', 'Avoid leaning backward.'),
    ('Ankle pumps', 'full_body', 'mobility', 'iniciante', ARRAY['none']::text[], 'Seated or lying, point toes up and down through a comfortable range.', '2 sets of 15 reps', 5, 'Improves circulation and ankle mobility.', 'Move within pain-free range.'),
    ('Seated marching', 'full_body', 'mobility', 'iniciante', ARRAY['chair']::text[], 'Sit tall and alternate lifting knees toward the chest at a steady pace.', '2 minutes', 5, 'Gentle full-body warm-up for limited mobility days.', 'Use armrests for support if needed.')
) AS v(
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
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises e WHERE e.name = v.name
);
