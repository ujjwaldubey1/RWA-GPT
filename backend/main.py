from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from dotenv import load_dotenv
from agent import query_rwa_database, get_1inch_swap_data

# Load environment variables
load_dotenv()

app = FastAPI(title="RWA-GPT API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    response: str
    is_transaction: bool = False
    transaction_data: dict = None

@app.post("/ask-agent", response_model=MessageResponse)
async def ask_agent(request: MessageRequest):
    try:
        message = request.message.lower()
        
        # Check if user wants to see investments
        if "show investments" in message:
            subgraph_url = os.getenv("SUBGRAPH_URL")
            if subgraph_url:
                investments = query_rwa_database(subgraph_url)
                return MessageResponse(
                    response=f"Latest investments from subgraph:\n{investments}",
                    is_transaction=False
                )
            else:
                return MessageResponse(
                    response="Subgraph URL not configured. Please set SUBGRAPH_URL in .env file.",
                    is_transaction=False
                )
        
        # Check if user wants to invest
        elif "invest" in message and "usdc" in message:
            try:
                # Extract amount and asset from message (simplified parsing)
                amount = "100"  # Simplified - would need proper parsing
                from_address = "0x1234567890123456789012345678901234567890"  # Placeholder
                
                # Get swap data from 1inch
                swap_data = get_1inch_swap_data(
                    src_token="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC on Polygon
                    dst_token="0x0000000000000000000000000000000000000000",  # Placeholder for RWA token
                    amount=amount,
                    from_address=from_address
                )
                
                return MessageResponse(
                    response=f"1inch swap data for {amount} USDC:",
                    is_transaction=True,
                    transaction_data=swap_data
                )
            except Exception as e:
                return MessageResponse(
                    response=f"Error getting swap data: {str(e)}",
                    is_transaction=False
                )
        
        # Default response
        else:
            return MessageResponse(
                response="I understand you want to interact with RWA assets. Try 'show investments' or 'invest 100 USDC in TCB-001'",
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
