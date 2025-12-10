import type { ImagePlaceholder } from './placeholder-images';
import placeholderData from './placeholder-images.json';

const PlaceHolderImages: ImagePlaceholder[] = placeholderData.placeholderImages;

const getImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    // For this app, let's throw an error during development to catch missing images.
    throw new Error(`Image with id "${id}" not found.`);
  }
  return image;
};

export interface Content {
  id: string;
  title: string;
  type: 'image' | 'video' | 'article';
  image: ImagePlaceholder;
  tier: 'Bronze' | 'Silver' | 'Gold';
}

export interface SubscriptionTier {
  name: 'Bronze' | 'Silver' | 'Gold';
  price: number;
  perks: string[];
  cta: string;
}

export interface Creator {
  id: string;
  name: string;
  bio: string;
  longBio: string;
  category: string;
  avatar: ImagePlaceholder;
  banner: ImagePlaceholder;
  content: Content[];
  tiers: SubscriptionTier[];
}

export const creators: Creator[] = [
  {
    id: 'elena-moreau',
    name: 'Elena Moreau',
    category: 'Haute Couture',
    bio: 'Visionary fashion designer creating timeless pieces.',
    longBio: 'Elena Moreau is a world-renowned fashion designer known for her avant-garde yet timeless creations. With a studio in the heart of Paris, she shares her creative process, from initial sketches to the final runway walk, exclusively with her subscribers.',
    avatar: getImage('creator-1-avatar'),
    banner: getImage('creator-1-banner'),
    tiers: [
      { name: 'Bronze', price: 10, perks: ['Access to exclusive weekly updates', 'Behind-the-scenes photos'], cta: 'Join the Atelier' },
      { name: 'Silver', price: 25, perks: ['All Bronze perks', 'Monthly design masterclass', 'Early access to collections'], cta: 'Become an Insider' },
      { name: 'Gold', price: 50, perks: ['All Silver perks', 'Direct messaging with Elena', 'Personalized style feedback'], cta: 'Join the Inner Circle' },
    ],
    content: [
      { id: 'c1', title: 'The Making of the Solstice Gown', type: 'image', image: getImage('content-4'), tier: 'Bronze' },
      { id: 'c2', title: 'Fabric Sourcing in Milan', type: 'image', image: getImage('content-2'), tier: 'Silver' },
      { id: 'c3', title: 'A/W \'24 Moodboard', type: 'image', image: getImage('content-1'), tier: 'Gold' },
      { id: 'c4', title: 'Sketching a New Silhouette', type: 'image', image: getImage('content-4'), tier: 'Bronze' },
    ],
  },
  {
    id: 'kenji-tanaka',
    name: 'Kenji Tanaka',
    category: 'Culinary Arts',
    bio: 'Michelin-starred chef exploring the art of fusion cuisine.',
    longBio: 'Chef Kenji Tanaka blends traditional Japanese techniques with global flavors at his acclaimed restaurant. Subscribers get access to his secret recipes, advanced cooking tutorials, and the philosophy behind his culinary creations.',
    avatar: getImage('creator-2-avatar'),
    banner: getImage('creator-2-banner'),
     tiers: [
      { name: 'Bronze', price: 8, perks: ['Access to weekly recipes', 'Kitchen tips & tricks'], cta: 'Start Cooking' },
      { name: 'Silver', price: 20, perks: ['All Bronze perks', 'Full-length cooking classes', 'Q&A sessions'], cta: 'Sharpen Your Skills' },
      { name: 'Gold', price: 45, perks: ['All Silver perks', 'Direct messaging with Kenji', 'Personalized recipe development'], cta: 'Master the Craft' },
    ],
    content: [
      { id: 'c5', title: 'The Perfect Umami Bomb', type: 'image', image: getImage('content-3'), tier: 'Bronze' },
      { id: 'c6', title: 'Mastering the Sous-Vide', type: 'image', image: getImage('content-3'), tier: 'Silver' },
      { id: 'c7', title: 'Deconstructing Ramen', type: 'image', image: getImage('content-3'), tier: 'Gold' },
      { id: 'c8', title: 'Sake Pairing Guide', type: 'image', image: getImage('content-3'), tier: 'Bronze' },
    ],
  },
  {
    id: 'isabella-rossi',
    name: 'Isabella Rossi',
    category: 'Fine Art',
    bio: 'Contemporary artist exploring themes of nature and identity.',
    longBio: 'From her sun-drenched studio in Florence, Isabella Rossi creates breathtaking oil paintings that challenge perception. Join her enclave to witness her process, from blank canvas to gallery exhibition, and learn the techniques behind her expressive work.',
    avatar: getImage('creator-3-avatar'),
    banner: getImage('creator-3-banner'),
     tiers: [
      { name: 'Bronze', price: 12, perks: ['Monthly studio vlog', 'High-res downloads of selected works'], cta: 'Become a Patron' },
      { name: 'Silver', price: 30, perks: ['All Bronze perks', 'Live painting sessions', 'Technique tutorials'], cta: 'Join the Studio' },
      { name: 'Gold', price: 60, perks: ['All Silver perks', 'Direct messaging with Isabella', 'Critique on your own artwork'], cta: 'Become a Collector' },
    ],
    content: [
      { id: 'c9', title: 'Verdant Series: Study #1', type: 'image', image: getImage('content-5'), tier: 'Bronze' },
      { id: 'c10', title: 'Mixing Skin Tones', type: 'image', image: getImage('content-5'), tier: 'Silver' },
      { id: 'c11', title: 'Time-lapse: "Ephemeral"', type: 'image', image: getImage('content-5'), tier: 'Gold' },
      { id: 'c12', title: 'The Underpainting Process', type: 'image', image: getImage('content-5'), tier: 'Bronze' },
    ],
  },
  {
    id: 'marcus-thorne',
    name: 'Marcus Thorne',
    category: 'Literature',
    bio: 'Bestselling author of historical fiction and thrillers.',
    longBio: 'Marcus Thorne weaves intricate plots and unforgettable characters in his novels. Subscribers get an exclusive look into his writing world, including deleted scenes, character backstories, and early access to new chapters.',
    avatar: getImage('creator-4-avatar'),
    banner: getImage('creator-4-banner'),
     tiers: [
      { name: 'Bronze', price: 5, perks: ['Monthly newsletter with writing insights', 'Access to a private blog'], cta: 'Start Reading' },
      { name: 'Silver', price: 15, perks: ['All Bronze perks', 'Early access to chapters', 'Deleted scenes and notes'], cta: 'Join the Library' },
      { name: 'Gold', price: 35, perks: ['All Silver perks', 'Direct messaging with Marcus', 'Signed book copies'], cta: 'Join the Writer\'s Room' },
    ],
    content: [
      { id: 'c13', title: 'Character Study: The Spy', type: 'image', image: getImage('content-7'), tier: 'Bronze' },
      { id: 'c14', title: 'Chapter 1: "The Gilded Cage" (Draft)', type: 'image', image: getImage('content-7'), tier: 'Silver' },
      { id: 'c15', title: 'Alternate Ending revealed', type: 'image', image: getImage('content-7'), tier: 'Gold' },
      { id: 'c16', title: 'Research Trip to Istanbul', type: 'image', image: getImage('content-6'), tier: 'Bronze' },
    ],
  },
];

export const findCreatorById = (id: string | undefined): Creator | undefined => {
  if (!id) return undefined;
  return creators.find((creator) => creator.id === id);
};

export const findCreatorsByIds = (ids: string[]): Creator[] => {
  const foundCreators = ids.map(id => findCreatorById(id)).filter(c => c !== undefined) as Creator[];
  // Maintain the order from the recommendation if needed, or sort them. Here we just return as found.
  return foundCreators;
};

export const user = {
    name: 'Alex Chen',
    avatar: getImage('user-avatar'),
    // Subscription history to be used for AI recommendations
    subscriptions: ['elena-moreau', 'isabella-rossi'],
};
