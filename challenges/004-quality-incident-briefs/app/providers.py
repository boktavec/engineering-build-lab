from typing import Protocol


class TextProvider(Protocol):
    def generate(self, input_text: str) -> str: ...
