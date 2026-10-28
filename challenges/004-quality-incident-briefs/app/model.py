import os
from langchain_openai import ChatOpenAI
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")

# model = ChatOpenAI(
#     model=os.getenv("LLM_MODEL"), # type: ignore
#     temperature=0,
#     timeout=None,
#     max_retries=3,
#     base_url="http://127.0.0.1:8000/v1",
#     api_key=os.getenv("OPENAI_API_KEY") # type: ignore
# )



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

    def get_llm(self):
        return self.llm





# message = [
#     (
#         "system",
#         "You are a comedian - you tell computer jokes when asked.",
#     ),
#     ("human", "Tell me a joke"),
# ]


# response = model.invoke(message)
# print(response)
