#!/usr/bin/env python3
"""
Test script for Supabase integration.

This script demonstrates how to use the Supabase integration
to insert and fetch messages from the database.
"""

import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our Supabase functions
from supabase_client import (
    insert_message, 
    fetch_messages, 
    fetch_messages_by_role,
    get_message_count,
    initialize_supabase
)


async def test_supabase_integration():
    """Test the Supabase integration with sample data."""
    
    print("🚀 Testing Supabase Integration")
    print("=" * 50)
    
    try:
        # Initialize Supabase client
        print("1. Initializing Supabase client...")
        client = initialize_supabase()
        print("✅ Supabase client initialized successfully")
        
        # Test inserting messages
        print("\n2. Testing message insertion...")
        
        # Insert a user message
        user_message = await insert_message(
            role="user",
            content="Hello GPT, show me investment options",
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        print(f"✅ User message inserted: {user_message['id']}")
        
        # Insert an agent response
        agent_message = await insert_message(
            role="agent",
            content="Here are the available RWA investment options:\n\n🏠 **Real Estate**\n• RE-001: Detroit Residential Complex A\n• RE-002: Miami Commercial Tower B\n\n💰 **Treasury Bills**\n• TCB-001: 3-Month T-Bill (4.8% APY)\n• TCB-002: 6-Month T-Bill (5.2% APY)\n\n💡 Try: 'invest 100 USDC in RE-001'",
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        print(f"✅ Agent message inserted: {agent_message['id']}")
        
        # Insert another user message
        user_message2 = await insert_message(
            role="user",
            content="I want to invest 100 USDC in RE-001",
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        print(f"✅ User message 2 inserted: {user_message2['id']}")
        
        # Test fetching messages
        print("\n3. Testing message fetching...")
        
        # Fetch all messages
        all_messages = await fetch_messages(limit=10)
        print(f"✅ Fetched {len(all_messages)} messages")
        
        # Fetch messages by role
        user_messages = await fetch_messages_by_role("user", limit=5)
        agent_messages = await fetch_messages_by_role("agent", limit=5)
        print(f"✅ Fetched {len(user_messages)} user messages")
        print(f"✅ Fetched {len(agent_messages)} agent messages")
        
        # Get message count
        total_count = await get_message_count()
        print(f"✅ Total messages in database: {total_count}")
        
        # Display sample messages
        print("\n4. Sample Messages:")
        print("-" * 30)
        for i, msg in enumerate(all_messages[:3], 1):
            print(f"\nMessage {i}:")
            print(f"  Role: {msg['role']}")
            print(f"  Content: {msg['content'][:100]}...")
            print(f"  Timestamp: {msg['timestamp']}")
        
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("\n💡 Make sure you have:")
        print("1. Created a .env file with SUPABASE_URL and SUPABASE_KEY")
        print("2. Set up a Supabase project")
        print("3. Created a 'messages' table in your Supabase database")
        print("4. Installed required dependencies: pip install supabase python-dotenv")


async def create_sample_messages():
    """Create sample messages for demonstration."""
    
    print("\n📝 Creating sample conversation...")
    
    sample_conversation = [
        ("user", "Hello, I'm interested in RWA investments"),
        ("agent", "Welcome! I can help you explore Real-World Asset investments. Here are some options:\n\n🏠 **Real Estate**\n• RE-001: Detroit Residential Complex A (6.5% APY)\n• RE-002: Miami Commercial Tower B (7.2% APY)\n\n💰 **Treasury Bills**\n• TCB-001: 3-Month T-Bill (4.8% APY)\n• TCB-002: 6-Month T-Bill (5.2% APY)\n\nWhat interests you most?"),
        ("user", "I'd like to invest in real estate. What's the minimum investment?"),
        ("agent", "Great choice! For real estate investments:\n\n• **RE-001**: Minimum 50 USDC\n• **RE-002**: Minimum 100 USDC\n\nBoth offer excellent returns and are backed by real properties. You can start with: 'invest 50 USDC in RE-001'"),
        ("user", "Perfect! I'll invest 100 USDC in RE-001"),
        ("agent", "Excellent! I'll process your investment of 100 USDC in RE-001. This will give you exposure to the Detroit Residential Complex A with a 6.5% APY. Your investment will be tokenized and you'll receive RWA tokens representing your share of the property.")
    ]
    
    for role, content in sample_conversation:
        try:
            message = await insert_message(role, content)
            print(f"✅ {role.capitalize()}: {content[:50]}...")
        except Exception as e:
            print(f"❌ Failed to insert {role} message: {e}")


if __name__ == "__main__":
    print("Supabase Integration Test")
    print("=" * 50)
    
    # Check if environment variables are set
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("❌ Missing environment variables!")
        print("Please create a .env file with:")
        print("SUPABASE_URL=your-supabase-project-url")
        print("SUPABASE_KEY=your-supabase-service-role-key")
        exit(1)
    
    # Run the tests
    asyncio.run(test_supabase_integration())
    
    # Ask if user wants to create sample messages
    print("\n" + "=" * 50)
    create_samples = input("Would you like to create sample conversation messages? (y/n): ")
    if create_samples.lower() == 'y':
        asyncio.run(create_sample_messages())
