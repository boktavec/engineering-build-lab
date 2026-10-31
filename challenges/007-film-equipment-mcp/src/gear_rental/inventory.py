import json
from importlib.resources import files


def _load_equipment():
    data = files("gear_rental").joinpath("data/equipment.json").read_text()
    return json.loads(data)


def list_equipment(category=None, availability=None):
    items = _load_equipment()
    return [
        item
        for item in items
        if (category is None or item["category"] == category)
        and (availability is None or item["availability"] == availability)
    ]


def get_equipment(item_id):
    return next((item for item in _load_equipment() if item["id"] == item_id), None)
