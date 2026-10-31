import asyncio
import json
import sys
from pathlib import Path

from mcp import Client, StdioServerParameters
from mcp.types import TextContent


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def _tool_texts(result):
    texts = [item.text for item in result.content if isinstance(item, TextContent)]
    assert len(texts) == len(result.content)
    return texts


def test_mcp_stdio_initialization_discovery_and_tool_calls():
    async def exercise_server():
        params = StdioServerParameters(
            command=sys.executable,
            args=["-m", "gear_rental.mcp"],
            cwd=str(PROJECT_ROOT),
        )

        async with Client(params) as client:
            server_info = client.server_info
            assert server_info is not None
            assert server_info.name == "Silver Frame Rentals Equipment Inventory"

            tools = await client.list_tools()
            by_name = {tool.name: tool for tool in tools.tools}
            assert set(by_name) == {"list_equipment", "get_equipment"}
            assert "category" in by_name["list_equipment"].input_schema["properties"]
            assert "availability" in by_name["list_equipment"].input_schema["properties"]
            assert "item_id" in by_name["get_equipment"].input_schema["required"]

            all_items = await client.call_tool("list_equipment", {})
            assert not all_items.is_error
            assert [json.loads(text)["id"] for text in _tool_texts(all_items)] == [
                "CAM-204",
                "AUD-118",
                "LGT-052",
            ]

            camera_items = await client.call_tool(
                "list_equipment", {"category": "camera"}
            )
            assert [json.loads(text)["id"] for text in _tool_texts(camera_items)] == [
                "CAM-204"
            ]

            reserved_items = await client.call_tool(
                "list_equipment", {"availability": "reserved"}
            )
            assert [json.loads(text)["id"] for text in _tool_texts(reserved_items)] == [
                "AUD-118"
            ]

            combined_filter = await client.call_tool(
                "list_equipment",
                {"category": "camera", "availability": "available"},
            )
            assert [
                json.loads(text)["id"] for text in _tool_texts(combined_filter)
            ] == ["CAM-204"]

            no_matches = await client.call_tool(
                "list_equipment", {"category": "grip"}
            )
            assert not no_matches.is_error
            assert no_matches.content == []

            found = await client.call_tool("get_equipment", {"item_id": "CAM-204"})
            assert not found.is_error
            assert json.loads(_tool_texts(found)[0])["id"] == "CAM-204"

            missing = await client.call_tool(
                "get_equipment", {"item_id": "DOES-NOT-EXIST"}
            )
            assert missing.is_error
            assert "Equipment not found" in _tool_texts(missing)[0]

            malformed = await client.call_tool("get_equipment", {"item_id": 123})
            assert malformed.is_error
            assert "valid string" in _tool_texts(malformed)[0]

    asyncio.run(exercise_server())
