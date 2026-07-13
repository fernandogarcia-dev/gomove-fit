export type SeoSection = {
  heading: string;
  paragraphs: string[];
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoLandingPage = {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  keywords: string[];
  heroSubtitle: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  relatedSlugs: string[];
};

const US_STATES = [
  { slug: "alabama", name: "Alabama", abbr: "AL" },
  { slug: "alaska", name: "Alaska", abbr: "AK" },
  { slug: "arizona", name: "Arizona", abbr: "AZ" },
  { slug: "arkansas", name: "Arkansas", abbr: "AR" },
  { slug: "california", name: "California", abbr: "CA" },
  { slug: "colorado", name: "Colorado", abbr: "CO" },
  { slug: "connecticut", name: "Connecticut", abbr: "CT" },
  { slug: "delaware", name: "Delaware", abbr: "DE" },
  { slug: "florida", name: "Florida", abbr: "FL" },
  { slug: "georgia", name: "Georgia", abbr: "GA" },
  { slug: "hawaii", name: "Hawaii", abbr: "HI" },
  { slug: "idaho", name: "Idaho", abbr: "ID" },
  { slug: "illinois", name: "Illinois", abbr: "IL" },
  { slug: "indiana", name: "Indiana", abbr: "IN" },
  { slug: "iowa", name: "Iowa", abbr: "IA" },
  { slug: "kansas", name: "Kansas", abbr: "KS" },
  { slug: "kentucky", name: "Kentucky", abbr: "KY" },
  { slug: "louisiana", name: "Louisiana", abbr: "LA" },
  { slug: "maine", name: "Maine", abbr: "ME" },
  { slug: "maryland", name: "Maryland", abbr: "MD" },
  { slug: "massachusetts", name: "Massachusetts", abbr: "MA" },
  { slug: "michigan", name: "Michigan", abbr: "MI" },
  { slug: "minnesota", name: "Minnesota", abbr: "MN" },
  { slug: "mississippi", name: "Mississippi", abbr: "MS" },
  { slug: "missouri", name: "Missouri", abbr: "MO" },
  { slug: "montana", name: "Montana", abbr: "MT" },
  { slug: "nebraska", name: "Nebraska", abbr: "NE" },
  { slug: "nevada", name: "Nevada", abbr: "NV" },
  { slug: "new-hampshire", name: "New Hampshire", abbr: "NH" },
  { slug: "new-jersey", name: "New Jersey", abbr: "NJ" },
  { slug: "new-mexico", name: "New Mexico", abbr: "NM" },
  { slug: "new-york", name: "New York", abbr: "NY" },
  { slug: "north-carolina", name: "North Carolina", abbr: "NC" },
  { slug: "north-dakota", name: "North Dakota", abbr: "ND" },
  { slug: "ohio", name: "Ohio", abbr: "OH" },
  { slug: "oklahoma", name: "Oklahoma", abbr: "OK" },
  { slug: "oregon", name: "Oregon", abbr: "OR" },
  { slug: "pennsylvania", name: "Pennsylvania", abbr: "PA" },
  { slug: "rhode-island", name: "Rhode Island", abbr: "RI" },
  { slug: "south-carolina", name: "South Carolina", abbr: "SC" },
  { slug: "south-dakota", name: "South Dakota", abbr: "SD" },
  { slug: "tennessee", name: "Tennessee", abbr: "TN" },
  { slug: "texas", name: "Texas", abbr: "TX" },
  { slug: "utah", name: "Utah", abbr: "UT" },
  { slug: "vermont", name: "Vermont", abbr: "VT" },
  { slug: "virginia", name: "Virginia", abbr: "VA" },
  { slug: "washington", name: "Washington", abbr: "WA" },
  { slug: "west-virginia", name: "West Virginia", abbr: "WV" },
  { slug: "wisconsin", name: "Wisconsin", abbr: "WI" },
  { slug: "wyoming", name: "Wyoming", abbr: "WY" },
  { slug: "district-of-columbia", name: "Washington D.C.", abbr: "DC" },
] as const;

const BODY_REGION_SEO = [
  { slug: "neck", label: "Neck", pain: "neck pain and stiffness" },
  { slug: "shoulders", label: "Shoulders", pain: "shoulder tension and tightness" },
  { slug: "upper-back", label: "Upper Back", pain: "upper back pain" },
  { slug: "lower-back", label: "Lower Back", pain: "lower back pain" },
  { slug: "chest", label: "Chest", pain: "chest tightness" },
  { slug: "elbows", label: "Elbows", pain: "elbow discomfort" },
  { slug: "wrists-hands", label: "Wrists & Hands", pain: "wrist and hand strain" },
  { slug: "core", label: "Core", pain: "core weakness and abdominal tension" },
  { slug: "hips", label: "Hips", pain: "hip tightness and discomfort" },
  { slug: "glutes", label: "Glutes", pain: "glute soreness and hip imbalance" },
  { slug: "thighs", label: "Thighs", pain: "thigh tightness" },
  { slug: "knees", label: "Knees", pain: "knee discomfort" },
  { slug: "calves", label: "Calves", pain: "calf tightness" },
  { slug: "ankles-feet", label: "Ankles & Feet", pain: "ankle and foot stiffness" },
] as const;

const CORE_INTENT_PAGES: SeoLandingPage[] = [
  {
    slug: "home-workouts",
    title: "Home Workouts — Exercise at Home Without a Gym",
    h1: "Home workouts that actually fit your space, schedule, and equipment",
    metaDescription:
      "Free home workout plans for Americans. Exercise at home with no gym, apartment gym equipment, or household items. Personalized routines in minutes.",
    keywords: [
      "home workouts",
      "workout at home",
      "home exercise routine",
      "home fitness",
      "exercises at home",
      "USA home workout",
    ],
    heroSubtitle:
      "Skip the commute to the gym. Build a weekly plan using what you already have at home or in your building.",
    sections: [
      {
        heading: "Why home workouts beat the gym for most Americans",
        paragraphs: [
          "Between gym memberships, parking, childcare, and rush-hour traffic, getting to a commercial gym is often harder than the workout itself. Home workouts remove every barrier: you train when you want, wear what you want, and use equipment you already own.",
          "GoMove builds personalized home workout plans based on your fitness level, available equipment (including none), and how much time you have. Whether you live in a studio apartment in New York or a house in Texas, your plan adapts to your reality.",
        ],
      },
      {
        heading: "What you need to start (hint: probably nothing)",
        paragraphs: [
          "Most effective home workouts need zero equipment. Bodyweight squats, planks, stretches, and mobility drills deliver real results. If you have a yoga mat, resistance band, dumbbells, or even a sturdy chair, GoMove incorporates them automatically.",
          "Many apartment and condo buildings include a small fitness room. GoMove treats that as home equipment too, so your plan uses treadmills, cable machines, or dumbbell racks when you have access.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I get a good workout at home without equipment?",
        answer:
          "Yes. Bodyweight strength, mobility, and stretching exercises are proven to improve fitness, reduce pain, and build consistency. GoMove creates no-equipment plans that progress with your level.",
      },
      {
        question: "How long should a home workout be?",
        answer:
          "Even 10 to 20 minutes counts. GoMove asks how much time you have and builds a realistic weekly plan you can actually finish.",
      },
    ],
    relatedSlugs: ["no-equipment-workout", "apartment-gym-workout", "workout-without-gym-membership"],
  },
  {
    slug: "workout-at-home-no-gym",
    title: "Workout at Home No Gym — Free Personalized Plans",
    h1: "Work out at home without a gym membership",
    metaDescription:
      "Looking for a workout at home with no gym? GoMove creates free personalized exercise plans using bodyweight, home items, or your building gym. Start in 2 minutes.",
    keywords: [
      "workout at home no gym",
      "exercise at home no gym",
      "no gym workout",
      "home workout no membership",
      "gym alternative at home",
    ],
    heroSubtitle:
      "Cancel the guilt about skipping the gym. Train at home with a plan built for your body and your equipment.",
    sections: [
      {
        heading: "You do not need a gym to stay active",
        paragraphs: [
          "Search interest for home workouts spikes every January and never really drops. Americans are tired of paying for memberships they barely use. A workout at home with no gym is not a compromise; for most people it is the most sustainable option.",
          "GoMove replaces generic YouTube playlists with a structured weekly plan. Tell us your goals, discomfort areas, and what you have at home. We match exercises from our catalog and schedule them across your week.",
        ],
      },
      {
        heading: "Apartment-friendly, neighbor-friendly, life-friendly",
        paragraphs: [
          "Low-impact options, quiet exercises, and small-space movements are built into every plan. No jumping required unless you want it. Perfect for renters, parents during nap time, and remote workers between meetings.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is working out at home as effective as the gym?",
        answer:
          "For general fitness, mobility, and pain relief, yes. Consistency matters more than equipment. A plan you follow beats a gym you never visit.",
      },
      {
        question: "What if I only have 15 minutes?",
        answer:
          "GoMove supports short sessions. Pick your time budget in the plan builder and get a focused routine.",
      },
    ],
    relatedSlugs: ["home-workouts", "small-space-workout", "beginner-home-workout"],
  },
  {
    slug: "apartment-gym-workout",
    title: "Apartment Gym Workout — Use Your Building Fitness Room",
    h1: "Apartment gym workouts without a commercial membership",
    metaDescription:
      "Make the most of your apartment or condo gym. GoMove builds workouts for building fitness rooms, limited equipment, and small spaces across the US.",
    keywords: [
      "apartment gym workout",
      "condo gym exercises",
      "building gym workout",
      "apartment fitness room",
      "hoa gym workout plan",
    ],
    heroSubtitle:
      "That treadmill and dumbbell rack in your building? We will build a plan around them.",
    sections: [
      {
        heading: "Your building gym is underrated",
        paragraphs: [
          "Most apartment and condo fitness rooms have basics: dumbbells, a bench, cables, maybe a treadmill. That is enough for a complete program. The problem is not equipment; it is not knowing what to do with 30 minutes and a half-empty room.",
          "GoMove lets you select exactly what your building gym has. Resistance bands, mats, chairs, dumbbells, or nothing at all. Your weekly plan only includes exercises you can actually perform where you live.",
        ],
      },
      {
        heading: "Designed for real apartment life",
        paragraphs: [
          "Short sessions, clear instructions, and progress tracking keep you consistent. No personal trainer required. No awkward gym bro energy. Just you, your building gym or living room, and a plan that respects your time.",
        ],
      },
    ],
    faqs: [
      {
        question: "What if my apartment gym only has a treadmill and one dumbbell?",
        answer:
          "Select the equipment you have in the GoMove plan builder. We combine machine and bodyweight work so nothing goes to waste.",
      },
      {
        question: "Can I mix apartment gym and home exercises?",
        answer:
          "Yes. Many users train in the building gym on weekdays and use bodyweight routines at home on weekends.",
      },
    ],
    relatedSlugs: ["home-workouts", "condo-gym-exercises", "dumbbell-workout-at-home"],
  },
  {
    slug: "condo-gym-exercises",
    title: "Condo Gym Exercises — Plans for Building Fitness Rooms",
    h1: "Condo gym exercises tailored to your equipment",
    metaDescription:
      "Free condo gym exercise plans for US residents. Personalized workouts for building fitness centers, limited gear, and busy schedules.",
    keywords: ["condo gym exercises", "condo fitness center workout", "building gym exercises", "condo workout plan"],
    heroSubtitle: "Stop wandering the condo gym without a plan. Get a structured weekly routine instead.",
    sections: [
      {
        heading: "Condo gyms are perfect for structured home-style training",
        paragraphs: [
          "HOA fitness centers rarely have squat racks or leg press machines, but they have enough for strength, mobility, and cardio. GoMove maps your condo gym equipment to exercises that target your goals and discomfort areas.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need to live in a specific state to use GoMove?",
        answer: "No. GoMove works anywhere in the US and internationally, but our content is optimized for American home and apartment gym lifestyles.",
      },
    ],
    relatedSlugs: ["apartment-gym-workout", "home-workouts"],
  },
  {
    slug: "no-equipment-workout",
    title: "No Equipment Workout at Home — Bodyweight Plans",
    h1: "No equipment workout plans you can do anywhere",
    metaDescription:
      "Free no equipment workouts at home. Bodyweight strength, stretching, and mobility plans personalized to your level. No gym, no gear, no excuses.",
    keywords: [
      "no equipment workout",
      "bodyweight workout at home",
      "no gear home exercise",
      "equipment free workout",
      "bodyweight exercises",
    ],
    heroSubtitle: "Your body is the gym. We will show you exactly what to do with it.",
    sections: [
      {
        heading: "Zero equipment, full results",
        paragraphs: [
          "Squats, lunges, planks, bridges, stretches, and mobility flows require nothing but floor space. GoMove filters our entire exercise catalog for no-equipment moves and sequences them into a weekly plan.",
          "Ideal for travel, hotel rooms, dorm rooms, and anyone who wants to start today without buying a single thing.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are no equipment workouts good for beginners?",
        answer: "Absolutely. GoMove labels difficulty levels and starts beginners with safe, controlled movements.",
      },
    ],
    relatedSlugs: ["home-workouts", "beginner-home-workout", "small-space-workout"],
  },
  {
    slug: "workout-without-gym-membership",
    title: "Workout Without Gym Membership — Save Money, Stay Fit",
    h1: "Work out without a gym membership and keep progressing",
    metaDescription:
      "Stop paying for a gym you never visit. Free personalized workouts at home, in your apartment gym, or with minimal equipment. Built for the US.",
    keywords: [
      "workout without gym membership",
      "cancel gym workout at home",
      "home fitness instead of gym",
      "gym free fitness plan",
    ],
    heroSubtitle: "The average US gym membership costs over $50/month. Your living room is free.",
    sections: [
      {
        heading: "The gym membership trap",
        paragraphs: [
          "Millions of Americans pay monthly gym fees and go less than once a week. Home and apartment gym training removes the financial and logistical friction. GoMove gives you structure so home training is not random.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I still build muscle without a gym?",
        answer:
          "Yes, especially as a beginner or for maintenance. Bodyweight progressions, bands, and dumbbells go a long way. GoMove includes strength exercises scaled to your level.",
      },
    ],
    relatedSlugs: ["home-workouts", "workout-at-home-no-gym"],
  },
  {
    slug: "small-space-workout",
    title: "Small Space Workout — Studio & Apartment Friendly",
    h1: "Small space workouts for apartments and studios",
    metaDescription:
      "Exercise in a small apartment or studio with quiet, low-impact workouts. Personalized plans for tight spaces across the United States.",
    keywords: [
      "small space workout",
      "apartment workout small space",
      "studio apartment exercise",
      "quiet apartment workout",
      "low impact home workout",
    ],
    heroSubtitle: "No jumping, no sprawling. Just efficient movement in the space you have.",
    sections: [
      {
        heading: "Big fitness results in small footprints",
        paragraphs: [
          "You do not need a garage gym or a spare room. Chair exercises, standing mobility, mat work, and resistance bands fit in the corner of any studio. GoMove prioritizes movements that work in real US apartments.",
        ],
      },
    ],
    faqs: [
      {
        question: "Will my downstairs neighbors hear me?",
        answer: "GoMove favors low-impact, quiet exercises by default. No burpee marathons unless you opt in.",
      },
    ],
    relatedSlugs: ["apartment-gym-workout", "no-equipment-workout"],
  },
  {
    slug: "resistance-band-workout-at-home",
    title: "Resistance Band Workout at Home",
    h1: "Resistance band workouts at home",
    metaDescription:
      "Personalized resistance band workout plans for home. Cheap, portable, apartment-friendly strength and mobility routines for all US fitness levels.",
    keywords: [
      "resistance band workout at home",
      "band exercises home",
      "resistance band exercises",
      "home band workout plan",
    ],
    heroSubtitle: "A $15 band and a smart plan beat a ignored $600 annual gym membership.",
    sections: [
      {
        heading: "Bands are the ultimate home gym upgrade",
        paragraphs: [
          "Resistance bands add load without bulk. They store in a drawer, travel in a carry-on, and work for strength, rehab, and mobility. Tell GoMove you have a band and your plan fills with band-friendly exercises.",
        ],
      },
    ],
    faqs: [
      {
        question: "What band strength should I use?",
        answer: "Start light. GoMove adjusts difficulty labels so you can progress safely.",
      },
    ],
    relatedSlugs: ["dumbbell-workout-at-home", "home-workouts"],
  },
  {
    slug: "dumbbell-workout-at-home",
    title: "Dumbbell Workout at Home — Personalized Plans",
    h1: "Dumbbell workouts at home",
    metaDescription:
      "Home dumbbell workout plans matched to your weight set and fitness level. Perfect for apartment gyms and home offices in the USA.",
    keywords: [
      "dumbbell workout at home",
      "home dumbbell routine",
      "apartment dumbbell workout",
      "dumbbell exercises home",
    ],
    heroSubtitle: "One pair of dumbbells and a plan beats wandering the gym floor.",
    sections: [
      {
        heading: "Dumbbells + structure = results",
        paragraphs: [
          "Most people with dumbbells at home do the same three moves forever. GoMove rotates exercises across the week, targets your discomfort areas, and balances push, pull, and lower body.",
        ],
      },
    ],
    faqs: [
      {
        question: "I only have light dumbbells. Is that enough?",
        answer: "Yes for mobility, endurance, and beginner strength. GoMove scales volume and exercise selection to your level.",
      },
    ],
    relatedSlugs: ["apartment-gym-workout", "resistance-band-workout-at-home"],
  },
  {
    slug: "chair-exercises-at-home",
    title: "Chair Exercises at Home — Safe & Accessible",
    h1: "Chair exercises at home for every fitness level",
    metaDescription:
      "Chair-based home exercises for seniors, beginners, and desk workers. Free personalized plans using a sturdy chair. No gym required.",
    keywords: [
      "chair exercises at home",
      "seated workout at home",
      "chair yoga exercises",
      "senior chair exercises",
    ],
    heroSubtitle: "A kitchen chair is legitimate exercise equipment. We will prove it.",
    sections: [
      {
        heading: "Chair workouts are underrated",
        paragraphs: [
          "Seated and chair-assisted exercises reduce fall risk, build leg strength, and open fitness to people who cannot get on the floor. GoMove includes chair options in every plan when you select chair as equipment.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are chair exercises only for seniors?",
        answer: "No. Desk workers, injury recovery, and beginners all benefit. Chair exercises are a tool, not an age limit.",
      },
    ],
    relatedSlugs: ["senior-exercises-at-home", "beginner-home-workout"],
  },
  {
    slug: "beginner-home-workout",
    title: "Beginner Home Workout — Start Without a Gym",
    h1: "Beginner home workouts that build habit, not burnout",
    metaDescription:
      "New to fitness? Get a free beginner home workout plan with clear instructions, safety notes, and realistic weekly goals. No gym needed.",
    keywords: [
      "beginner home workout",
      "home workout for beginners",
      "easy exercises at home",
      "start working out at home",
    ],
    heroSubtitle: "Day one should feel doable. We will meet you where you are.",
    sections: [
      {
        heading: "Starting at home is the smartest move for beginners",
        paragraphs: [
          "Gyms intimidate. Home does not. GoMove beginner plans focus on form, consistency, and gradual progression. Every exercise includes safety guidance and contraindications.",
        ],
      },
    ],
    faqs: [
      {
        question: "How many days per week should a beginner train?",
        answer: "Three days is a great start. GoMove spreads exercises across your week so you recover between sessions.",
      },
    ],
    relatedSlugs: ["no-equipment-workout", "home-workouts"],
  },
  {
    slug: "senior-exercises-at-home",
    title: "Senior Exercises at Home — Safe Personalized Plans",
    h1: "Senior exercises at home for mobility and strength",
    metaDescription:
      "Safe home exercises for seniors. Balance, mobility, and gentle strength plans with chair options. Free personalized routines across the USA.",
    keywords: [
      "senior exercises at home",
      "elderly home workout",
      "balance exercises seniors home",
      "gentle home exercises seniors",
    ],
    heroSubtitle: "Stay independent, mobile, and strong without leaving home.",
    sections: [
      {
        heading: "Aging in place includes moving well",
        paragraphs: [
          "Falls and stiffness are not inevitable. Regular gentle exercise at home improves balance, joint mobility, and confidence. GoMove lets seniors and caregivers build plans with appropriate difficulty and equipment.",
        ],
      },
    ],
    faqs: [
      {
        question: "Should seniors consult a doctor first?",
        answer:
          "Yes. GoMove includes medical disclaimers on every page. Always consult your physician before starting a new exercise program.",
      },
    ],
    relatedSlugs: ["chair-exercises-at-home", "beginner-home-workout"],
  },
  {
    slug: "work-from-home-exercises",
    title: "Work From Home Exercises — Desk Worker Relief",
    h1: "Work from home exercises for desk workers",
    metaDescription:
      "Remote worker? Fight desk posture and stiffness with quick home exercises between meetings. Free WFH stretch and mobility plans.",
    keywords: [
      "work from home exercises",
      "desk worker stretches",
      "wfh workout routine",
      "remote work exercise break",
      "neck pain desk worker",
    ],
    heroSubtitle: "Your commute is zero minutes. Use that time to move.",
    sections: [
      {
        heading: "WFH bodies need maintenance",
        paragraphs: [
          "Kitchen table ergonomics wreck necks, backs, and hips. GoMove targets the areas desk workers complain about most: neck, shoulders, lower back, and wrists. Short mobility breaks add up across the week.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I do these between Zoom calls?",
        answer: "Yes. Many exercises take 2 to 5 minutes and require no equipment or sweat.",
      },
    ],
    relatedSlugs: ["neck-pain-exercises-at-home", "lower-back-pain-exercises-at-home"],
  },
  {
    slug: "stretching-at-home",
    title: "Stretching at Home — Mobility & Flexibility Plans",
    h1: "Stretching at home for flexibility and pain relief",
    metaDescription:
      "Free personalized stretching routines at home. Target tight muscles, improve mobility, and relieve discomfort without a gym or studio.",
    keywords: [
      "stretching at home",
      "home stretch routine",
      "flexibility exercises home",
      "daily stretch plan",
    ],
    heroSubtitle: "Ten minutes of stretching beats zero minutes at the gym you never drive to.",
    sections: [
      {
        heading: "Stretching is exercise, not an afterthought",
        paragraphs: [
          "Dedicated stretch and mobility sessions reduce pain, improve range of motion, and complement strength work. GoMove builds stretch-focused weeks when that matches your goals.",
        ],
      },
    ],
    faqs: [
      {
        question: "How often should I stretch at home?",
        answer: "Daily light stretching is fine. Deeper mobility sessions 3 to 4 times per week work well for most people.",
      },
    ],
    relatedSlugs: ["mobility-exercises-at-home", "home-workouts"],
  },
  {
    slug: "mobility-exercises-at-home",
    title: "Mobility Exercises at Home",
    h1: "Mobility exercises at home for better movement",
    metaDescription:
      "Home mobility exercise plans for hips, shoulders, spine, and ankles. Personalized routines for Americans who want to move better without a gym.",
    keywords: [
      "mobility exercises at home",
      "home mobility routine",
      "joint mobility workout",
      "hip mobility home",
    ],
    heroSubtitle: "Move better, hurt less, train longer.",
    sections: [
      {
        heading: "Mobility is the foundation",
        paragraphs: [
          "Strength without mobility leads to compensation and pain. GoMove mobility exercises target the joints and tissues that limit everyday movement, using minimal space and equipment.",
        ],
      },
    ],
    faqs: [
      {
        question: "Mobility vs stretching: what is the difference?",
        answer:
          "Stretching lengthens muscle. Mobility improves how joints move through range. GoMove includes both based on your needs.",
      },
    ],
    relatedSlugs: ["stretching-at-home", "home-workouts"],
  },
];

function createStatePage(state: (typeof US_STATES)[number]): SeoLandingPage {
  return {
    slug: `home-workout-${state.slug}`,
    title: `Home Workout in ${state.name} — Exercise Without a Gym`,
    h1: `Home workouts in ${state.name} without a commercial gym`,
    metaDescription: `Free home workout app for ${state.name} (${state.abbr}). Personalized exercise plans at home, in your apartment gym, or with no equipment. No gym membership required.`,
    keywords: [
      `home workout ${state.name}`,
      `exercise at home ${state.abbr}`,
      `${state.name} home fitness`,
      `workout without gym ${state.name}`,
      `apartment gym ${state.name}`,
    ],
    heroSubtitle: `Residents across ${state.name} use GoMove to train at home, in building gyms, and on their own schedule.`,
    sections: [
      {
        heading: `Why ${state.name} residents are choosing home workouts`,
        paragraphs: [
          `From busy suburbs to downtown apartments, people in ${state.name} are skipping long commutes to commercial gyms. Home workouts and apartment gym sessions save time and money while improving consistency.`,
          `GoMove builds personalized weekly plans for your fitness level, discomfort areas, and available equipment. Whether you are in ${state.abbr} with a full dumbbell set or just a yoga mat, your plan fits.`,
        ],
      },
      {
        heading: "Works with your building gym or living room",
        paragraphs: [
          `Many ${state.name} condos and apartment complexes include fitness rooms. Select your equipment in the GoMove plan builder and get exercises that match what you actually have access to.`,
        ],
      },
    ],
    faqs: [
      {
        question: `Is GoMove available in ${state.name}?`,
        answer: `Yes. GoMove is a web app available nationwide, including all of ${state.name}. Open the plan builder on any phone, tablet, or computer.`,
      },
      {
        question: "Do I need expensive home gym equipment?",
        answer: "No. GoMove supports no-equipment plans, bands, dumbbells, chairs, and mats.",
      },
    ],
    relatedSlugs: ["home-workouts", "apartment-gym-workout", "workout-at-home-no-gym"],
  };
}

function createBodyRegionPage(region: (typeof BODY_REGION_SEO)[number]): SeoLandingPage {
  const slug = `${region.slug}-pain-exercises-at-home`;
  return {
    slug,
    title: `${region.label} Pain Exercises at Home`,
    h1: `${region.label} pain exercises you can do at home`,
    metaDescription: `Free ${region.label.toLowerCase()} pain exercises at home. Personalized stretching, mobility, and strength plans. No gym, no appointment, start in minutes.`,
    keywords: [
      `${region.label.toLowerCase()} pain exercises at home`,
      `${region.slug} pain relief exercises`,
      `home exercises for ${region.pain}`,
      `${region.label.toLowerCase()} stretches at home`,
    ],
    heroSubtitle: `Target ${region.pain} with a home exercise plan built around your level and equipment.`,
    sections: [
      {
        heading: `Home exercises for ${region.pain}`,
        paragraphs: [
          `Chronic ${region.pain} sends millions of Americans searching for relief online. Generic videos help, but a structured plan that matches your body and equipment works better.`,
          `GoMove asks where you feel discomfort, then selects ${region.label.toLowerCase()}-focused stretches, mobility drills, and gentle strength work you can do in your living room or apartment gym.`,
        ],
      },
      {
        heading: "Safety and progression built in",
        paragraphs: [
          "Every exercise in GoMove includes contraindications and difficulty labels. Start gentle, track weekly progress, and adjust as you improve.",
        ],
      },
    ],
    faqs: [
      {
        question: `Can home exercises help with ${region.pain}?`,
        answer:
          "Movement often helps stiffness and mild discomfort, but results vary. GoMove is not medical treatment. Consult a doctor or physical therapist for persistent pain.",
      },
      {
        question: "How soon will I feel results?",
        answer: "Many people notice improved mobility within 1 to 2 weeks of consistent practice. Consistency beats intensity.",
      },
    ],
    relatedSlugs: ["home-workouts", "stretching-at-home", "no-equipment-workout"],
  };
}

const STATE_PAGES = US_STATES.map(createStatePage);
const BODY_REGION_PAGES = BODY_REGION_SEO.map(createBodyRegionPage);

export const LANDING_PAGES: SeoLandingPage[] = [
  ...CORE_INTENT_PAGES,
  ...BODY_REGION_PAGES,
  ...STATE_PAGES,
];

export const LANDING_PAGE_MAP = new Map(LANDING_PAGES.map((page) => [page.slug, page]));

export const getLandingPage = (slug: string): SeoLandingPage | undefined =>
  LANDING_PAGE_MAP.get(slug);

export const getAllLandingSlugs = (): string[] => LANDING_PAGES.map((page) => page.slug);

export const GUIDE_CATEGORIES = [
  {
    title: "Home & apartment workouts",
    slugs: [
      "home-workouts",
      "workout-at-home-no-gym",
      "apartment-gym-workout",
      "condo-gym-exercises",
      "no-equipment-workout",
      "workout-without-gym-membership",
      "small-space-workout",
    ],
  },
  {
    title: "Equipment-based home training",
    slugs: [
      "resistance-band-workout-at-home",
      "dumbbell-workout-at-home",
      "chair-exercises-at-home",
    ],
  },
  {
    title: "Pain & body region guides",
    slugs: BODY_REGION_SEO.map((r) => `${r.slug}-pain-exercises-at-home`),
  },
  {
    title: "Lifestyle & beginner guides",
    slugs: [
      "beginner-home-workout",
      "senior-exercises-at-home",
      "work-from-home-exercises",
      "stretching-at-home",
      "mobility-exercises-at-home",
    ],
  },
  {
    title: "Home workouts by US state",
    slugs: US_STATES.map((s) => `home-workout-${s.slug}`),
  },
] as const;
