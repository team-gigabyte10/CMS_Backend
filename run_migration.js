const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cms_db'
    });

    console.log('Connected to database successfully!');

    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('parent_id', 'contact_type')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (existingColumns.includes('parent_id') && existingColumns.includes('contact_type')) {
      console.log('✅ Migration already completed! Both parent_id and contact_type columns exist.');
      return;
    }

    console.log('Starting migration...');

    // Add parent_id if it doesn't exist
    if (!existingColumns.includes('parent_id')) {
      console.log('Adding parent_id column...');
      await connection.execute('ALTER TABLE users ADD COLUMN parent_id INT DEFAULT NULL');
      await connection.execute('ALTER TABLE users ADD INDEX idx_parent_id (parent_id)');
      console.log('✅ parent_id column added successfully');
    } else {
      console.log('✅ parent_id column already exists');
    }

    // Add contact_type if it doesn't exist
    if (!existingColumns.includes('contact_type')) {
      console.log('Adding contact_type column...');
      await connection.execute("ALTER TABLE users ADD COLUMN contact_type ENUM('internal','external') NOT NULL DEFAULT 'internal'");
      await connection.execute('ALTER TABLE users ADD INDEX idx_contact_type (contact_type)');
      console.log('✅ contact_type column added successfully');
    } else {
      console.log('✅ contact_type column already exists');
    }

    // Add foreign key constraint if it doesn't exist
    try {
      await connection.execute('ALTER TABLE users ADD CONSTRAINT users_ibfk_8 FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL');
      console.log('✅ Foreign key constraint added successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✅ Foreign key constraint already exists');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('Your Contact Directory API is now ready to use.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
runMigration();
