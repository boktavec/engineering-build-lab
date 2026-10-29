from app.state import BriefAgentState
from app.providers import TextProvider

def make_create_brief(provider: TextProvider):
    def create_brief(state: BriefAgentState) -> dict:
        prompt = f"""
        You are an incident agent at a small food manufacturer. Take the following info of a quality incident raised during production and provide a briefing of less than 500 characters in natural language from the data bellow. Only use the information provided to give accurate briefing. NEVER invent info!

        category: {state["category"]}
        reported_at: {state["reported_at"]}
        description: {state["description"]}
        status: {state["status"]}
        """

        brief = provider.generate(prompt)

        if (len(brief) == 0 or len(brief) > 500):
            return {"err": "Brief is either empty or too many characters. Please try again."}

        return {"brief": brief}
    return create_brief
