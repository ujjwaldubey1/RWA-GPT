import os
import requests
import json
from dotenv import load_dotenv
from uagents import Agent, Context, Model
from decimal import Decimal
from typing import Tuple, Optional

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
            # Default to Polygon if not provided elsewhere
            chain_id = 137
            src_token, dst_token, usdc_decimals = tokens_for_chain(chain_id)

            swap_data = get_1inch_swap_data(
                chain_id=chain_id,
                src_token=src_token,
                dst_token=dst_token,
                amount_human=amount,
                src_token_decimals=usdc_decimals,
                from_address=from_address,
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


def get_1inch_swap_data(chain_id: int, src_token: str, dst_token: str, amount_human: str, src_token_decimals: int, from_address: str) -> dict:
    """
    Get swap data from 1inch API for specified EVM chain
    """
    try:
        # 1inch API endpoint for the provided chain
        url = f"https://api.1inch.io/v5.2/{chain_id}/swap"

        # Convert human amount to minimal units
        amount_units = str(int(Decimal(amount_human) * (10 ** src_token_decimals)))
        
        params = {
            "src": src_token,
            "dst": dst_token,
            "amount": amount_units,
            "from": from_address,
            "slippage": "1"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        # Attempt to parse JSON, otherwise return an error structure
        try:
            data = response.json()
        except Exception:
            return {"error": "1inch returned non-JSON response"}
        return data


def tokens_for_chain(chain_id: int) -> Tuple[str, str, int]:
    """Return (usdc, weth, usdc_decimals) for a supported chain."""
    if chain_id == 1:
        # Ethereum Mainnet
        return (
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",  # USDC
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  # WETH
            6,
        )
    # Default to Polygon
    return (
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",  # WETH
        6,
    )
        
    except requests.exceptions.RequestException as e:
        return {"error": f"1inch API error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}


if __name__ == "__main__":
    agent.run()


