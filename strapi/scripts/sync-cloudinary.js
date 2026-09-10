/**
 * Script to sync Cloudinary images to Strapi database
 * Run: DATABASE_URL=... node scripts/sync-cloudinary.js
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const cloudinary = require('cloudinary').v2;
const { Client } = require('pg');

// Use env vars or .env file
require('dotenv').config({ path: '../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function syncCloudinaryToStrapi() {
  try {
    await pgClient.connect();
    console.log('Connected to database');

    // Get all resources from Cloudinary
    let allResources = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 100,
        resource_type: 'image',
        ...(nextCursor ? { next_cursor: nextCursor } : {})
      });

      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`Found ${allResources.length} images in Cloudinary`);

    for (const resource of allResources) {
      // Check if file already exists by URL or name
      const existing = await pgClient.query(
        'SELECT id FROM files WHERE url = $1 OR name = $2',
        [resource.secure_url, `${resource.public_id}.${resource.format}`]
      );

      if (existing.rows.length > 0) {
        console.log(`Skipping ${resource.public_id} - already exists`);
        continue;
      }

      const width = resource.width || 800;
      const height = resource.height || 600;

      // Insert file record
      const insertResult = await pgClient.query(
        `INSERT INTO files (
          name, alternative_text, caption, width, height, 
          ext, mime, size, url, provider, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'cloudinary', NOW(), NOW())
        RETURNING id`,
        [
          `${resource.public_id}.${resource.format}`,
          resource.public_id,
          resource.public_id,
          width,
          height,
          `.${resource.format}`,
          `image/${resource.format}`,
          resource.bytes,
          resource.secure_url
        ]
      );

      const fileId = insertResult.rows[0].id;
      console.log(`Synced: ${resource.public_id} -> ID: ${fileId}`);
    }

    // Show summary
    const count = await pgClient.query('SELECT COUNT(*) as total FROM files');
    console.log(`\nTotal files in Strapi: ${count.rows[0].total}`);
    console.log('Sync complete!');
  } catch (error) {
    console.error('Error syncing:', error.message);
  } finally {
    await pgClient.end();
  }
}

syncCloudinaryToStrapi();
