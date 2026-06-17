from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from agents.graph_agent import codebase_agent
from typing import List, Literal

app = FastAPI()

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

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):

    langchain_messages = []
    for msg in request.messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        else:
            langchain_messages.append(AIMessage(content=msg.content))

    inputs = {"messages": langchain_messages}
    result = codebase_agent.invoke(inputs)
    ai_message = result["messages"][-1]
    raw_content = ai_message.content

    if isinstance(raw_content, str):
        final_text = raw_content
    elif isinstance(raw_content, list):
        final_text = "\n".join(
            block["text"] for block in raw_content if isinstance(block, dict) and "text" in block
        )
    elif isinstance(raw_content, dict) and "text" in raw_content:
        final_text = raw_content["text"]
    else: 
        final_text = str(raw_content)

    return {
        "reply": final_text,
        "citations": ["src/auth/mock.py"] # need to replace later
    }