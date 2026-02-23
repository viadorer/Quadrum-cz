const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../Davidchoc.com/.env.local' });

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadDirectory(dirPath, prefix) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await uploadDirectory(filePath, `${prefix}${file}/`);
    } else {
      const fileContent = fs.readFileSync(filePath);
      const key = `quadrum/${prefix}${file}`;
      
      const contentType = file.endsWith('.jpg') ? 'image/jpeg' : 
                         file.endsWith('.png') ? 'image/png' : 
                         'application/octet-stream';
      
      try {
        await client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: fileContent,
          ContentType: contentType,
        }));
        console.log(`✅ Uploaded: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${key}:`, error.message);
      }
    }
  }
}

(async () => {
  console.log('📤 Nahrávám optimalizované obrázky do R2...\n');
  await uploadDirectory('images-optimized', '');
  console.log('\n✅ Všechny obrázky nahrány!');
})();
