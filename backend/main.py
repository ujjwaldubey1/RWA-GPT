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

# Enhanced RWA Investment Database with detailed options
RWA_INVESTMENT_OPTIONS = {
    "treasury_bills": {
        "asset_id": "TCB-001",
        "asset_type": "Tokenized T-Bill",
        "protocol": "Ondo Finance",
        "yield_apy": 4.8,
        "min_investment": "1000 USDC",
        "risk_level": "Low",
        "liquidity": "High",
        "duration": "3-6 months",
        "description": "US Treasury Bills tokenized on-chain, backed by real government securities",
        "keywords": ["treasury", "t-bill", "government", "safe", "low risk", "stable", "conservative"]
    },
    "private_credit": {
        "asset_id": "PCR-007", 
        "asset_type": "Private Credit",
        "protocol": "Centrifuge",
        "yield_apy": 9.2,
        "min_investment": "5000 USDC",
        "risk_level": "Medium-High",
        "liquidity": "Medium",
        "duration": "12-24 months",
        "description": "Direct lending to companies, higher yields with moderate risk",
        "keywords": ["credit", "lending", "corporate", "medium risk", "yield", "debt"]
    },
    "real_estate": {
        "asset_id": "RWA-003",
        "asset_type": "Real Estate Token",
        "protocol": "RealT",
        "yield_apy": 6.5,
        "min_investment": "50 USDC",
        "risk_level": "Medium",
        "liquidity": "Low",
        "duration": "Long-term",
        "description": "Fractional ownership of rental properties with monthly dividends",
        "keywords": ["real estate", "property", "rental", "housing", "dividends", "reit"]
    },
    "commodities": {
        "asset_id": "CMD-012",
        "asset_type": "Commodity Token",
        "protocol": "Paxos",
        "yield_apy": 3.2,
        "min_investment": "100 USDC",
        "risk_level": "Medium",
        "liquidity": "High",
        "duration": "Flexible",
        "description": "Gold and precious metals backed tokens for inflation hedging",
        "keywords": ["gold", "silver", "commodity", "inflation", "hedge", "precious metals"]
    },
    "infrastructure": {
        "asset_id": "INF-008",
        "asset_type": "Infrastructure Bond",
        "protocol": "Maple Finance",
        "yield_apy": 7.8,
        "min_investment": "2500 USDC",
        "risk_level": "Medium",
        "liquidity": "Medium",
        "duration": "18-36 months",
        "description": "Financing for renewable energy and infrastructure projects",
        "keywords": ["infrastructure", "renewable", "energy", "solar", "wind", "green", "sustainable"]
    },
    "supply_chain": {
        "asset_id": "SCF-015",
        "asset_type": "Supply Chain Finance",
        "protocol": "TrueFi",
        "yield_apy": 8.5,
        "min_investment": "1000 USDC",
        "risk_level": "Medium-High",
        "liquidity": "Medium",
        "duration": "6-12 months",
        "description": "Trade finance for global supply chains and logistics",
        "keywords": ["supply chain", "trade", "logistics", "import", "export", "commerce"]
    }
}

def analyze_prompt_and_recommend(prompt: str) -> list:
    """
    Analyze user prompt and recommend relevant RWA investment options
    """
    prompt_lower = prompt.lower()
    recommendations = []
    
    # Score each investment option based on keyword matching
    for category, investment in RWA_INVESTMENT_OPTIONS.items():
        score = 0
        matched_keywords = []
        
        # Check for keyword matches
        for keyword in investment["keywords"]:
            if keyword in prompt_lower:
                score += 2
                matched_keywords.append(keyword)
        
        # Check for risk preference
        if any(word in prompt_lower for word in ["safe", "low risk", "conservative", "stable"]):
            if investment["risk_level"] == "Low":
                score += 3
        elif any(word in prompt_lower for word in ["high yield", "aggressive", "high return"]):
            if investment["risk_level"] in ["Medium-High", "High"]:
                score += 3
        elif any(word in prompt_lower for word in ["moderate", "balanced", "medium risk"]):
            if investment["risk_level"] == "Medium":
                score += 2
        
        # Check for yield preferences
        if any(word in prompt_lower for word in ["high yield", "good return", "profitable"]):
            if investment["yield_apy"] > 7:
                score += 2
        
        # Check for liquidity preferences
        if any(word in prompt_lower for word in ["liquid", "quick access", "flexible"]):
            if investment["liquidity"] == "High":
                score += 2
        
        # Check for investment amount preferences
        if any(word in prompt_lower for word in ["small", "little", "minimal"]):
            if investment["min_investment"] == "50 USDC" or investment["min_investment"] == "100 USDC":
                score += 1
        elif any(word in prompt_lower for word in ["large", "big", "substantial"]):
            if "5000" in investment["min_investment"] or "2500" in investment["min_investment"]:
                score += 1
        
        # Check for duration preferences
        if any(word in prompt_lower for word in ["short term", "quick", "temporary"]):
            if "3-6 months" in investment["duration"] or "6-12 months" in investment["duration"]:
                score += 1
        elif any(word in prompt_lower for word in ["long term", "permanent", "hold"]):
            if "Long-term" in investment["duration"] or "18-36 months" in investment["duration"]:
                score += 1
        
        if score > 0:
            investment_copy = investment.copy()
            investment_copy["relevance_score"] = score
            investment_copy["matched_keywords"] = matched_keywords
            recommendations.append(investment_copy)
    
    # Sort by relevance score (highest first)
    recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    # If no specific matches, return top 3 general options
    if not recommendations:
        return [
            RWA_INVESTMENT_OPTIONS["treasury_bills"],
            RWA_INVESTMENT_OPTIONS["real_estate"],
            RWA_INVESTMENT_OPTIONS["private_credit"]
        ]
    
    # Return top 3 recommendations
    return recommendations[:3]

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
        
        # Intelligent RWA recommendation based on any prompt
        else:
            # Analyze the prompt and get personalized recommendations
            recommendations = analyze_prompt_and_recommend(request.message)
            
            # Format the response
            response_text = f"Based on your query: '{request.message}'\n\n"
            response_text += "Here are my personalized RWA investment recommendations:\n\n"
            
            for i, rec in enumerate(recommendations, 1):
                response_text += f"🏆 #{i} - {rec['asset_id']} ({rec['asset_type']})\n"
                response_text += f"   Protocol: {rec['protocol']}\n"
                response_text += f"   APY: {rec['yield_apy']}% | Risk: {rec['risk_level']} | Min: {rec['min_investment']}\n"
                response_text += f"   Duration: {rec['duration']} | Liquidity: {rec['liquidity']}\n"
                response_text += f"   📝 {rec['description']}\n"
                
                if rec.get("matched_keywords"):
                    response_text += f"   🎯 Matched: {', '.join(rec['matched_keywords'])}\n"
                
                response_text += f"\n   💰 To invest: 'invest 100 USDC in {rec['asset_id']}'\n\n"
            
            response_text += "💡 Try specific prompts like:\n"
            response_text += "• 'I want safe investments' - Low-risk options\n"
            response_text += "• 'Show me high yield opportunities' - Higher return assets\n"
            response_text += "• 'I need liquid investments' - Easy-to-exit positions\n"
            response_text += "• 'Green energy investments' - Sustainable options\n"
            
            return MessageResponse(
                response=response_text,
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
