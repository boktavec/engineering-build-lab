from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

from gear_rental.inventory import list_equipment as _list_equipment, get_equipment as _get_equipment
mcp = MCPServer("Silver Frame Rentals Equipment Inventory")


@mcp.tool()
def list_equipment(category: str | None = None, availability: str | None = None):
    '''Retrieve list of equipment. Can receive a filtered list
    by providing a category and/or availability or give no f
    ilter and return the whole list.'''

    equipment_list = _list_equipment(category, availability)

    return equipment_list




@mcp.tool()
def get_equipment(item_id: str):
    '''Retrieve details for a specific piece of equipment by providing its item id'''

    equipment_details = _get_equipment(item_id)

    if equipment_details == None:
        raise ToolError("Equipment not found")
    return equipment_details


if __name__  == "__main__":
    mcp.run()
