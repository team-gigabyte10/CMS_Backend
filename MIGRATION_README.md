# Contact Directory Migration Guide

## Problem
You're getting this error:
```
Error getting contact statistics: Unknown column 'contact_type' in 'field list'
```

This happens because the Contact Directory API requires additional columns in the `users` table that don't exist yet.

## Solution
Run the migration to add the required columns to your `users` table.

## Option 1: Run Migration Script (Recommended)
```bash
node run_migration.js
```

This script will:
- Connect to your database using environment variables
- Check if the required columns already exist
- Add `parent_id` and `contact_type` columns if missing
- Add necessary indexes and foreign key constraints
- Show progress and completion status

## Option 2: Manual SQL Migration
If you prefer to run the SQL manually, use the `migration_add_contact_fields.sql` file in your database management tool (phpMyAdmin, MySQL Workbench, HeidiSQL, etc.).

## What the Migration Adds

### New Columns in `users` table:
1. **`parent_id`** (INT DEFAULT NULL)
   - Enables hierarchical contact structure
   - References `users(id)` for parent-child relationships
   - Allows unlimited tree depth

2. **`contact_type`** (ENUM('internal','external') DEFAULT 'internal')
   - Classifies contacts as internal or external
   - Used for filtering and statistics

### New Indexes:
- `idx_parent_id` - For efficient parent-child queries
- `idx_contact_type` - For contact type filtering

### New Foreign Key:
- `users_ibfk_8` - Ensures referential integrity for parent_id

## After Migration
Once the migration is complete:
1. Your Contact Directory API will work without errors
2. You can create hierarchical contact structures
3. All CRUD operations will function properly
4. Tree structure display will work correctly

## Verification
After running the migration, you can verify it worked by:
1. Checking the API endpoints work without errors
2. Running: `DESCRIBE users;` in your database to see the new columns
3. Testing the contact tree structure in your frontend

## Rollback (if needed)
If you need to remove the migration:
```sql
ALTER TABLE users DROP FOREIGN KEY users_ibfk_8;
ALTER TABLE users DROP INDEX idx_parent_id;
ALTER TABLE users DROP INDEX idx_contact_type;
ALTER TABLE users DROP COLUMN parent_id;
ALTER TABLE users DROP COLUMN contact_type;
```

## Support
If you encounter any issues during migration, check:
1. Database connection settings in your `.env` file
2. Database user permissions (needs ALTER TABLE privileges)
3. Database server is running and accessible
