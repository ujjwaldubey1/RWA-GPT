"""
Supabase integration for RWA-GPT project.

This module provides database operations for storing and retrieving chat messages
using Supabase as the backend database.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Global Supabase client
supabase: Optional[Client] = None


def initialize_supabase() -> Client:
    """
    Initialize and return a Supabase client.
    
    Raises:
        ValueError: If required environment variables are missing
        Exception: If Supabase client initialization fails
    
    Returns:
        Client: Initialized Supabase client
    """
    global supabase
    
    if supabase is not None:
        return supabase
    
    # Validate environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url:
        raise ValueError(
            "SUPABASE_URL environment variable is required. "
            "Please set it in your .env file."
        )
    
    if not supabase_key:
        raise ValueError(
            "SUPABASE_KEY environment variable is required. "
            "Please set it in your .env file."
        )
    
    try:
        # Initialize Supabase client
        supabase = create_client(
            supabase_url=supabase_url,
            supabase_key=supabase_key,
            options=ClientOptions(
                auto_refresh_token=True,
                persist_session=True
            )
        )
        
        logger.info("Supabase client initialized successfully")
        return supabase
        
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise Exception(f"Supabase initialization failed: {e}")


async def insert_message(
    role: str, 
    content: str, 
    timestamp: Optional[str] = None
) -> Dict[str, Any]:
    """
    Insert a new message into the messages table.
    
    Args:
        role: The role of the message sender ('user' or 'agent')
        content: The message content
        timestamp: Optional timestamp in ISO format. If None, uses current time
    
    Returns:
        Dict containing the inserted message data
        
    Raises:
        Exception: If database operation fails
    """
    try:
        client = initialize_supabase()
        
        # Use current timestamp if not provided
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Prepare message data
        message_data = {
            "role": role,
            "content": content,
            "timestamp": timestamp,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Insert into messages table
        result = client.table("messages").insert(message_data).execute()
        
        if result.data:
            logger.info(f"Message inserted successfully: {result.data[0]['id']}")
            return result.data[0]
        else:
            raise Exception("No data returned from insert operation")
            
    except Exception as e:
        logger.error(f"Failed to insert message: {e}")
        raise Exception(f"Database insert failed: {e}")


async def fetch_messages(limit: int = 100) -> List[Dict[str, Any]]:
    """
    Fetch messages from the database ordered by timestamp descending.
    
    Args:
        limit: Maximum number of messages to fetch (default: 100)
    
    Returns:
        List of message dictionaries
        
    Raises:
        Exception: If database operation fails
    """
    try:
        client = initialize_supabase()
        
        # Fetch messages ordered by timestamp descending
        result = (
            client.table("messages")
            .select("*")
            .order("timestamp", desc=True)
            .limit(limit)
            .execute()
        )
        
        if result.data:
            logger.info(f"Fetched {len(result.data)} messages")
            return result.data
        else:
            logger.info("No messages found")
            return []
            
    except Exception as e:
        logger.error(f"Failed to fetch messages: {e}")
        raise Exception(f"Database fetch failed: {e}")


async def fetch_messages_by_role(role: str, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetch messages filtered by role.
    
    Args:
        role: The role to filter by ('user' or 'agent')
        limit: Maximum number of messages to fetch
    
    Returns:
        List of message dictionaries for the specified role
    """
    try:
        client = initialize_supabase()
        
        result = (
            client.table("messages")
            .select("*")
            .eq("role", role)
            .order("timestamp", desc=True)
            .limit(limit)
            .execute()
        )
        
        if result.data:
            logger.info(f"Fetched {len(result.data)} messages for role '{role}'")
            return result.data
        else:
            logger.info(f"No messages found for role '{role}'")
            return []
            
    except Exception as e:
        logger.error(f"Failed to fetch messages by role: {e}")
        raise Exception(f"Database fetch by role failed: {e}")


async def delete_message(message_id: str) -> bool:
    """
    Delete a message by ID.
    
    Args:
        message_id: The ID of the message to delete
    
    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        client = initialize_supabase()
        
        result = (
            client.table("messages")
            .delete()
            .eq("id", message_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Message {message_id} deleted successfully")
            return True
        else:
            logger.warning(f"Message {message_id} not found for deletion")
            return False
            
    except Exception as e:
        logger.error(f"Failed to delete message {message_id}: {e}")
        raise Exception(f"Database delete failed: {e}")


async def get_message_count() -> int:
    """
    Get the total count of messages in the database.
    
    Returns:
        Total number of messages
    """
    try:
        client = initialize_supabase()
        
        result = (
            client.table("messages")
            .select("id", count="exact")
            .execute()
        )
        
        count = result.count if result.count is not None else 0
        logger.info(f"Total messages in database: {count}")
        return count
        
    except Exception as e:
        logger.error(f"Failed to get message count: {e}")
        raise Exception(f"Database count failed: {e}")


# Initialize Supabase on module import
try:
    initialize_supabase()
    logger.info("Supabase module loaded successfully")
except Exception as e:
    logger.warning(f"Supabase initialization failed on module load: {e}")
    logger.warning("Supabase will be initialized when first used")
