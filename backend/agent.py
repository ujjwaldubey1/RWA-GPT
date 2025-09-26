import os
import requests
import json
from dotenv import load_dotenv
from uagents import Agent, Context, Model

# Load environment variables
load_dotenv()

class Message(Model):
    content: str


agent = Agent(name="RWA-GPT-Agent")


@agent.on_message(model=Message)
async def handle_message(ctx: Context, sender: str, msg: Message) -> None:
    ctx.logger.info(f"Received message from {sender}: {msg.content}")
    
    # Check if user wants to see investments
    if "show investments" in msg.content.lower():
        subgraph_url = os.getenv("SUBGRAPH_URL")
        if subgraph_url:
            investments = query_rwa_database(subgraph_url)
            response = f"Latest investments from subgraph:\n{investments}"
        else:
            response = "Subgraph URL not configured. Please set SUBGRAPH_URL in .env file."
    # Check if user wants to invest
    elif "invest" in msg.content.lower() and "usdc" in msg.content.lower():
        # Extract amount and asset from message (simplified parsing)
        try:
            # For demo: "invest 100 USDC in TCB-001"
            parts = msg.content.lower().split()
            amount = "100"  # Simplified - would need proper parsing
            from_address = "0x1234567890123456789012345678901234567890"  # Placeholder
            
            # Get swap data from 1inch
            swap_data = get_1inch_swap_data(
                src_token="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC on Polygon
                dst_token="0x0000000000000000000000000000000000000000",  # Placeholder for RWA token
                amount=amount,
                from_address=from_address
            )
            
            response = f"1inch swap data for {amount} USDC:\n{json.dumps(swap_data, indent=2)}"
        except Exception as e:
            response = f"Error getting swap data: {str(e)}"
    else:
        response = "Message received"
    
    await ctx.send(sender, Message(content=response))


def query_rwa_database(subgraph_url: str) -> str:
    """
    Query the subgraph for latest investments
    """
    try:
        # GraphQL query to fetch latest 5 investments
        query = {
            "query": "{ investments(first: 5, orderBy: timestamp, orderDirection: desc) { id investor amount timestamp } }"
        }
        
        # Send POST request to subgraph
        response = requests.post(subgraph_url, json=query, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if "data" in data and "investments" in data["data"]:
            investments = data["data"]["investments"]
            return json.dumps(investments, indent=2)
        else:
            return "No investments found or error in response"
            
    except requests.exceptions.RequestException as e:
        return f"Error querying subgraph: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


def get_1inch_swap_data(src_token: str, dst_token: str, amount: str, from_address: str) -> dict:
    """
    Get swap data from 1inch API for Polygon network
    """
    try:
        # 1inch API endpoint for Polygon (chain ID 137)
        url = "https://api.1inch.io/v5.2/137/swap"
        
        params = {
            "src": src_token,
            "dst": dst_token,
            "amount": amount,
            "from": from_address,
            "slippage": "1"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        return {"error": f"1inch API error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}


if __name__ == "__main__":
    agent.run()


