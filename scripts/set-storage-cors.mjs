/**
 * scripts/set-storage-cors.mjs
 * Run once: node scripts/set-storage-cors.mjs
 * Sets CORS policy on the Firebase Storage bucket so browsers can PUT
 * encrypted files via signed URLs from any origin.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config(); // load .env

const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

const bucket = getStorage(app).bucket(`${process.env.FIREBASE_PROJECT_ID}.appspot.com`);

const corsConfig = [
    {
        origin: ['*'],
        method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
        responseHeader: [
            'Content-Type',
            'Content-Length',
            'Content-MD5',
            'Content-Disposition',
            'x-goog-resumable',
            'Access-Control-Allow-Origin'
        ],
        maxAgeSeconds: 3600
    }
];

try {
    await bucket.setCorsConfiguration(corsConfig);
    const [meta] = await bucket.getMetadata();
    console.log('✅ CORS applied to:', meta.name);
    console.log('   Config:', JSON.stringify(meta.cors, null, 2));
} catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
}
