import sqlite3
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'customer_data.db')

def init_database():
    """Initialize the SQLite database and create tables if they don't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create customers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT NOT NULL,
            source TEXT NOT NULL,
            ip_address TEXT,
            device_type TEXT,
            browser TEXT,
            operating_system TEXT,
            time_spent_seconds INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create chat_sessions table to track interactions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            session_end TIMESTAMP,
            total_messages INTEGER DEFAULT 0,
            agent_requested BOOLEAN DEFAULT 0,
            FOREIGN KEY (customer_id) REFERENCES customers (id)
        )
    ''')
    
    # Create chat_messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            session_id INTEGER,
            message_text TEXT,
            sender TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers (id),
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"✅ Database initialized at: {DB_PATH}")

def save_customer_info(name, contact, source, ip_address, device_info, time_spent=0):
    """Save customer information to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO customers (name, contact, source, ip_address, device_type, browser, operating_system, time_spent_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        name,
        contact,
        source,
        ip_address,
        device_info.get('device_type', 'Unknown'),
        device_info.get('browser', 'Unknown'),
        device_info.get('os', 'Unknown'),
        time_spent
    ))
    
    customer_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return customer_id

def start_chat_session(customer_id):
    """Start a new chat session for a customer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO chat_sessions (customer_id)
        VALUES (?)
    ''', (customer_id,))
    
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return session_id

def save_chat_message(customer_id, session_id, message_text, sender):
    """Save a chat message"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO chat_messages (customer_id, session_id, message_text, sender)
        VALUES (?, ?, ?, ?)
    ''', (customer_id, session_id, message_text, sender))
    
    # Update message count in session
    cursor.execute('''
        UPDATE chat_sessions 
        SET total_messages = total_messages + 1
        WHERE id = ?
    ''', (session_id,))
    
    conn.commit()
    conn.close()

def update_time_spent(customer_id, time_spent_seconds):
    """Update time spent on site for a customer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE customers 
        SET time_spent_seconds = ?, last_active = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (time_spent_seconds, customer_id))
    
    conn.commit()
    conn.close()

def end_chat_session(session_id):
    """End a chat session"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE chat_sessions 
        SET session_end = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (session_id,))
    
    conn.commit()
    conn.close()

def get_customer_by_id(customer_id):
    """Retrieve customer information by ID"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM customers WHERE id = ?
    ''', (customer_id,))
    
    customer = cursor.fetchone()
    conn.close()
    
    return customer

def get_all_customers():
    """Retrieve all customers"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, contact, source, ip_address, device_type, 
               time_spent_seconds, created_at, last_active
        FROM customers
        ORDER BY created_at DESC
    ''')
    
    customers = cursor.fetchall()
    conn.close()
    
    return customers

def get_customer_stats():
    """Get statistics about customers"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    stats = {}
    
    # Total customers
    cursor.execute('SELECT COUNT(*) FROM customers')
    stats['total_customers'] = cursor.fetchone()[0]
    
    # Source breakdown
    cursor.execute('SELECT source, COUNT(*) FROM customers GROUP BY source')
    stats['source_breakdown'] = dict(cursor.fetchall())
    
    # Average time spent
    cursor.execute('SELECT AVG(time_spent_seconds) FROM customers')
    stats['avg_time_spent'] = cursor.fetchone()[0] or 0
    
    # Device type breakdown
    cursor.execute('SELECT device_type, COUNT(*) FROM customers GROUP BY device_type')
    stats['device_breakdown'] = dict(cursor.fetchall())
    
    conn.close()
    return stats

# Initialize database when module is imported
if __name__ == '__main__':
    init_database()
    print("Database setup complete!")
