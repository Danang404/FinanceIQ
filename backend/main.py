from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.orchestrator.graph import run_agent_graph
from app.orchestrator.state import SessionState, DataDasarKeuangan

app = FastAPI(
    title="FinanceIQ API",
    description="Backend API untuk sistem Multi-Agent FinanceIQ",
    version="2.0",
)

class ChatRequest(BaseModel):
    user_input: str
    session_state: SessionState

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.0"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Menjalankan graph LangGraph dengan state dan input terbaru
        updated_state = run_agent_graph(request.user_input, request.session_state)
        return {"state": updated_state}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
