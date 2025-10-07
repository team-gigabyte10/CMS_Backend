
const { pool } = require('./src/config/database');
const fs = require('fs');

async function insertSampleData() {
  try {
    console.log('Starting to insert sample data for dashboard analytics...');

    // Read the SQL file
    const sqlContent = fs.readFileSync('sample_data_for_dashboard.sql', 'utf8');
    
    // Remove comments and clean up the content
    const cleanContent = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');
    
    // Split by semicolon and filter out empty statements
    const statements = cleanContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.execute(statement);
          console.log(`✓ Executed statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        } catch (error) {
          console.log(`✗ Error in statement ${i + 1}: ${error.message}`);
          console.log(`Statement: ${statement.substring(0, 100)}...`);
          // Continue with other statements even if one fails
        }
      }
    }

    console.log('Sample data insertion completed!');
    
    // Test the data by running some queries
    console.log('\nTesting inserted data...');
    
    // Check conversations
    const [conversations] = await pool.execute('SELECT COUNT(*) as count FROM conversations');
    console.log(`Total conversations: ${conversations[0].count}`);
    
    // Check messages
    const [messages] = await pool.execute('SELECT COUNT(*) as count FROM messages');
    console.log(`Total messages: ${messages[0].count}`);
    
    // Check audit logs
    const [auditLogs] = await pool.execute('SELECT COUNT(*) as count FROM audit_logs');
    console.log(`Total audit logs: ${auditLogs[0].count}`);
    
    // Check recent data (last 7 days)
    const [recentConversations] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM conversations 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    console.log(`Recent conversations (7 days): ${recentConversations[0].count}`);
    
    const [recentMessages] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    console.log(`Recent messages (7 days): ${recentMessages[0].count}`);
    
    const [recentAuditLogs] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM audit_logs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    console.log(`Recent audit logs (7 days): ${recentAuditLogs[0].count}`);

  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    // Close the connection pool
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the script
insertSampleData();
