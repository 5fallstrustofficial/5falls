export interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  title: string;
  category: "videos" | "lake" | "events" | "work";
  sort_order?: number;
}

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  // Videos
  {
    id: "gal-video-1",
    type: "video",
    src: "/video/u-2026-10-24-tree-planting-reel.mp4",
    poster: "/img/u-2026-10-24-reel.webp",
    title: "15 Dry Years to Water Again",
    category: "videos",
    sort_order: 1,
  },
  {
    id: "gal-video-2",
    type: "video",
    src: "/video/u-2026-11-05-lake-event-reel.mp4",
    poster: "/img/u-2026-11-05-reel.webp",
    title: "Lake Protection Walk & Tree Planting Reel",
    category: "videos",
    sort_order: 2,
  },
  {
    id: "gal-video-3",
    type: "video",
    src: "/video/u-2026-11-08-diwali.mp4",
    poster: "/img/u-2026-11-08-diwali.webp",
    title: "Diwali Message from Puduthangal Lake",
    category: "videos",
    sort_order: 3,
  },
  // Key Lake Images
  {
    id: "gal-lake-1",
    type: "image",
    src: "/img/hero-excavator.webp",
    title: "Excavator reshaping the bank (13 Oct 2026)",
    category: "lake",
    sort_order: 4,
  },
  {
    id: "gal-lake-2",
    type: "image",
    src: "/img/lake-with-water.webp",
    title: "Puduthangal Lake holding water with egrets",
    category: "lake",
    sort_order: 5,
  },
  {
    id: "gal-lake-3",
    type: "image",
    src: "/img/across-the-lake.webp",
    title: "Looking across the reshaped lake basin",
    category: "lake",
    sort_order: 6,
  },
  {
    id: "gal-lake-4",
    type: "image",
    src: "/img/cleared-bank.webp",
    title: "Cleared and graded lake bund perimeter",
    category: "lake",
    sort_order: 7,
  },
  {
    id: "gal-lake-5",
    type: "image",
    src: "/img/slope.webp",
    title: "Graded slope constructed to retain runoff",
    category: "lake",
    sort_order: 8,
  },
  {
    id: "gal-lake-6",
    type: "image",
    src: "/img/levelled-pylon.webp",
    title: "Ground levelled by high-tension power pylon",
    category: "lake",
    sort_order: 9,
  },
  {
    id: "gal-lake-7",
    type: "image",
    src: "/img/standing-water.webp",
    title: "Fresh catchment basin collecting early rainwater",
    category: "lake",
    sort_order: 10,
  },
  {
    id: "gal-lake-8",
    type: "image",
    src: "/img/pond-cleaned.webp",
    title: "Thulukankulam pond cleaned and revitalized",
    category: "lake",
    sort_order: 11,
  },
  // Events & Dignitaries
  {
    id: "gal-event-1",
    type: "image",
    src: "/img/u-2026-11-05-b-05.webp",
    title: "Minister Sarathkumar with S. Shanthi and team",
    category: "events",
    sort_order: 12,
  },
  {
    id: "gal-event-2",
    type: "image",
    src: "/img/u-2026-10-21-minister-1.webp",
    title: "Minister & Corporation officials inspecting inlet",
    category: "events",
    sort_order: 13,
  },
  {
    id: "gal-event-3",
    type: "image",
    src: "/img/u-2026-10-23-1.webp",
    title: "Mega tree planting drive at lake bund",
    category: "events",
    sort_order: 14,
  },
  {
    id: "gal-event-4",
    type: "image",
    src: "/img/u-2026-11-05-b-10.webp",
    title: "College student volunteers and community rally",
    category: "events",
    sort_order: 15,
  },
  {
    id: "gal-event-5",
    type: "image",
    src: "/img/u-2026-11-06-news.webp",
    title: "Chenthamil Naadu weekly front-page coverage",
    category: "events",
    sort_order: 16,
  },
  {
    id: "gal-event-6",
    type: "image",
    src: "/img/u-2026-11-05-invitation.webp",
    title: "Official restoration event invitation letter",
    category: "events",
    sort_order: 17,
  },
  // Work in Progress
  {
    id: "gal-work-1",
    type: "image",
    src: "/img/u-2026-10-15-1.webp",
    title: "Excavator working beneath dark monsoon clouds",
    category: "work",
    sort_order: 18,
  },
  {
    id: "gal-work-2",
    type: "image",
    src: "/img/u-2026-10-15-2.webp",
    title: "Uprooting invasive thorny vegetation by root",
    category: "work",
    sort_order: 19,
  },
  {
    id: "gal-work-3",
    type: "image",
    src: "/img/u-2026-10-15-3.webp",
    title: "Piles of cleared thorny brush along bund",
    category: "work",
    sort_order: 20,
  },
  {
    id: "gal-work-4",
    type: "image",
    src: "/img/u-2026-10-21-4.webp",
    title: "Water flowing into lake via stone inlet channel",
    category: "work",
    sort_order: 21,
  },
];
