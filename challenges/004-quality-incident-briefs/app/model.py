import os
from langchain_openai import ChatOpenAI
from pathlib import Path
from dotenv import load_dotenv
from app.state import BriefResponse

load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")

class BriefModel:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=os.getenv("LLM_MODEL"), # type: ignore
            temperature=0,
            timeout=None,
            max_retries=3,
            base_url="http://127.0.0.1:8000/v1",
            api_key=os.getenv("OPENAI_API_KEY") # type: ignore
        )

    def generate(self, input_text: str) -> str:
        structured_llm = self.llm.with_structured_output(BriefResponse)
        response = structured_llm.invoke(input_text)

        return response["brief"]
