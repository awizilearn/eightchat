import admin from "firebase-admin";
import fs from "fs";

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync("./firebasekey.json", "utf8"))
  ),
});

const db = admin.firestore();
const data = JSON.parse(fs.readFileSync("./firestore-seed.json", "utf8"));

async function run() {
  const batch = db.batch();

  for (const [collection, docs] of Object.entries(data)) {
    for (const [docId, docData] of Object.entries(docs)) {
      const ref = db.collection(collection).doc(docId);
      batch.set(ref, docData);
    }
  }

  await batch.commit();
  console.log("✅ Import terminé");
}

run().catch(console.error);
