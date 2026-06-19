from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from agents.graph_agent import codebase_agent
from typing import List, Literal

app = FastAPI()

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageItem(BaseModel):
    role: Literal["user", "agent"]
    content: str

class ChatRequest(BaseModel):
    messages: List[MessageItem]

# Helpers #

def extract_response_text(ai_message) -> str:
    raw_content = ai_message.content;
    
    if isinstance(raw_content, str):
        return raw_content
    elif isinstance(raw_content, list):
        return "\n".join(
            block["text"] for block in raw_content if isinstance(block, dict) and "text" in block
        )
    elif isinstance(raw_content, dict) and "text" in raw_content:
        return raw_content["text"]
    
    return str(raw_content)

def extract_citations(new_messages: list) -> list:
    citations_set = set()

    for msg in new_messages:
        if hasattr(msg, "tool_calls") and isinstance(msg.tool_calls, list):
            for tool_call in msg.tool_calls:
                if tool_call.get("name") == "read_file":
                    file_path = tool_call.get("args", {}).get("path")
                    if file_path: citations_set.add(file_path)

    return list(citations_set)

@app.post("/api/chat")
@limiter.limit("5/minute")
async def chat_endpoint(request: Request, payload: ChatRequest):

    langchain_messages = []
    for msg in payload.messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        else:
            langchain_messages.append(AIMessage(content=msg.content))

    num_input_messages = len(langchain_messages)
    inputs = {"messages": langchain_messages}
    result = codebase_agent.invoke(inputs)

    new_messages = result["messages"][num_input_messages:]
    final_message = result["messages"][-1]

    final_text = extract_response_text(final_message)
    citations = extract_citations(new_messages)

    return {
        "reply": final_text,
        "citations": citations
    }