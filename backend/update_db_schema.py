import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add current directory to path so we can import src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from src.db.session import engine
from src.auth.security import get_password_hash

def migrate():
    with engine.connect() as conn:
        logger.info("Checking users table schema...")
        
        # Check if column exists
        column_exists = False
        try:
            conn.execute(text("SELECT hashed_password FROM users LIMIT 1"))
            column_exists = True
        except Exception:
            # If the query fails (e.g. column missing), the transaction is aborted.
            # We must rollback to reset the connection state.
            conn.rollback()
            column_exists = False

        if column_exists:
            logger.info("Column 'hashed_password' already exists. No migration needed.")
            return

        logger.info("Column 'hashed_password' missing. Starting migration...")

        # Begin transaction
        trans = conn.begin()
        try:
            # 1. Add column as nullable first
            logger.info("Adding 'hashed_password' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR"))
            
            # 2. Update existing users with a default password
            default_pass = "ChangeMe123!"
            logger.info(f"Hashing default password for existing users...")
            hashed = get_password_hash(default_pass)
            
            logger.info("Updating existing records...")
            conn.execute(text("UPDATE users SET hashed_password = :hashed"), {"hashed": hashed})
            
            # 3. Make it not null (PostgreSQL syntax)
            logger.info("Setting NOT NULL constraint...")
            conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password SET NOT NULL"))
            
            trans.commit()
            logger.info("Migration successful!")
            logger.info(f"IMPORTANT: All existing users have been updated with password: {default_pass}")
            
        except Exception as e:
            trans.rollback()
            logger.error(f"Migration failed: {e}")
            logger.error("Note: This script assumes PostgreSQL. If using SQLite, manual schema update or table recreation is required.")
            raise

if __name__ == "__main__":
    migrate()
