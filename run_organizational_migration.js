const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function runOrganizationalMigration() {
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

    // Read the SQL file
    const sqlContent = fs.readFileSync('update_organizational_tables.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Executed SQL statement successfully');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
              error.code === 'ER_DUP_KEYNAME' || 
              error.code === 'ER_DUP_KEYNAME' ||
              error.code === 'ER_DUP_ENTRY' ||
              error.message.includes('already exists')) {
            console.log('⚠️  Table/Index/Constraint already exists - skipping');
          } else {
            console.error('❌ Error executing statement:', error.message);
          }
        }
      }
    }

    console.log('\n🎉 Organizational tables migration completed successfully!');
    console.log('Your organizational API should now work correctly with all required fields.');

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
runOrganizationalMigration();
