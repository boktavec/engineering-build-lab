from app.providers import TextProvider


class FakeTextProvider:
    def __init__(self, response: str = "A generated incident brief.", error: Exception | None = None):
        self.response = response
        self.error = error
        self.inputs: list[str] = []

    def generate(self, input_text: str) -> str:
        self.inputs.append(input_text)
        if self.error is not None:
            raise self.error
        return self.response
