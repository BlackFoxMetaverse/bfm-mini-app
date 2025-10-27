const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  AWS_REGION: 'ap-south-1',
  S3_BUCKET: 'invincible-mini-app',
  MONGODB_URI: 'mongodb://localhost:27017/your-database-name', // Update this
  PDF_FOLDER: 'books/pdf',
  COVER_FOLDER: 'books/cover'
};

// Configure AWS
AWS.config.update({
  region: CONFIG.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

// Define MongoDB Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pdfKey: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  coverImageKey: { type: String, required: true },
  coverImageUrl: { type: String, required: true },
  type: { type: String, enum: ['free', 'premium'], default: 'free' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);

/**
 * Upload file to S3
 */
async function uploadToS3(filePath, s3Key, contentType) {
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: CONFIG.S3_BUCKET,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read' // Make files publicly accessible
  };

  try {
    const result = await s3.upload(params).promise();
    console.log(`✓ Uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    console.error(`✗ Error uploading to S3:`, error);
    throw error;
  }
}

/**
 * Add book to database
 */
async function addBookToDB(bookData) {
  try {
    const book = new Book(bookData);
    await book.save();
    console.log(`✓ Book added to database: ${bookData.title}`);
    return book;
  } catch (error) {
    console.error(`✗ Error adding book to database:`, error);
    throw error;
  }
}

/**
 * Main function to add a book
 */
async function addBook(bookInfo) {
  const {
    title,
    description,
    pdfPath,
    coverImagePath,
    type = 'free'
  } = bookInfo;

  // Validate inputs
  if (!title || !description || !pdfPath || !coverImagePath) {
    throw new Error('Missing required fields: title, description, pdfPath, or coverImagePath');
  }

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }

  if (!fs.existsSync(coverImagePath)) {
    throw new Error(`Cover image not found: ${coverImagePath}`);
  }

  const timestamp = Date.now();
  const pdfExt = path.extname(pdfPath);
  const coverExt = path.extname(coverImagePath);

  // Generate S3 keys
  const pdfKey = `${CONFIG.PDF_FOLDER}/${timestamp}_${title.replace(/\s+/g, '_')}${pdfExt}`;
  const coverKey = `${CONFIG.COVER_FOLDER}/${timestamp}_${title.replace(/\s+/g, '_')}${coverExt}`;

  console.log(`\n📚 Processing book: ${title}`);
  console.log('─'.repeat(50));

  // Upload PDF to S3
  console.log('Uploading PDF...');
  const pdfUrl = await uploadToS3(pdfPath, pdfKey, 'application/pdf');

  // Upload cover image to S3
  console.log('Uploading cover image...');
  const coverImageUrl = await uploadToS3(coverImagePath, coverKey, `image/${coverExt.slice(1)}`);

  // Prepare book data
  const bookData = {
    title,
    description,
    pdfKey,
    pdfUrl,
    coverImageKey: coverKey,
    coverImageUrl,
    type,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Add to database
  console.log('Adding to database...');
  const savedBook = await addBookToDB(bookData);

  console.log('─'.repeat(50));
  console.log('✅ Book successfully added!\n');

  return savedBook;
}

/**
 * Batch add multiple books
 */
async function addMultipleBooks(booksArray) {
  console.log(`\n🚀 Starting batch upload of ${booksArray.length} books...\n`);
  
  const results = {
    successful: [],
    failed: []
  };

  for (let i = 0; i < booksArray.length; i++) {
    try {
      const book = await addBook(booksArray[i]);
      results.successful.push({ title: book.title, id: book._id });
    } catch (error) {
      results.failed.push({
        title: booksArray[i].title,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed books:');
    results.failed.forEach(item => {
      console.log(`  - ${item.title}: ${item.error}`);
    });
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(CONFIG.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Example: Add a single book
    await addBook({
      title: 'To Kill a Mockingbird',
      description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
      pdfPath: './local-books/to-kill-a-mockingbird.pdf',
      coverImagePath: './local-books/to-kill-a-mockingbird-cover.jpg',
      type: 'premium'
    });

    // Example: Add multiple books
    /*
    await addMultipleBooks([
      {
        title: '1984',
        description: 'A dystopian social science fiction novel and cautionary tale.',
        pdfPath: './local-books/1984.pdf',
        coverImagePath: './local-books/1984-cover.jpg',
        type: 'free'
      },
      {
        title: 'Pride and Prejudice',
        description: 'A romantic novel of manners set in Georgian England.',
        pdfPath: './local-books/pride-and-prejudice.pdf',
        coverImagePath: './local-books/pride-and-prejudice-cover.jpg',
        type: 'premium'
      }
    ]);
    */

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

// Run the script
main();