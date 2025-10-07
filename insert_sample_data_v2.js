const { pool } = require('./src/config/database');

async function insertSampleData() {
  try {
    console.log('Starting to insert sample data for dashboard analytics...');

    // First, insert conversations and get their IDs
    console.log('Inserting conversations...');
    const conversationData = [
      // Today
      { type: 'direct', name: null, created_by: 2, created_at: 'DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR' },
      { type: 'group', name: 'Navy Command Group', created_by: 3, created_at: 'DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR' },
      { type: 'direct', name: null, created_by: 4, created_at: 'DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 10 HOUR' },
      { type: 'group', name: 'Operations Team', created_by: 5, created_at: 'DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR' },
      
      // 1 day ago
      { type: 'direct', name: null, created_by: 6, created_at: 'DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR' },
      { type: 'group', name: 'Security Alert Group', created_by: 2, created_at: 'DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR' },
      { type: 'direct', name: null, created_by: 7, created_at: 'DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR' },
      { type: 'group', name: 'Training Coordination', created_by: 8, created_at: 'DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR' },
      
      // 2 days ago
      { type: 'direct', name: null, created_by: 9, created_at: 'DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 8 HOUR' },
      { type: 'group', name: 'Maintenance Team', created_by: 3, created_at: 'DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR' },
      { type: 'direct', name: null, created_by: 10, created_at: 'DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 10 HOUR' },
      { type: 'group', name: 'Logistics Planning', created_by: 4, created_at: 'DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR' }
    ];

    const conversationIds = [];
    for (const conv of conversationData) {
      const [result] = await pool.execute(
        `INSERT INTO conversations (type, name, created_by, created_at) VALUES (?, ?, ?, ${conv.created_at})`,
        [conv.type, conv.name, conv.created_by]
      );
      conversationIds.push(result.insertId);
      console.log(`✓ Created conversation ${result.insertId}: ${conv.name || 'Direct'}`);
    }

    // Insert conversation participants for group conversations
    console.log('Inserting conversation participants...');
    const groupConversationIds = conversationIds.filter((id, index) => conversationData[index].type === 'group');
    
    for (let i = 0; i < groupConversationIds.length; i++) {
      const convId = groupConversationIds[i];
      const participants = [
        { user_id: 2, time_offset: 0 },
        { user_id: 3, time_offset: 5 },
        { user_id: 4, time_offset: 10 },
        { user_id: 5, time_offset: 15 }
      ];
      
      for (const participant of participants) {
        await pool.execute(
          `INSERT INTO conversation_participants (conversation_id, user_id, joined_at) VALUES (?, ?, ${conversationData[conversationIds.indexOf(convId)].created_at} + INTERVAL ? MINUTE)`,
          [convId, participant.user_id, participant.time_offset]
        );
      }
      console.log(`✓ Added participants to conversation ${convId}`);
    }

    // Insert sample messages
    console.log('Inserting messages...');
    const messageData = [
      // Conversation 1 (direct)
      { conversation_id: conversationIds[0], sender_id: 2, content: 'Good morning, Admiral. Ready for the daily briefing.', type: 'text', time_offset: 30 },
      { conversation_id: conversationIds[0], sender_id: 3, content: 'Morning, sir. All systems operational.', type: 'text', time_offset: 35 },
      
      // Conversation 2 (group)
      { conversation_id: conversationIds[1], sender_id: 3, content: 'Navy Command Group: Morning briefing in 15 minutes.', type: 'text', time_offset: 15 },
      { conversation_id: conversationIds[1], sender_id: 2, content: 'Confirmed, all commanders present.', type: 'text', time_offset: 20 },
      { conversation_id: conversationIds[1], sender_id: 4, content: 'Weather conditions favorable for operations.', type: 'text', time_offset: 25 },
      { conversation_id: conversationIds[1], sender_id: 5, content: 'Fleet status: All vessels ready.', type: 'text', time_offset: 30 },
      
      // Conversation 3 (direct)
      { conversation_id: conversationIds[2], sender_id: 4, content: 'Captain, we need to discuss the logistics for next week.', type: 'text', time_offset: 15 },
      { conversation_id: conversationIds[2], sender_id: 6, content: 'I have the supply reports ready.', type: 'text', time_offset: 20 },
      
      // Conversation 4 (group)
      { conversation_id: conversationIds[3], sender_id: 5, content: 'Operations Team: Mission briefing at 1400 hours.', type: 'text', time_offset: 30 },
      { conversation_id: conversationIds[3], sender_id: 2, content: 'Mission objectives confirmed.', type: 'text', time_offset: 35 },
      { conversation_id: conversationIds[3], sender_id: 3, content: 'Equipment checklist completed.', type: 'text', time_offset: 40 },
      { conversation_id: conversationIds[3], sender_id: 6, content: 'Personnel assignments ready.', type: 'text', time_offset: 45 },
      
      // Conversation 5 (direct) - yesterday
      { conversation_id: conversationIds[4], sender_id: 6, content: 'Status update: All systems green.', type: 'text', time_offset: 30 },
      { conversation_id: conversationIds[4], sender_id: 7, content: 'Received, thank you for the update.', type: 'text', time_offset: 35 },
      
      // Conversation 6 (group) - yesterday
      { conversation_id: conversationIds[5], sender_id: 2, content: 'Security Alert: Unauthorized access attempt detected.', type: 'system', time_offset: 15 },
      { conversation_id: conversationIds[5], sender_id: 2, content: 'Investigating the source of the attempt.', type: 'text', time_offset: 20 },
      { conversation_id: conversationIds[5], sender_id: 3, content: 'Security protocols activated.', type: 'text', time_offset: 25 },
      { conversation_id: conversationIds[5], sender_id: 8, content: 'All personnel accounted for.', type: 'text', time_offset: 30 },
      
      // Conversation 7 (direct) - yesterday
      { conversation_id: conversationIds[6], sender_id: 7, content: 'Training schedule for next week ready.', type: 'text', time_offset: 15 },
      { conversation_id: conversationIds[6], sender_id: 9, content: 'Excellent, I will review the materials.', type: 'text', time_offset: 20 },
      
      // Conversation 8 (group) - yesterday
      { conversation_id: conversationIds[7], sender_id: 8, content: 'Training Coordination: Schedule attached.', type: 'text', time_offset: 30 },
      { conversation_id: conversationIds[7], sender_id: 9, content: 'Received, will distribute to all units.', type: 'text', time_offset: 35 },
      { conversation_id: conversationIds[7], sender_id: 10, content: 'Training equipment prepared.', type: 'text', time_offset: 40 }
    ];

    for (const msg of messageData) {
      const convData = conversationData[conversationIds.indexOf(msg.conversation_id)];
      await pool.execute(
        `INSERT INTO messages (conversation_id, sender_id, content, type, created_at) VALUES (?, ?, ?, ?, ${convData.created_at} + INTERVAL ? MINUTE)`,
        [msg.conversation_id, msg.sender_id, msg.content, msg.type, msg.time_offset]
      );
    }
    console.log(`✓ Inserted ${messageData.length} messages`);

    // Insert sample audit logs
    console.log('Inserting audit logs...');
    const auditData = [
      // Today's activities
      { user_id: 2, action: 'LOGIN_SUCCESS', target_type: 'user', target_id: 2, target_name: 'Admiral Sheikh Nazrul Islam', details: 'Successful login from headquarters', ip_address: '192.168.1.100', time_offset: 0 },
      { user_id: 3, action: 'LOGIN_SUCCESS', target_type: 'user', target_id: 3, target_name: 'Rear Admiral Mohammad Ali', details: 'Successful login from office', ip_address: '192.168.1.101', time_offset: 5 },
      { user_id: 4, action: 'LOGIN_SUCCESS', target_type: 'user', target_id: 4, target_name: 'Captain Karim Ahmed', details: 'Successful login from field', ip_address: '192.168.1.102', time_offset: 10 },
      { user_id: 2, action: 'CREATE_CONVERSATION', target_type: 'conversation', target_id: conversationIds[0], target_name: 'Direct Message', details: 'Created direct conversation', ip_address: '192.168.1.100', time_offset: 30 },
      { user_id: 3, action: 'CREATE_CONVERSATION', target_type: 'conversation', target_id: conversationIds[1], target_name: 'Navy Command Group', details: 'Created group conversation', ip_address: '192.168.1.101', time_offset: 0 },
      { user_id: 5, action: 'CREATE_CONVERSATION', target_type: 'conversation', target_id: conversationIds[3], target_name: 'Operations Team', details: 'Created group conversation', ip_address: '192.168.1.103', time_offset: 0 },
      
      // Yesterday's activities
      { user_id: 6, action: 'LOGIN_SUCCESS', target_type: 'user', target_id: 6, target_name: 'Captain Rahman Ali', details: 'Successful login from base', ip_address: '192.168.1.104', time_offset: 0 },
      { user_id: 7, action: 'LOGIN_SUCCESS', target_type: 'user', target_id: 7, target_name: 'Commander Fatima Begum', details: 'Successful login from office', ip_address: '192.168.1.105', time_offset: 5 },
      { user_id: 2, action: 'SECURITY_ALERT', target_type: 'security', target_id: null, target_name: 'Unauthorized Access', details: 'Detected unauthorized access attempt', ip_address: '192.168.1.100', time_offset: 15 },
      { user_id: 2, action: 'PASSWORD_CHANGE', target_type: 'user', target_id: 8, target_name: 'Lieutenant Commander Hasan Mia', details: 'Password changed for security', ip_address: '192.168.1.100', time_offset: 120 },
      { user_id: 8, action: 'CREATE_CONVERSATION', target_type: 'conversation', target_id: conversationIds[7], target_name: 'Training Coordination', details: 'Created group conversation', ip_address: '192.168.1.106', time_offset: 0 },
      
      // 2 days ago activities
      { user_id: 9, action: 'LOGIN_SUCCESS', target_type: 'user', target_id: 9, target_name: 'Rear Admiral Karim Uddin', details: 'Successful login from headquarters', ip_address: '192.168.1.107', time_offset: 0 },
      { user_id: 10, action: 'LOGIN_SUCCESS', target_type: 'user', target_id: 10, target_name: 'Captain Nusrat Jahan', details: 'Successful login from field', ip_address: '192.168.1.108', time_offset: 5 },
      { user_id: 3, action: 'DELETE_USER', target_type: 'user', target_id: 50, target_name: 'Captain Moniruzzaman', details: 'User account deactivated', ip_address: '192.168.1.101', time_offset: 60 },
      { user_id: 11, action: 'CREATE_CONVERSATION', target_type: 'conversation', target_id: conversationIds[9], target_name: 'Maintenance Team', details: 'Created group conversation', ip_address: '192.168.1.109', time_offset: 0 },
      { user_id: 4, action: 'CREATE_CONVERSATION', target_type: 'conversation', target_id: conversationIds[11], target_name: 'Logistics Planning', details: 'Created group conversation', ip_address: '192.168.1.102', time_offset: 0 }
    ];

    for (const audit of auditData) {
      let timeOffset = '';
      if (audit.time_offset > 0) {
        timeOffset = ` + INTERVAL ${audit.time_offset} MINUTE`;
      }
      
      let createdAt = '';
      if (audit.user_id === 2 && audit.action === 'LOGIN_SUCCESS') {
        createdAt = 'DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR' + timeOffset;
      } else if (audit.user_id === 6 && audit.action === 'LOGIN_SUCCESS') {
        createdAt = 'DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR' + timeOffset;
      } else if (audit.user_id === 9 && audit.action === 'LOGIN_SUCCESS') {
        createdAt = 'DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 8 HOUR' + timeOffset;
      } else {
        createdAt = 'DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR' + timeOffset;
      }
      
      await pool.execute(
        `INSERT INTO audit_logs (user_id, action, target_type, target_id, target_name, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ${createdAt})`,
        [audit.user_id, audit.action, audit.target_type, audit.target_id, audit.target_name, audit.details, audit.ip_address]
      );
    }
    console.log(`✓ Inserted ${auditData.length} audit logs`);

    console.log('\nSample data insertion completed!');
    
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

    // Test dashboard analytics query
    console.log('\nTesting dashboard analytics queries...');
    const [conversationChart] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_conversations,
        COUNT(CASE WHEN type = 'direct' THEN 1 END) as direct_conversations,
        COUNT(CASE WHEN type = 'group' THEN 1 END) as group_conversations
      FROM conversations
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    console.log('Conversation chart data:', conversationChart);

    const [messageChart] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_messages,
        COUNT(CASE WHEN type = 'text' THEN 1 END) as text_messages,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_messages,
        COUNT(DISTINCT sender_id) as unique_senders
      FROM messages
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    console.log('Message chart data:', messageChart);

    const [securityChart] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_activities,
        COUNT(CASE WHEN action LIKE '%LOGIN%' THEN 1 END) as login_activities,
        COUNT(CASE WHEN action LIKE '%PASSWORD%' THEN 1 END) as password_activities,
        COUNT(CASE WHEN action LIKE '%DELETE%' THEN 1 END) as delete_activities
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    console.log('Security chart data:', securityChart);

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
