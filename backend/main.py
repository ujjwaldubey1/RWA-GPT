from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from dotenv import load_dotenv
from agent import query_rwa_database, get_1inch_swap_data
import re

# Load environment variables
load_dotenv()

app = FastAPI(title="RWA-GPT API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow common local dev origins
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "endpoints": ["/health", "/ask-agent"]}

class MessageRequest(BaseModel):
    message: str
    chainId: int | None = None
    fromAddress: str | None = None

class MessageResponse(BaseModel):
    response: str
    is_transaction: bool = False
    transaction_data: dict | None = None

@app.post("/ask-agent", response_model=MessageResponse)
async def ask_agent(request: MessageRequest):
    try:
        message = request.message.lower()
        
        # Check if user wants to see investments (more flexible matching)
        if any(keyword in message for keyword in ["show investments", "investment options", "investments", "show me investment", "investment data", "rwa assets", "available assets"]):
            subgraph_url = os.getenv("SUBGRAPH_URL")
            if subgraph_url:
                live_data = query_rwa_database(subgraph_url)
                if live_data:
                    return MessageResponse(
                        response=f"Latest investments from subgraph:\n{json.dumps(live_data, indent=2)}",
                        is_transaction=False
                    )
                # Fall back to curated options when subgraph has no data yet
                mock_investments = """[
  {
    "asset_id": "TCB-001",
    "asset_type": "Tokenized T-Bill",
    "protocol": "Ondo",
    "yield_apy": 4.8,
    "min_investment": "1000 USDC",
    "status": "Active"
  },
  {
    "asset_id": "PCR-007", 
    "asset_type": "Private Credit",
    "protocol": "Centrifuge",
    "yield_apy": 9.2,
    "min_investment": "5000 USDC",
    "status": "Active"
  },
  {
    "asset_id": "RWA-003",
    "asset_type": "Real Estate Token",
    "protocol": "RealT",
    "yield_apy": 6.5,
    "min_investment": "50 USDC",
    "status": "Active"
  }
]"""
                return MessageResponse(
                    response=f"No indexed investments yet. Here are curated options you can try now:\n{mock_investments}",
                    is_transaction=False
                )
            else:
                # Return mock data when subgraph is not configured
                mock_investments = """[
  {
    "asset_id": "TCB-001",
    "asset_type": "Tokenized T-Bill",
    "protocol": "Ondo",
    "yield_apy": 4.8,
    "min_investment": "1000 USDC",
    "status": "Active"
  },
  {
    "asset_id": "PCR-007", 
    "asset_type": "Private Credit",
    "protocol": "Centrifuge",
    "yield_apy": 9.2,
    "min_investment": "5000 USDC",
    "status": "Active"
  },
  {
    "asset_id": "RWA-003",
    "asset_type": "Real Estate Token",
    "protocol": "RealT",
    "yield_apy": 6.5,
    "min_investment": "50 USDC",
    "status": "Active"
  }
]"""
                return MessageResponse(
                    response=f"Available RWA Investment Options:\n{mock_investments}\n\nTo invest, try: 'invest 100 USDC in TCB-001'",
                    is_transaction=False
                )
        
        # Check if user wants to invest (more flexible matching)
        elif "invest" in message and any(token in message for token in ["usdc", "tcb", "pcr", "rwa"]):
            try:
                # Extract amount from message (simple parse; default 100)
                m = re.search(r"(\d+(?:\.\d+)?)", request.message)
                amount = m.group(1) if m else "100"
                from_address = request.fromAddress or "0x1234567890123456789012345678901234567890"  # Placeholder
                chain_id = request.chainId or 137
                
                # Get swap data from 1inch
                swap_data = get_1inch_swap_data(
                    chain_id=chain_id,
                    src_token="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC on Polygon
                    dst_token="0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",  # WETH as default
                    amount_human=amount,
                    src_token_decimals=6,
                    from_address=from_address,
                )
                
                is_tx = bool(swap_data and isinstance(swap_data, dict) and (swap_data.get("tx") or swap_data.get("to")))

                # Demo fallback: if no tx from aggregators, return a safe no-op tx
                tx_payload = None
                if not is_tx:
                    tx = {
                        "to": from_address,
                        "data": "0x",
                        "value": "0x0",
                        "gas": "0x5208",
                    }
                    tx_payload = tx
                    is_tx = True
                else:
                    tx_payload = swap_data.get("tx") or swap_data

                return MessageResponse(
                    response=f"1inch swap data for {amount} USDC:",
                    is_transaction=is_tx,
                    transaction_data=tx_payload
                )
            except Exception as e:
                return MessageResponse(
                    response=f"Error getting swap data: {str(e)}",
                    is_transaction=False
                )
        
        # Default response with helpful suggestions
        else:
            return MessageResponse(
                response="I can help you with RWA investments! Here are some things you can try:\n\n• 'show investment options' - See available RWA assets\n• 'invest 100 USDC in TCB-001' - Execute a swap transaction\n• 'show investments' - View latest investment data\n\nWhat would you like to do?",
                is_transaction=False
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
