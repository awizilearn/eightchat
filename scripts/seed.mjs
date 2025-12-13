
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Since we are in an ES module, __dirname is not available. This is the workaround.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data from placeholder-images.json
// Note: In a real-world scenario, it might be better to import this directly if using a bundler,
// but for a simple script, reading it is fine.
const placeholderImagesPath = path.join(__dirname, '..', 'src', 'lib', 'placeholder-images.json');
const placeholderImagesData = JSON.parse(fs.readFileSync(placeholderImagesPath, 'utf-8'));
const placeholderUrls = placeholderImagesData.placeholderImages.reduce((acc, img) => {
    acc[img.id] = img.imageUrl;
    return acc;
}, {});


const creators = [
  {
    id: "elena-moreau",
    displayName: "Elena Moreau",
    email: "elena.moreau@example.com",
    role: "createur",
    bio: "Weaving stories into fabric. Join my journey in haute couture.",
    category: "Haute Couture",
    photoURL: placeholderUrls["creator-1-avatar"],
    bannerUrl: placeholderUrls["creator-1-banner"],
    tiers: [
      { name: "Bronze", price: 5, perks: ["Accès anticipé aux collections", "Contenu en coulisses"], cta: "S'abonner" },
      { name: "Silver", price: 15, perks: ["Tous les avantages Bronze", "Tutoriels de couture exclusifs", "Q&A mensuels"], cta: "S'abonner" },
      { name: "Gold", price: 30, perks: ["Tous les avantages Silver", "Consultations de style personnelles", "Accès à des événements privés"], cta: "S'abonner" },
    ],
    content: [
      { id: "content-1", title: "Golden Thread", type: "image", imageUrl: placeholderUrls["content-1"], tier: "Gold" },
      { id: "content-2", title: "Minimalist Forms", type: "image", imageUrl: placeholderUrls["content-2"], tier: "Bronze" },
      { id: "content-4", title: "Fashion Sketchbook", type: "article", imageUrl: placeholderUrls["content-4"], tier: "Silver" },
    ]
  },
  {
    id: "kenji-tanaka",
    displayName: "Kenji Tanaka",
    email: "kenji.tanaka@example.com",
    role: "createur",
    bio: "Exploring the art of flavor. From traditional Japanese to modern fusion.",
    category: "Culinary Arts",
    photoURL: placeholderUrls["creator-2-avatar"],
    bannerUrl: placeholderUrls["creator-2-banner"],
    tiers: [
      { name: "Bronze", price: 7, perks: ["Recettes de la semaine", "Conseils de cuisine"], cta: "S'abonner" },
      { name: "Silver", price: 20, perks: ["Tous les avantages Bronze", "Cours de cuisine en direct", "Livre de recettes numérique"], cta: "S'abonner" },
      { name: "Gold", price: 50, perks: ["Tous les avantages Silver", "Ateliers de dégustation de saké", "Boîte d'ingrédients surprise"], cta: "S'abonner" },
    ],
    content: [
        { id: "content-3", title: "Gourmet Plating", type: "video", imageUrl: placeholderUrls["content-3"], tier: "Silver" },
    ]
  },
  {
    id: "isabella-rossi",
    displayName: "Isabella Rossi",
    email: "isabella.rossi@example.com",
    role: "createur",
    bio: "Capturing emotion on canvas. Follow my process from blank slate to finished piece.",
    category: "Oil Painting",
    photoURL: placeholderUrls["creator-3-avatar"],
    bannerUrl: placeholderUrls["creator-3-banner"],
    tiers: [
      { name: "Bronze", price: 10, perks: ["Accès aux archives de peintures", "Vlogs de studio"], cta: "S'abonner" },
      { name: "Silver", price: 25, perks: ["Tous les avantages Bronze", "Tutoriels de peinture en accéléré", "Critiques d'art"], cta: "S'abonner" },
      { name: "Gold", price: 60, perks: ["Tous les avantages Silver", "Recevoir une impression signée par an", "Commission prioritaire"], cta: "S'abonner" },
    ],
    content: [
        { id: "content-5", title: "Canvas Dreams", type: "image", imageUrl: placeholderUrls["content-5"], tier: "Bronze" },
        { id: "content-6", title: "Night Cityscape", type: "image", imageUrl: placeholderUrls["content-6"], tier: "Gold" },
    ]
  },
  {
    id: "marcus-thorne",
    displayName: "Marcus Thorne",
    email: "marcus.thorne@example.com",
    role: "createur",
    bio: "Chronicler of lost worlds and forgotten futures. Support my writing.",
    category: "Fiction Writer",
    photoURL: placeholderUrls["creator-4-avatar"],
    bannerUrl: placeholderUrls["creator-4-banner"],
    tiers: [
      { name: "Bronze", price: 3, perks: ["Accès aux nouvelles", "Chapitres en avance"], cta: "S'abonner" },
      { name: "Silver", price: 10, perks: ["Tous les avantages Bronze", "Contenu sur la construction du monde", "Q&A avec les personnages"], cta: "S'abonner" },
      { name: "Gold", price: 25, perks: ["Tous les avantages Silver", "Histoires exclusives au palier", "Votre nom dans les remerciements"], cta: "S'abonner" },
    ],
    content: [
      { id: "content-7", title: "Manuscript", type: "article", imageUrl: placeholderUrls["content-7"], tier: "Bronze" },
      { id: "content-8", title: "The Old Camera", type: "video", imageUrl: placeholderUrls["content-8"], tier: "Silver" },
    ]
  }
];

const generateSeedFile = () => {
    console.log("Generating firestore-seed.json...");
    
    const seedData = {};
    
    creators.forEach(creator => {
        // Add a placeholder for signalPreKeyBundle
        const creatorData = { ...creator, signalPreKeyBundle: {} };
        if (!seedData.users) {
            seedData.users = {};
        }
        seedData.users[creator.id] = creatorData;
    });

    const outputPath = path.join(process.cwd(), 'firestore-seed.json');
    fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));

    console.log("\n\x1b[32m✔ Seed file generated successfully!\x1b[0m");
    console.log(`\n\x1b[1mPath:\x1b[0m ${outputPath}`);
    console.log("\n\x1b[33m--- How to Import Manually ---\x1b[0m");
    console.log("1. Go to your Firebase Console: https://console.firebase.google.com/");
    console.log("2. Select your project.");
    console.log("3. Go to \x1b[1mFirestore Database\x1b[0m from the left menu.");
    console.log("4. Click the \x1b[1mthree-dots menu\x1b[0m at the top of the data panel (next to 'users') and select \x1b[1m'Import data'\x1b[0m.");
    console.log("5. Select the generated `firestore-seed.json` file and start the import.");
    console.log("\n\x1b[31mIMPORTANT:\x1b[0m This will overwrite existing data in the collections present in the file.");
    console.log("\nAfter importing, you will need to create user accounts in Firebase Authentication manually for login to work.");
    console.log("You can do this in the \x1b[1mAuthentication -> Users\x1b[0m tab in your Firebase Console.");
};

generateSeedFile();
