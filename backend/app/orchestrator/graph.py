from langgraph.graph import StateGraph, START, END
from app.orchestrator.state import SessionState

from app.agents.financial_literacy import run_financial_literacy
from app.agents.wealth_manager import run_wealth_manager
from app.agents.risk_profiler import run_risk_profiler
from app.agents.cross_validation import run_cross_validation
from app.agents.market_intelligence import run_market_intelligence
from app.agents.investment_strategist import run_investment_strategist
from app.agents.communication_education import run_communication_education

# Wrapper functions for LangGraph nodes
def node_financial_literacy(state: SessionState):
    res = run_financial_literacy(state, "")
    return {
        "literacy_level": res.literacy_level,
        "communication_style": res.communication_style,
        "istilah_perlu_dijelaskan": res.istilah_perlu_dijelaskan
    }

def node_wealth_manager(state: SessionState):
    res = run_wealth_manager(state, "")
    return {
        "wealth_status": res.wealth_status
    }

def node_risk_profiler(state: SessionState):
    res = run_risk_profiler(state, "")
    return {
        "risk_profile": res.risk_profile
    }

def node_cross_validation(state: SessionState):
    res = run_cross_validation(state, "")
    return {"mediation_result": res.mediation_result}

def node_market_intelligence(state: SessionState):
    res = run_market_intelligence(state, "")
    return {
        "market_context": res.market_context
    }

def node_investment_strategist(state: SessionState):
    res = run_investment_strategist(state, "")
    return {
        "allocation": res.allocation
    }

def node_communication_education(state: SessionState):
    res = run_communication_education(state, "")
    return {"final_output": res.final_output}

# Build FinanceIQ Architecture Graph
builder = StateGraph(SessionState)

builder.add_node("financial_literacy_node", node_financial_literacy)
builder.add_node("wealth_manager_node", node_wealth_manager)
builder.add_node("risk_profiler_node", node_risk_profiler)
builder.add_node("cross_validation_node", node_cross_validation)
builder.add_node("market_intelligence_node", node_market_intelligence)
builder.add_node("investment_strategist_node", node_investment_strategist)
builder.add_node("communication_education_node", node_communication_education)

# Control Flow
builder.add_edge(START, "financial_literacy_node")

# Parallel Execution (Fan-out)
builder.add_edge("financial_literacy_node", "wealth_manager_node")
builder.add_edge("financial_literacy_node", "risk_profiler_node")

# Fan-in to Cross Validation
builder.add_edge("wealth_manager_node", "cross_validation_node")
builder.add_edge("risk_profiler_node", "cross_validation_node")

# Linear flow after mediasi
builder.add_edge("cross_validation_node", "market_intelligence_node")
builder.add_edge("market_intelligence_node", "investment_strategist_node")
builder.add_edge("investment_strategist_node", "communication_education_node")
builder.add_edge("communication_education_node", END)

graph = builder.compile()

def run_agent_graph(user_input: str, state: SessionState) -> SessionState:
    # TODO: Injeksi user_input ke dalam state atau kirimkan via config jika diperlukan.
    # Untuk sementara, state digunakan sebagai payload penuh.
    
    # Menjalankan graph dengan initial state
    # LangGraph akan menjalankan node dan memperbarui field sesuai Pydantic model
    result = graph.invoke(state)
    return result
