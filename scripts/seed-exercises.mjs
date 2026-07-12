#!/usr/bin/env node

/**
 * Seeds the exercise catalog when migrations cannot be pushed from this machine.
 *
 * Required:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/seed-exercises.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { count, error: countError } = await supabase
  .from("exercises")
  .select("*", { count: "exact", head: true });

if (countError) {
  console.error("Failed to check exercises:", countError.message);
  process.exit(1);
}

if ((count ?? 0) > 0) {
  console.log(`Catalog already has ${count} exercises. Skipping seed.`);
  process.exit(0);
}

const exercises = [
  {
    name: "Chin tuck",
    body_region: "neck",
    exercise_type: "mobility",
    difficulty: "iniciante",
    equipment: ["none"],
    instructions:
      "Sit or stand tall. Gently draw your chin back, creating a double chin. Hold for 5 seconds and release.",
    sets_reps: "2 sets of 10 reps",
    duration_minutes: 5,
    benefits: "Improves neck alignment and reduces forward-head tension.",
    contraindications: "Avoid if you have acute neck pain or dizziness.",
  },
  {
    name: "Upper trap stretch",
    body_region: "neck",
    exercise_type: "stretch",
    difficulty: "iniciante",
    equipment: ["none"],
    instructions:
      "Tilt your head to one side and gently pull with the opposite hand. Hold 20-30 seconds each side.",
    sets_reps: "2 sets per side",
    duration_minutes: 5,
    benefits: "Relieves upper neck and shoulder tension.",
    contraindications: "Stop if you feel numbness or sharp pain.",
  },
  {
    name: "Doorway chest stretch",
    body_region: "shoulders",
    exercise_type: "stretch",
    difficulty: "iniciante",
    equipment: ["none"],
    instructions:
      "Place forearms on a door frame and step forward until you feel a stretch across the chest.",
    sets_reps: "Hold 30 seconds, repeat 2 times",
    duration_minutes: 5,
    benefits: "Opens the chest and reduces rounded-shoulder posture.",
    contraindications: "Avoid if you have recent shoulder injury.",
  },
  {
    name: "Wall angels",
    body_region: "shoulders",
    exercise_type: "mobility",
    difficulty: "iniciante",
    equipment: ["none"],
    instructions:
      "Stand with back against a wall. Slide arms up and down while keeping contact with the wall.",
    sets_reps: "2 sets of 8 reps",
    duration_minutes: 8,
    benefits: "Improves shoulder mobility and posture.",
    contraindications: "Use a smaller range if you feel pinching.",
  },
  {
    name: "Band external rotation",
    body_region: "shoulders",
    exercise_type: "strength",
    difficulty: "intermediario",
    equipment: ["band"],
    instructions:
      "Keep elbow at your side and rotate forearm outward against band resistance.",
    sets_reps: "2 sets of 12 reps",
    duration_minutes: 8,
    benefits: "Strengthens rotator cuff muscles.",
    contraindications: "Use light resistance only.",
  },
  {
    name: "Cat-cow",
    body_region: "back",
    exercise_type: "mobility",
    difficulty: "iniciante",
    equipment: ["mat"],
    instructions:
      "On hands and knees, alternate between arching and rounding your spine with slow breathing.",
    sets_reps: "2 sets of 10 reps",
    duration_minutes: 8,
    benefits: "Mobilizes the spine and eases lower-back stiffness.",
    contraindications: "Avoid deep flexion if you have acute disc pain.",
  },
  {
    name: "Child's pose",
    body_region: "back",
    exercise_type: "stretch",
    difficulty: "iniciante",
    equipment: ["mat"],
    instructions: "Sit back on your heels and reach arms forward on the floor. Breathe deeply.",
    sets_reps: "Hold 30-45 seconds, repeat 2 times",
    duration_minutes: 5,
    benefits: "Gently stretches the lower back and hips.",
    contraindications: "Skip if knee flexion is painful.",
  },
  {
    name: "Bird dog",
    body_region: "back",
    exercise_type: "strength",
    difficulty: "iniciante",
    equipment: ["mat"],
    instructions:
      "From hands and knees, extend opposite arm and leg while keeping your trunk stable.",
    sets_reps: "2 sets of 8 reps per side",
    duration_minutes: 10,
    benefits: "Builds core and back stability.",
    contraindications: "Keep movements small if you lose balance or feel pain.",
  },
  {
    name: "Glute bridge",
    body_region: "hips",
    exercise_type: "strength",
    difficulty: "iniciante",
    equipment: ["mat"],
    instructions:
      "Lie on your back, feet flat, and lift hips by squeezing glutes. Lower with control.",
    sets_reps: "3 sets of 12 reps",
    duration_minutes: 10,
    benefits: "Activates glutes and supports hip stability.",
    contraindications: "Avoid if you have acute hip flexor strain.",
  },
  {
    name: "Figure-four stretch",
    body_region: "hips",
    exercise_type: "stretch",
    difficulty: "iniciante",
    equipment: ["mat", "chair"],
    instructions:
      "Cross ankle over opposite knee and sit back or lean forward to stretch the hip.",
    sets_reps: "Hold 30 seconds per side",
    duration_minutes: 8,
    benefits: "Reduces hip tightness and improves mobility.",
    contraindications: "Use a chair for support if balance is limited.",
  },
  {
    name: "Clamshell",
    body_region: "hips",
    exercise_type: "strength",
    difficulty: "iniciante",
    equipment: ["mat", "band"],
    instructions:
      "Lie on your side with knees bent. Open top knee while feet stay together.",
    sets_reps: "2 sets of 12 reps per side",
    duration_minutes: 8,
    benefits: "Strengthens hip abductors.",
    contraindications: "Keep range pain-free.",
  },
  {
    name: "Heel slides",
    body_region: "knees",
    exercise_type: "mobility",
    difficulty: "iniciante",
    equipment: ["mat"],
    instructions:
      "Lie on your back and slowly slide one heel toward your hip, then back out.",
    sets_reps: "2 sets of 10 reps per leg",
    duration_minutes: 8,
    benefits: "Improves knee flexion control with low load.",
    contraindications: "Stop if you feel sharp knee pain.",
  },
  {
    name: "Straight leg raise",
    body_region: "knees",
    exercise_type: "strength",
    difficulty: "iniciante",
    equipment: ["mat"],
    instructions:
      "Lie on your back, keep one knee bent, and lift the straight leg to about 45 degrees.",
    sets_reps: "2 sets of 10 reps per leg",
    duration_minutes: 8,
    benefits: "Builds quad strength with minimal knee stress.",
    contraindications: "Do not hold your breath.",
  },
  {
    name: "Sit-to-stand",
    body_region: "knees",
    exercise_type: "strength",
    difficulty: "intermediario",
    equipment: ["chair"],
    instructions:
      "Stand up from a chair without using your hands, then sit back down with control.",
    sets_reps: "3 sets of 8 reps",
    duration_minutes: 10,
    benefits: "Functional lower-body strength for daily movement.",
    contraindications: "Use arm support if needed at first.",
  },
  {
    name: "March in place",
    body_region: "full_body",
    exercise_type: "mobility",
    difficulty: "iniciante",
    equipment: ["none"],
    instructions:
      "March gently in place, lifting knees to a comfortable height while swinging arms naturally.",
    sets_reps: "2 minutes",
    duration_minutes: 5,
    benefits: "Light warm-up for the whole body.",
    contraindications: "Hold a stable surface if balance is an issue.",
  },
  {
    name: "Bodyweight squat",
    body_region: "full_body",
    exercise_type: "strength",
    difficulty: "intermediario",
    equipment: ["none", "chair"],
    instructions:
      "Feet shoulder-width apart, sit hips back and down, then stand up while keeping chest lifted.",
    sets_reps: "3 sets of 10 reps",
    duration_minutes: 10,
    benefits: "Builds leg strength and movement confidence.",
    contraindications: "Only go as deep as your knees allow without pain.",
  },
];

const { error } = await supabase.from("exercises").insert(exercises);
if (error) {
  console.error("Failed to seed exercises:", error.message);
  process.exit(1);
}

console.log(`Seeded ${exercises.length} exercises.`);
