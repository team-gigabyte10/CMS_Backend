const { pool } = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('Checking existing users in the database...');
    
    const [users] = await pool.execute('SELECT id, name, email FROM users ORDER BY id LIMIT 10');
    
    console.log('Existing users:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });
    
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\nTotal users in database: ${userCount[0].count}`);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();
