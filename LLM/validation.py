import json
import os
import re
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace

HF_TOKEN = os.getenv("HF_TOKEN")
base_llm = HuggingFaceEndpoint(
    repo_id="openai/gpt-oss-120b",
    huggingfacehub_api_token=HF_TOKEN,
    temperature=0.1,
    max_new_tokens=500
)

llm = ChatHuggingFace(
    llm=base_llm
)