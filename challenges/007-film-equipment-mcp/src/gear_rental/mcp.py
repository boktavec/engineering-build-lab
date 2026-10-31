from mcp.server import MCPServer
import requests

mcp = MCPServer("Silver Frame Rentals Equipment Inventory")


@mcp.tool()
async def list_equipment(category: str | None = None, availability: str | None = None):
    '''Retrieve list of equipment'''
# list_equipment supports category and/or availability filters.
# Omitting filters returns all items; valid filters with no matches return an empty result.



@mcp.tool()
async def get_equipment(item_id: str):
    '''Retrieve details for a specific piece of equipment'''
# get_equipment returns the matching item's details;
# an unknown ID produces a clear not-found result without crashing the server.
