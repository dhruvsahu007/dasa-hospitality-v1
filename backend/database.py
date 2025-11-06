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
            status TEXT DEFAULT 'new',
            admin_notes TEXT,
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
            agent_requested_at TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers (id)
        )
    ''')
    
    # Add agent_requested_at column if it doesn't exist (for existing databases)
    try:
        cursor.execute("PRAGMA table_info(chat_sessions)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'agent_requested_at' not in columns:
            cursor.execute('''
                ALTER TABLE chat_sessions 
                ADD COLUMN agent_requested_at TIMESTAMP
            ''')
            print("Added agent_requested_at column to chat_sessions")
    except Exception as e:
        print(f"Note: Could not add agent_requested_at column (may already exist): {e}")
    
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
    print(f"Database initialized at: {DB_PATH}")

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
               time_spent_seconds, created_at, last_active, status, admin_notes
        FROM customers
        ORDER BY created_at DESC
    ''')
    
    customers = cursor.fetchall()
    conn.close()
    
    return customers

def calculate_priority_score(time_spent_seconds, source):
    """
    Calculate priority score for a lead
    - Base score from time spent (1 point per minute)
    - Bonus points for referral sources (+50 points)
    - Bonus for certain high-value sources
    """
    # Base score: 1 point per minute spent on site
    base_score = time_spent_seconds / 60
    
    # Referral bonus points
    referral_bonus = 0
    source_lower = source.lower()
    
    if 'referral' in source_lower:
        referral_bonus = 50  # High priority for referrals
    elif 'advertisement' in source_lower:
        referral_bonus = 30  # Medium priority for ads
    elif 'social media' in source_lower:
        referral_bonus = 20  # Some priority for social
    elif 'google search' in source_lower:
        referral_bonus = 10  # Small bonus for organic search
    
    # Total priority score
    priority_score = base_score + referral_bonus
    
    return round(priority_score, 2)

def get_priority_queue():
    """Get customers sorted by priority score (high to low)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, contact, source, ip_address, device_type, 
               time_spent_seconds, created_at, last_active, status, admin_notes
        FROM customers
        WHERE status != 'closed'
        ORDER BY created_at DESC
    ''')
    
    customers = cursor.fetchall()
    conn.close()
    
    # Calculate priority scores and sort
    priority_list = []
    for customer in customers:
        customer_dict = {
            'id': customer[0],
            'name': customer[1],
            'contact': customer[2],
            'source': customer[3],
            'ip_address': customer[4],
            'device_type': customer[5],
            'time_spent_seconds': customer[6],
            'created_at': customer[7],
            'last_active': customer[8],
            'status': customer[9] if len(customer) > 9 else 'new',
            'admin_notes': customer[10] if len(customer) > 10 else ''
        }
        
        # Calculate priority score
        priority_score = calculate_priority_score(
            customer_dict['time_spent_seconds'],
            customer_dict['source']
        )
        customer_dict['priority_score'] = priority_score
        
        priority_list.append(customer_dict)
    
    # Sort by priority score (highest first)
    priority_list.sort(key=lambda x: x['priority_score'], reverse=True)
    
    return priority_list

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
    
    # Status breakdown
    cursor.execute('SELECT status, COUNT(*) FROM customers GROUP BY status')
    stats['status_breakdown'] = dict(cursor.fetchall())
    
    conn.close()
    return stats

def update_customer_status(customer_id, status):
    """Update customer status (new, contacted, in_progress, closed)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE customers 
        SET status = ?, last_active = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (status, customer_id))
    
    conn.commit()
    conn.close()

def update_customer_notes(customer_id, notes):
    """Update admin notes for a customer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE customers 
        SET admin_notes = ?, last_active = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (notes, customer_id))
    
    conn.commit()
    conn.close()

def get_customer_notes(customer_id):
    """Get admin notes for a customer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT admin_notes FROM customers WHERE id = ?', (customer_id,))
    result = cursor.fetchone()
    conn.close()
    
    return result[0] if result and result[0] else ""

def delete_customer(customer_id):
    """Delete a customer and all associated data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Delete associated chat messages
        cursor.execute('DELETE FROM chat_messages WHERE customer_id = ?', (customer_id,))
        
        # Delete associated chat sessions
        cursor.execute('DELETE FROM chat_sessions WHERE customer_id = ?', (customer_id,))
        
        # Delete the customer
        cursor.execute('DELETE FROM customers WHERE id = ?', (customer_id,))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error deleting customer: {e}")
        return False
    finally:
        conn.close()

def get_customer_chat_messages(customer_id):
    """Get all chat messages for a specific customer"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, customer_id, session_id, message_text, sender, timestamp
        FROM chat_messages
        WHERE customer_id = ?
        ORDER BY timestamp ASC
    ''', (customer_id,))
    
    messages = cursor.fetchall()
    conn.close()
    
    # Convert to list of dictionaries
    message_list = []
    for msg in messages:
        message_list.append({
            'id': msg[0],
            'customer_id': msg[1],
            'session_id': msg[2],
            'text': msg[3],
            'sender': msg[4],
            'timestamp': msg[5]
        })
    
    return message_list

def get_latest_session(customer_id):
    """Get the latest active session for a customer, or create one if none exists"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get the latest session that hasn't ended
    cursor.execute('''
        SELECT id FROM chat_sessions 
        WHERE customer_id = ? AND session_end IS NULL
        ORDER BY session_start DESC
        LIMIT 1
    ''', (customer_id,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        session_id = result[0]
    else:
        # Create a new session if none exists
        session_id = start_chat_session(customer_id)
    
    return session_id

def mark_agent_requested(customer_id, session_id=None):
    """Mark that a customer has requested an agent with current timestamp"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get current timestamp
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # If no session_id provided, get the latest session
        if not session_id:
            session_id = get_latest_session(customer_id)
        
        # Update the session to mark agent as requested with timestamp
        cursor.execute('''
            UPDATE chat_sessions 
            SET agent_requested = 1, agent_requested_at = ?
            WHERE id = ? AND customer_id = ?
        ''', (current_time, session_id, customer_id))
        
        rows_updated = cursor.rowcount
        
        # If no rows were updated, create a new session with agent_requested = 1 and timestamp
        if rows_updated == 0:
            cursor.execute('''
                INSERT INTO chat_sessions (customer_id, agent_requested, agent_requested_at)
                VALUES (?, 1, ?)
            ''', (customer_id, current_time))
            session_id = cursor.lastrowid
        
        conn.commit()
        
        # Verify the update
        cursor.execute('''
            SELECT agent_requested FROM chat_sessions 
            WHERE id = ? AND customer_id = ?
        ''', (session_id, customer_id))
        result = cursor.fetchone()
        
        if result and result[0] == 1:
            return True
        else:
            print(f"Warning: agent_requested not set for customer {customer_id}, session {session_id}")
            return False
            
    except Exception as e:
        print(f"Error marking agent requested: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def get_agent_queue():
    """Get customers who have JUST requested to connect to an agent (within the last hour)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get ONLY customers who:
    # 1. Have requested an agent (agent_requested = 1) WITHIN THE LAST HOUR
    # 2. Have an active session (session_end IS NULL) - meaning they're currently chatting
    # 3. Have at least one chat message (they've actually chatted)
    # 4. Have status 'new' or 'in_progress' (not 'contacted' or 'closed')
    # 5. The agent_requested_at timestamp is within the last hour (recent requests only)
    cursor.execute('''
        SELECT DISTINCT c.id, c.name, c.contact, c.source, c.ip_address, c.device_type, 
               c.time_spent_seconds, c.created_at, c.last_active, c.status, c.admin_notes,
               cs.agent_requested_at
        FROM customers c
        INNER JOIN chat_sessions cs ON c.id = cs.customer_id
        WHERE c.status IN ('new', 'in_progress')
          AND cs.agent_requested = 1
          AND cs.session_end IS NULL
          AND cs.agent_requested_at IS NOT NULL
          AND datetime(cs.agent_requested_at) >= datetime('now', '-1 hour')
          AND EXISTS (
            SELECT 1 FROM chat_messages cm 
            WHERE cm.customer_id = c.id
          )
        ORDER BY cs.agent_requested_at DESC
    ''')
    
    customers = cursor.fetchall()
    
    # Convert to list of dictionaries with priority scores
    queue_list = []
    for customer in customers:
        customer_dict = {
            'id': customer[0],
            'name': customer[1],
            'contact': customer[2],
            'source': customer[3],
            'ip_address': customer[4],
            'device_type': customer[5],
            'time_spent_seconds': customer[6],
            'created_at': customer[7],
            'last_active': customer[8],
            'status': customer[9] if len(customer) > 9 else 'new',
            'admin_notes': customer[10] if len(customer) > 10 else ''
        }
        
        # Calculate priority score
        priority_score = calculate_priority_score(
            customer_dict['time_spent_seconds'],
            customer_dict['source']
        )
        customer_dict['priority_score'] = priority_score
        
        # All customers in queue have already requested agent (filtered by query)
        customer_dict['agent_requested'] = True
        
        queue_list.append(customer_dict)
    
    # Sort by: priority score (highest first), then by creation time (newest first)
    queue_list.sort(key=lambda x: (
        -x['priority_score'],  # Higher priority score first
    ))
    
    conn.close()
    
    return queue_list

# Initialize database when module is imported
if __name__ == '__main__':
    init_database()
    print("Database setup complete!")
