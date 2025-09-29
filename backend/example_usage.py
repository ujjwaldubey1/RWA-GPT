#!/usr/bin/env python3
"""
Example usage of Supabase integration.

This file demonstrates how to use the Supabase integration
in your main application.
"""

import asyncio
from datetime import datetime
from supabase_client import insert_message, fetch_messages


async def main():
    """Example of how to use Supabase in your main application."""
    
    print("📱 RWA-GPT with Supabase Integration")
    print("=" * 50)
    
    # Example 1: Insert a user message
    print("1. Storing user message...")
    user_msg = await insert_message(
        role="user",
        content="Hello GPT, show me investment options",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    print(f"✅ User message stored with ID: {user_msg['id']}")
    
    # Example 2: Insert an agent response
    print("\n2. Storing agent response...")
    agent_msg = await insert_message(
        role="agent",
        content="Here are the available RWA investment options:\n\n🏠 **Real Estate**\n• RE-001: Detroit Residential Complex A (6.5% APY)\n• RE-002: Miami Commercial Tower B (7.2% APY)\n\n💰 **Treasury Bills**\n• TCB-001: 3-Month T-Bill (4.8% APY)\n• TCB-002: 6-Month T-Bill (5.2% APY)\n\n💡 Try: 'invest 100 USDC in RE-001'",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    print(f"✅ Agent response stored with ID: {agent_msg['id']}")
    
    # Example 3: Fetch recent messages
    print("\n3. Fetching recent messages...")
    messages = await fetch_messages(limit=10)
    print(f"✅ Fetched {len(messages)} messages")
    
    # Example 4: Display conversation
    print("\n4. Recent Conversation:")
    print("-" * 30)
    for msg in messages[:5]:  # Show last 5 messages
        role_emoji = "👤" if msg['role'] == 'user' else "🤖"
        print(f"{role_emoji} {msg['role'].capitalize()}: {msg['content'][:100]}...")
        print(f"   📅 {msg['timestamp']}")
        print()


if __name__ == "__main__":
    asyncio.run(main())
