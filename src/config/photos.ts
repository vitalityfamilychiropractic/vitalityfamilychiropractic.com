import type { Location } from './types';

/** Photos from the College Station design, plus Celebration substitutes. */
export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** WebP widths available for srcset. */
  widths: number[];
  position: string;
}

export const photos: Record<string, Photo> = {
  "adult-adjustment": {
    src: "/assets/img/locations/college-station/adult-adjustment-1200.jpg",
    alt: "A chiropractor adjusting an adult patient lying on an adjusting table",
    width: 2048,
    height: 1365,
    widths: [480, 800, 1200, 1800],
    position: "40% 50%",
  },
  "babies-at-sign": {
    src: "/assets/img/locations/college-station/babies-at-sign-1200.jpg",
    alt: "A team member holds two babies beneath the Vitality Family Chiropractic sign",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 70%",
  },
  "community-kids": {
    src: "/assets/img/locations/college-station/community-kids-1200.jpg",
    alt: "Four kids grinning together inside a bounce house",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 60%",
  },
  "family-wellness": {
    src: "/assets/img/locations/college-station/family-wellness-1200.jpg",
    alt: "A Vitality chiropractor smiling with a group of children in an adjusting room",
    width: 2048,
    height: 1536,
    widths: [480, 800, 1200, 1800],
    position: "50% 40%",
  },
  "infant-intraoral": {
    src: "/assets/img/locations/college-station/infant-intraoral-1200.jpg",
    alt: "A chiropractor wearing gloves gently works inside a baby's mouth as the baby lies on a padded table",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "45% 45%",
  },
  "kid-adjustment-laughing": {
    src: "/assets/img/locations/college-station/kid-adjustment-laughing-1200.jpg",
    alt: "A laughing boy lies on an adjusting table while a chiropractor gently holds his head",
    width: 1709,
    height: 2048,
    widths: [480, 800, 1200],
    position: "40% 45%",
  },
  "kid-back-adjustment": {
    src: "/assets/img/locations/college-station/kid-back-adjustment-1200.jpg",
    alt: "A chiropractor's hands gently adjusting the back of a curly-haired child lying face down on an adjusting table",
    width: 2048,
    height: 1365,
    widths: [480, 800, 1200, 1800],
    position: "45% 50%",
  },
  "kid-laughing-bw": {
    src: "/assets/img/locations/college-station/kid-laughing-bw-1200.jpg",
    alt: "Black-and-white photo of a laughing boy lying on an adjusting table while a chiropractor gently holds his head",
    width: 1709,
    height: 2048,
    widths: [480, 800, 1200],
    position: "40% 45%",
  },
  "mom-and-baby": {
    src: "/assets/img/locations/college-station/mom-and-baby-1200.jpg",
    alt: "A smiling mom holds her grinning baby, who is wearing a ball cap",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 45%",
  },
  "mural-detail": {
    src: "/assets/img/locations/college-station/mural-detail-491.jpg",
    alt: "",
    width: 491,
    height: 345,
    widths: [480],
    position: "50% 50%",
  },
  "newborn-care": {
    src: "/assets/img/locations/college-station/newborn-care-1200.jpg",
    alt: "A chiropractor gently cradles the head of a sleeping newborn",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 40%",
  },
  "office-reception": {
    src: "/assets/img/locations/college-station/office-reception-1200.jpg",
    alt: "The Vitality Family Chiropractic reception desk, painted dusty blue, in front of a colorful floral wall mural",
    width: 2048,
    height: 1536,
    widths: [480, 800, 1200, 1800],
    position: "55% 50%",
  },
  "office-waiting-room": {
    src: "/assets/img/locations/college-station/office-waiting-room-1200.jpg",
    alt: "The Vitality waiting room with a basket of toys, rows of chairs and a floral wall mural",
    width: 2048,
    height: 1536,
    widths: [480, 800, 1200, 1800],
    position: "60% 55%",
  },
  "pediatric-smile": {
    src: "/assets/img/locations/college-station/pediatric-smile-1200.jpg",
    alt: "A smiling curly-haired boy at a chiropractic table, with a chiropractor standing behind him",
    width: 1365,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 35%",
  },
  "portrait-candice": {
    src: "/assets/img/staff/portrait-candice-1200.jpg",
    alt: "Candice smiling in front of a stone wall",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 28%",
  },
  "portrait-christie": {
    src: "/assets/img/staff/portrait-christie-853.jpg",
    alt: "Dr. Christie smiling in front of a stone wall",
    width: 853,
    height: 1065,
    widths: [480, 800],
    position: "50% 30%",
  },
  "portrait-mikah": {
    src: "/assets/img/staff/portrait-mikah-1200.jpg",
    alt: "Dr. Mikah smiling in front of a stone wall",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "45% 35%",
  },
  "portrait-yvonne": {
    src: "/assets/img/staff/portrait-yvonne-1200.jpg",
    alt: "Yvonne smiling in front of a stone wall",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 30%",
  },
  "prenatal-belly": {
    src: "/assets/img/locations/college-station/prenatal-belly-1200.jpg",
    alt: "A smiling pregnant mom sits on an adjusting table with her hands on her belly while a chiropractor stands behind her and her toddler plays nearby",
    width: 1342,
    height: 2048,
    widths: [480, 800, 1200],
    position: "55% 30%",
  },
  "prenatal-table": {
    src: "/assets/img/locations/college-station/prenatal-table-1200.jpg",
    alt: "A pregnant mom rests face up on a chiropractic table, eyes closed, while a chiropractor rests a hand on her belly",
    width: 1314,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 6%",
  },
  "prenatal-visit": {
    src: "/assets/img/locations/college-station/prenatal-visit-1200.jpg",
    alt: "A pregnant mom laughs while being adjusted, as her toddler leans against her knees",
    width: 1365,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 12%",
  },
  "team-with-little-ones": {
    src: "/assets/img/locations/college-station/team-with-little-ones-1200.jpg",
    alt: "Two Vitality team members sitting on an adjusting table, each holding a young child",
    width: 1585,
    height: 1057,
    widths: [480, 800, 1200],
    position: "62% 45%",
  },
  "toddler-cranial": {
    src: "/assets/img/locations/college-station/toddler-cranial-1200.jpg",
    alt: "A smiling toddler lies on an adjusting table while a chiropractor gently cradles her head",
    width: 1536,
    height: 2048,
    widths: [480, 800, 1200],
    position: "50% 40%",
  },
  "treatment-room": {
    src: "/assets/img/locations/college-station/treatment-room-1200.jpg",
    alt: "A bright Vitality treatment room with blush armchairs, a patterned rug and an adjusting table",
    width: 2048,
    height: 1536,
    widths: [480, 800, 1200, 1800],
    position: "55% 55%",
  },
  "celebration-pregnancy": {
    src: "/assets/img/locations/celebration/pregnancy-care.jpg",
    alt: "Dr. Christie adjusts a pregnant patient lying on a chiropractic table.",
    width: 960,
    height: 960,
    widths: [480, 800, 960],
    position: "50% 50%",
  },
  "celebration-pediatric": {
    src: "/assets/img/locations/celebration/pediatric-care.jpg",
    alt: "A sleeping newborn lies on a blue blanket while hands gently cradle the baby's head.",
    width: 1920,
    height: 1920,
    widths: [480, 800, 1200, 1800, 1920],
    position: "50% 50%",
  },
  "celebration-family": {
    src: "/assets/img/locations/celebration/family-wellness-care.jpg",
    alt: "Dr. Christie smiles with four children.",
    width: 1920,
    height: 1920,
    widths: [480, 800, 1200, 1800, 1920],
    position: "50% 50%",
  },
  "celebration-portrait": {
    src: "/assets/img/locations/celebration/portrait-studio.jpg",
    alt: "Dr. Christie holds a baby.",
    width: 552,
    height: 820,
    widths: [480, 552],
    position: "50% 50%",
  },
};

export interface ImageUse {
  id: string;
  position?: string;
}

/**
 * Resolve a photo for one office. An alias replaces the College Station crop
 * with the substitute photo's own default position.
 */
export function photoFor(location: Location, use: ImageUse): Photo {
  const aliased = location.photoAliases?.[use.id];
  const photo = photos[aliased ?? use.id];
  if (!photo) {
    throw new Error(
      `Unknown photo "${aliased ?? use.id}" (requested as "${use.id}" for ${location.slug}).`,
    );
  }
  if (aliased) return photo;
  if (use.position && use.position !== photo.position) return { ...photo, position: use.position };
  return photo;
}

/**
 * Swap a photo's size suffix for a WebP of `width`.
 * `office-reception-1200.jpg` → `office-reception-480.webp`.
 * A file with no size suffix keeps its name: `pregnancy-care.jpg` → `pregnancy-care-480.webp`.
 */
export function webpSrc(src: string, width: number): string {
  if (/-\d+\.(jpe?g|png|webp)$/i.test(src)) {
    return src.replace(/-\d+\.(jpe?g|png|webp)$/i, `-${width}.webp`);
  }
  return src.replace(/\.(jpe?g|png|webp)$/i, `-${width}.webp`);
}
