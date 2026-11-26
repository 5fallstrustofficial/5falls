export interface UpdatePost {
  id: string;
  date: string;
  displayDate: string;
  title: string;
  tamilTitle?: string;
  description: string;
  tamilDescription?: string;
  images: { src: string; alt: string; caption?: string }[];
  video?: { src: string; poster?: string; caption?: string };
  instagramUrl?: string;
  category: string;
}

export const DEFAULT_UPDATE_CATEGORIES: { id: string; label: string }[] = [
  { id: "work", label: "Excavation & Engineering" },
  { id: "event", label: "Events & Dignitaries" },
  { id: "news", label: "News & Press" },
  { id: "celebration", label: "Festivals & Thanks" },
];

export function getUpdateCategoryLabel(category: string): string {
  const found = DEFAULT_UPDATE_CATEGORIES.find((c) => c.id === category);
  return found ? found.label : category;
}

export interface WaterBody {
  id: string;
  name: string;
  tamilName: string;
  location: string;
  status: string;
  description: string;
  stats: { label: string; value: string }[];
  image: string;
  beforeImage?: string;
  afterImage?: string;
  details: string[];
}

export interface Program {
  id: string;
  title: string;
  tamilTitle?: string;
  description: string;
  iconName: string;
  stats?: string;
  highlights: string[];
}

export const SITE_METADATA = {
  name: "Five Falls Women's Welfare Trust",
  shortName: "5Falls",
  tamilName: "ஐந்தருவி மகளிர் நல அறக்கட்டளை",
  tagline: "நீருக்கு நன்றி · Gratitude to Water",
  subTagline: "Restoring Puduthangal Lake & empowering women in Tambaram, Chennai",
  regNo: "Regd. No. 87/2018 (Society Reg. No. 252/2001)",
  pan: "AATF6693A",
  darpan: "Registered with NGO Darpan & MSME (Eligible for CSR & 80G)",
  email: "fivefalls2001@gmail.com",
  instagram: "@5falls.trust",
  instagramUrl: "https://www.instagram.com/5falls.trust",
  address: "No. 21/A, Eshwari Nagar, Camp Road, Selaiyur, East Tambaram, Chennai - 600073",
  founder: {
    name: "S. Shanthi",
    tamilName: "எஸ். சாந்தி",
    role: "Founder & Secretary",
    bio: "Shanthi has worked with ExNoRa International, Chennai's pioneer environmental movement, for about 30 years. She leads the lake restoration on the field, coordinating community volunteers, self-help groups, and government administration.",
  },
  upi: {
    id: "mr.ramky-1@oksbi",
    name: "Shanthi S (Founder & Secretary)",
    qrImage: "/img/gpay-qr.png",
  },
};

export const KEY_METRICS = [
  { value: "15-16", unit: "Years", label: "Lake lay dry & neglected before work began" },
  { value: "20,000+", unit: "Families", label: "Benefiting from flood prevention & recharge" },
  { value: "02 Oct", unit: "2026", label: "Work commenced on Gandhi Jayanti" },
  { value: "18 Oct", unit: "2026", label: "Water returned after 15 dry years" },
  { value: "30+", unit: "Ponds", label: "Target water bodies across Tamil Nadu" },
];

export const PROGRAMS: Program[] = [
  {
    id: "water-bodies",
    title: "Water Bodies Restoration",
    tamilTitle: "நீர்நிலைகள் மீட்பு",
    description: "Clearing dried lakes and desilting neglected village ponds with community participation and native sapling plantations.",
    iconName: "Droplets",
    stats: "30+ ponds approved",
    highlights: ["Puduthangal Lake revived in 16 days", "Desilting with heavy machinery & community labor", "Palm tree plantation along banks for soil binding"],
  },
  {
    id: "womens-health",
    title: "Women's Health & Hygiene",
    tamilTitle: "பெண்கள் நல்வாழ்வு",
    description: "Menstrual health education, free sanitary product access, and early awareness campaigns on breast and ovarian health.",
    iconName: "HeartPulse",
    stats: "5,000+ women reached",
    highlights: ["Menstrual hygiene awareness in schools", "Reproductive health camps with specialist doctors", "Dignified care for underprivileged mothers"],
  },
  {
    id: "survivor-support",
    title: "Support for Survivors",
    tamilTitle: "பாதிக்கப்பட்டோருக்கு ஆதரவு",
    description: "Compassionate trauma-informed counselling and rehabilitation for survivors of domestic violence and sexual abuse.",
    iconName: "ShieldHeart",
    stats: "Confidential Counselling",
    highlights: ["Family mediation & emotional rehabilitation", "Legal aid linkages & protection", "Safe space network across Tambaram"],
  },
  {
    id: "self-help-groups",
    title: "Self-Help Groups & Enterprise",
    tamilTitle: "சுயஉதவி குழுக்கள்",
    description: "Guiding women from homemakers to micro-entrepreneurs with financial literacy, bank linkages, and group savings.",
    iconName: "TrendingUp",
    stats: "25+ Years Legacy",
    highlights: ["Micro-credit facilitation through banks", "Skill development in tailoring and handicrafts", "Leadership & entrepreneurship bootcamps"],
  },
  {
    id: "free-medical-camps",
    title: "Free Medical & Eye Camps",
    tamilTitle: "இலவச மருத்துவ முகாம்கள்",
    description: "Multi-district medical camps conducted in partnership with Sri Ramachandra Medical College and Hospital.",
    iconName: "Stethoscope",
    stats: "2,000+ screened · 350+ surgeries",
    highlights: ["Free cataract and retinal surgeries", "General health check-ups across 4 districts", "Free medicine distribution to rural elderly"],
  },
  {
    id: "education-youth",
    title: "Youth Mentorship & Education",
    tamilTitle: "கல்வி வழிகாட்டல்",
    description: "Umaiyaal's guidance program offering evening tuition for homeless children, school supplies, and infrastructure support.",
    iconName: "GraduationCap",
    stats: "School Infrastructure",
    highlights: ["Government school restrooms construction", "Mentorship for underprivileged girls", "Say No to Drugs youth awareness rallies"],
  },
];

export const TIMELINE_HISTORY = [
  {
    year: "2000–2001",
    title: "The Inception",
    description: "Five young women in East Tambaram transition from homemakers to entrepreneurs. In 2001, S. Shanthi registers Five Falls Women's Welfare Society (Reg. No. 252/2001).",
  },
  {
    year: "2001–2010",
    title: "Statewide Self-Help Groups",
    description: "Forming and nurturing hundreds of women's SHGs across Tamil Nadu, fostering micro-savings, bank loans, and financial independence.",
  },
  {
    year: "2010–2018",
    title: "Disaster Relief & Education",
    description: "Extensive flood relief during the devastating 2015 Chennai floods, cyclone relief following 2016 Vardah, and launching rural educational initiatives.",
  },
  {
    year: "2018",
    title: "Formation of the Trust",
    description: "Upgraded into Five Falls Women's Welfare Trust (Regd. No. 87/2018). Launched flagship personal development programs 'Vaazhvin Uyaram Velvom' and 'Maathi Yosi'.",
  },
  {
    year: "2020–2021",
    title: "COVID-19 STOP CORONA",
    description: "Frontline pandemic response with Tamil Nadu Govt at Rajiv Gandhi Government General Hospital, ration kits, masks, and essential hygiene drives.",
  },
  {
    year: "2026",
    title: "Puduthangal Lake Ecological Revival",
    description: "Securing WRD NOC and partnering with Tambaram Corporation to revive Puduthangal Lake and 30+ water bodies across Tamil Nadu.",
  },
];

export const WATER_BODIES: WaterBody[] = [
  {
    id: "puduthangal",
    name: "Puduthangal Lake",
    tamilName: "புதுத்தாங்கல் ஏரி",
    location: "Mudichur Road, Ward 52, Zone 4, Tambaram, Chennai",
    status: "Phase 1 Complete · Phase 2 In Progress",
    description: "Dry for 15-16 years and overgrown with deep thorny bushes. Desilted and shaped in October 2026 to recharge aquifers and protect 20,000 families from monsoon flooding.",
    stats: [
      { label: "Dry Period", value: "15–16 Years" },
      { label: "Water Returned", value: "18 Oct 2026" },
      { label: "Saplings Planted", value: "500+" },
      { label: "Palm Seeds Sown", value: "1,000+" },
    ],
    image: "/img/lake-with-water.webp",
    beforeImage: "/img/pond-before.webp",
    afterImage: "/img/lake-with-water.webp",
    details: [
      "Water Resources Department (WRD) formal NOC permission granted",
      "Tambaram City Municipal Corporation (Zone 4) ground support",
      "Full stone inlet channel cleaned and cleared for natural storm drainage",
      "Egrets and aquatic birds returned within days of water retention",
    ],
  },
  {
    id: "thulukankulam",
    name: "Thulukankulam Pond",
    tamilName: "துலுக்கன்குளம் குட்டை",
    location: "Tindivanam, Villupuram District",
    status: "Phase 1 Complete · CSR Phase 2 Open",
    description: "A neglected village pond once reduced to an open dumping ground. Revitalized in partnership with Tamil Nadu Volunteers and 100+ 'Uzhavar Padai' youth volunteers.",
    stats: [
      { label: "Phase 1 Inauguration", value: "District Admin" },
      { label: "Remaining Area", value: "3,000 sq ft" },
      { label: "Planned Saplings", value: "500 Native" },
      { label: "Walking Path", value: "Community Track" },
    ],
    image: "/img/pond-cleaned.webp",
    beforeImage: "/img/pond-before.webp",
    afterImage: "/img/pond-cleaned.webp",
    details: [
      "Inaugurated by Tindivanam District Administration officials",
      "Phase 2 will fence the boundary and install silt traps at inlet/outlet",
      "Community perimeter walking path with safety railings planned",
      "Welcoming CSR partners for Phase 2 completion",
    ],
  },
  {
    id: "padur-and-more",
    name: "Padur Kulam & 18 Upcoming Ponds",
    tamilName: "பாடூர் குளம் & 18 குளங்கள்",
    location: "Kanchipuram & Chengalpattu Districts",
    status: "Permissions Approved · Work Scheduling",
    description: "Part of the 12-pond foundational initiative including Padur Kulam (3.5 acres, 15 feet deep). Approval has officially been obtained for 18 additional water bodies.",
    stats: [
      { label: "Padur Kulam Area", value: "3.5 Acres" },
      { label: "Depth", value: "15 Feet" },
      { label: "Palm Saplings", value: "Perimeter Binding" },
      { label: "Approved Ponds", value: "18 Ponds" },
    ],
    image: "/img/lake-wide.webp",
    details: [
      "Soil erosion mitigation through perimeter palmyra tree planting",
      "Rainwater harvesting corridors connecting local catchment zones",
      "Community water stewardship committees formed with village panchayats",
    ],
  },
];

export const UPDATES_TIMELINE: UpdatePost[] = [
  {
    id: "post-2026-11-08-diwali",
    date: "2026-11-08",
    displayDate: "08 Nov 2026",
    title: "Happy Diwali from Puduthangal Lake",
    tamilTitle: "இனிய தீபாவளி நல்வாழ்த்துகள்! நீருக்கு நன்றி!",
    description: "Happy Diwali from all of us at 5Falls. May this festival fill your homes with light and joy. A warm appeal to all residents: please keep firecracker waste out of our restored water bodies.",
    tamilDescription: "அனைவருக்கும் இனிய தீபாவளி நல்வாழ்த்துகள்! பட்டாசு கழிவுகளை நீர்நிலைகளில் கொட்டாமல் பாதுகாப்போம். நீருக்கு நன்றி! 🪔💧",
    images: [{ src: "/img/u-2026-11-08-diwali.webp", alt: "Diwali celebration at Puduthangal Lake" }],
    video: {
      src: "/video/u-2026-11-08-diwali.mp4",
      poster: "/img/u-2026-11-08-diwali.webp",
      caption: "Diwali message from the lake bank",
    },
    instagramUrl: "https://www.instagram.com/5falls.trust",
    category: "celebration",
  },
  {
    id: "post-2026-11-06-news",
    date: "2026-11-06",
    displayDate: "06 Nov 2026",
    title: "Front Page Feature: Chenthamil Naadu Weekly",
    tamilTitle: "செய்தியில் நம் புதுத்தாங்கல் ஏரி! செந்தமிழ் நாடு முதல் பக்கம்",
    description: "Tamil weekly Chenthamil Naadu featured the revival of Puduthangal Lake on its front page (Vol. 1, Issue 18). After 20 years under thorny brush, the lake is alive again through joint civic dedication.",
    tamilDescription: "செந்தமிழ் நாடு இதழின் முதல் பக்கத்தில் புதுத்தாங்கல் ஏரி மீட்பு செய்தி. 20 ஆண்டுகள் முட்புதராக கிடந்த ஏரி மக்களின் கூட்டு உழைப்பால் நீர் நிரம்பி காட்சி அளிக்கிறது.",
    images: [{ src: "/img/u-2026-11-06-news.webp", alt: "Front page of Chenthamil Naadu newspaper" }],
    instagramUrl: "https://www.instagram.com/5falls.trust",
    category: "news",
  },
  {
    id: "post-2026-11-05-lake-event",
    date: "2026-11-05",
    displayDate: "05 Nov 2026",
    title: "Puduthangal Lake Protection & Restoration Event",
    tamilTitle: "புதுத்தாங்கல் ஏரி பாதுகாப்பு மற்றும் புனரமைப்பு விழா",
    description: "Hon'ble Minister for Human Resources Management Thiru. D. Sarathkumar joined an awareness walk, planted saplings and addressed the gathering. Attended by Justice (retd) Vaidyanathan, Commissioner Tmt. R. Saranya IAS, and over 300 students and citizens.",
    tamilDescription: "மாண்புமிகு அமைச்சர் திரு. டி. சரத்குமார், ஓய்வுபெற்ற நீதிபதி வைத்தியநாதன், மாநகராட்சி ஆணையர் திருமதி ஆர். சரண்யா இ.ஆ.ப ஆகியோர் பங்கேற்று மரக்கன்றுகள் நட்டனர்.",
    images: [
      { src: "/img/u-2026-11-05-1.webp", alt: "Minister Sarathkumar walking along lake bank" },
      { src: "/img/u-2026-11-05-2.webp", alt: "Sapling planting by dignitaries" },
      { src: "/img/u-2026-11-05-3.webp", alt: "Gathering of residents and youth volunteers" },
      { src: "/img/u-2026-11-05-4.webp", alt: "Community members at the lake bank" },
      { src: "/img/u-2026-11-05-5.webp", alt: "Group photo with SRM college volunteers" },
      { src: "/img/u-2026-11-05-b-05.webp", alt: "S. Shanthi with Minister and officials" },
      { src: "/img/u-2026-11-05-b-15.webp", alt: "Puduthangal Lake holding vast fresh water" },
    ],
    video: {
      src: "/video/u-2026-11-05-lake-event-reel.mp4",
      poster: "/img/u-2026-11-05-reel.webp",
      caption: "Minister & Community Restoration Walk Reel",
    },
    instagramUrl: "https://www.instagram.com/5falls.trust",
    category: "event",
  },
  {
    id: "post-2026-10-24-reel",
    date: "2026-10-24",
    displayDate: "24 Oct 2026",
    title: "Video Reel: 15 Dry Years to Water Again",
    tamilTitle: "15 வருட வறட்சி முடிந்து ஏரி நீர் நிறைந்தது · காணொளி",
    description: "For about 15 years, Puduthangal Lake did not hold water. From 2 October, our women's self-help group, excavators, and volunteers worked relentlessly. By 18 October, rain filled the bed. Video narrated in S. Shanthi's own voice.",
    tamilDescription: "15 ஆண்டுகள் வறண்ட நிலமாக இருந்த ஏரி இன்று தளும்புகிறது. மகளிர் சுயஉதவிக் குழுக்கள் மற்றும் ஊர் மக்களின் உழைப்பால் சாத்தியமானது. நீருக்கு நன்றி!",
    images: [{ src: "/img/u-2026-10-24-reel.webp", alt: "Video thumbnail of lake restoration journey" }],
    video: {
      src: "/video/u-2026-10-24-tree-planting-reel.mp4",
      poster: "/img/u-2026-10-24-reel.webp",
      caption: "15 Dry Years to Water Again (Narrated by S. Shanthi)",
    },
    instagramUrl: "https://www.instagram.com/5falls.trust",
    category: "work",
  },
  {
    id: "post-2026-10-23-tree-planting",
    date: "2026-10-23",
    displayDate: "23 Oct 2026",
    title: "Mega Sapling Plantation Drive",
    tamilTitle: "அமைச்சர் தலைமையில் மரக்கன்று நடும் விழா",
    description: "Hon'ble Minister Thiru. D. Sarathkumar and Tambaram Corporation Commissioner Tmt. R. Saranya IAS officially launched a sapling-planting drive along the freshly cleared banks to bind soil and establish a green canopy.",
    images: [
      { src: "/img/u-2026-10-23-1.webp", alt: "Minister Sarathkumar planting saplings" },
      { src: "/img/u-2026-10-23-3.webp", alt: "Corporation Commissioner inspecting the lake" },
      { src: "/img/u-2026-10-23-5.webp", alt: "Volunteers preparing the soil beds" },
      { src: "/img/u-2026-10-23-7.webp", alt: "Dignitaries with S. Shanthi" },
    ],
    instagramUrl: "https://www.instagram.com/5falls.trust",
    category: "event",
  },
  {
    id: "post-2026-10-21-minister-visit",
    date: "2026-10-21",
    displayDate: "21 Oct 2026",
    title: "Inlet Channel Inspection & Return of Birds",
    tamilTitle: "நீர் வரத்துக் கால்வாய் ஆய்வு · பறவைகள் வருகை",
    description: "Inspection of the restored stone inlet channel. Fresh rainwater is flowing effortlessly into the lake bed, and white egrets have returned to feed on the water for the first time in over a decade.",
    images: [
      { src: "/img/u-2026-10-21-minister-1.webp", alt: "Minister inspecting inlet canal" },
      { src: "/img/u-2026-10-21-4.webp", alt: "Water cascading into the inlet" },
      { src: "/img/u-2026-10-21-5.webp", alt: "Egrets returning to Puduthangal Lake" },
    ],
    instagramUrl: "https://www.instagram.com/5falls.trust",
    category: "work",
  },
  {
    id: "post-2026-10-15-rain-work",
    date: "2026-10-15",
    displayDate: "15 Oct 2026",
    title: "Relentless Excavation Ahead of Monsoon",
    tamilTitle: "மழை மேகங்களுக்கு நடுவிலும் வேலை தொடர்கிறது",
    description: "Heavy excavators clearing massive root systems and debris along the boundary wall under dark monsoon clouds, ensuring optimal lake bed geometry before torrential rainfall.",
    images: [
      { src: "/img/u-2026-10-15-1.webp", alt: "Excavator operating beneath rain clouds" },
      { src: "/img/u-2026-10-15-2.webp", alt: "Uprooting thorny Prosopis juliflora shrubs" },
      { src: "/img/u-2026-10-15-4.webp", alt: "Reshaped banks along the boundary wall" },
    ],
    category: "work",
  },
  {
    id: "post-2026-10-13-bank-shaping",
    date: "2026-10-13",
    displayDate: "13 Oct 2026",
    title: "Ground Levelling & Bund Reconstruction",
    tamilTitle: "ஏரிக்கரை புனரமைப்பு மற்றும் சமன் செய்தல்",
    description: "Levelling the perimeter around power transmission pylons, constructing tiered bunds to prevent future erosion, and preparing catchment zones.",
    images: [
      { src: "/img/lake-wide.webp", alt: "Wide panoramic view of cleared lake bed" },
      { src: "/img/excavator-wall.webp", alt: "Levelling earth near boundary wall" },
      { src: "/img/slope.webp", alt: "Graded slope to retain storm runoff" },
      { src: "/img/reshaped-bank.webp", alt: "Reshaped bank perimeter" },
    ],
    category: "work",
  },
];

export const DONATION_TIERS = [
  {
    amount: "₹300",
    name: "Driver Food for a Day",
    tamilName: "ஓட்டுநர் உணவுச் செலவு",
    description: "Covers meals and refreshments for machine operators and tractor drivers on site.",
    popular: false,
  },
  {
    amount: "80 Litres",
    name: "Day's Diesel Fuel",
    tamilName: "ஒரு நாள் டீசல்",
    description: "Keeps the heavy JCB and excavators running for an entire shift. You can also sponsor fuel directly.",
    popular: true,
  },
  {
    amount: "₹5,500",
    name: "Day's Vehicle Hire",
    tamilName: "ஒரு நாள் வாகன வாடகை",
    description: "Covers the daily operational hire cost of heavy machinery to desilt and reshape lake banks.",
    popular: false,
  },
  {
    amount: "Custom",
    name: "Any Contribution",
    tamilName: "தங்களால் இயன்ற உதவி",
    description: "Every single rupee counts. Even ₹100 funds tree saplings or water for community volunteers.",
    popular: false,
  },
];

export const PARTNERS = [
  {
    name: "Tamil Nadu Volunteers",
    role: "On-Ground Volunteer Partner",
    logo: "/img/tn-volunteers.png",
    description: "Coordinating youth mobilization, pond cleanups, and community awareness.",
  },
  {
    name: "ExNoRa International",
    role: "Environmental Guidance & Mentorship",
    logo: "/img/exnora.png",
    description: "Over 30 years of pioneering civic environmentalism across Chennai and Tamil Nadu.",
  },
  {
    name: "Water Resources Department (WRD)",
    role: "Government Authority",
    badge: "WRD NOC",
    description: "Government of Tamil Nadu authority granting legal No-Objection Certificate permissions.",
  },
  {
    name: "Tambaram City Municipal Corporation",
    role: "Civic Administration Support",
    badge: "Zone 4 TCMC",
    description: "Zone 4 leadership providing logistical coordination and civic machinery.",
  },
];
