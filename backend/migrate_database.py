#!/usr/bin/env python3
"""
Database Migration Script
Adds status and admin_notes columns to existing customers table
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'customer_data.db')

def migrate_database():
    """Add new columns to existing database"""
    print("Starting database migration...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(customers)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print(f"Current columns: {columns}")
        
        # Add status column if it doesn't exist
        if 'status' not in columns:
            print("Adding 'status' column...")
            cursor.execute('''
                ALTER TABLE customers 
                ADD COLUMN status TEXT DEFAULT 'new'
            ''')
            print("SUCCESS: Added 'status' column")
        else:
            print("OK: 'status' column already exists")
        
        # Add admin_notes column if it doesn't exist
        if 'admin_notes' not in columns:
            print("Adding 'admin_notes' column...")
            cursor.execute('''
                ALTER TABLE customers 
                ADD COLUMN admin_notes TEXT
            ''')
            print("SUCCESS: Added 'admin_notes' column")
        else:
            print("OK: 'admin_notes' column already exists")
        
        conn.commit()
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(customers)")
        columns_after = [column[1] for column in cursor.fetchall()]
        print(f"\nUpdated columns: {columns_after}")
        
        # Check how many customers we have
        cursor.execute("SELECT COUNT(*) FROM customers")
        count = cursor.fetchone()[0]
        print(f"\nTotal customers in database: {count}")
        
        if count > 0:
            print("\nUpdating existing customers with default status...")
            cursor.execute("UPDATE customers SET status = 'new' WHERE status IS NULL")
            conn.commit()
            print("SUCCESS: Updated existing customers")
        
        print("\nMigration completed successfully!")
        
    except Exception as e:
        print(f"\nERROR: Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_database()

