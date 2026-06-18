import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph import StateGraph, START, END
from agents.state import AgentState
from retrieval.tools import tools

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0,
    max_output_tokens=4096    
)
llm_with_tools = llm.bind_tools(tools)

def agent_node(state: AgentState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools=tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", tools_condition)
workflow.add_edge("tools", "agent")

codebase_agent = workflow.compile()