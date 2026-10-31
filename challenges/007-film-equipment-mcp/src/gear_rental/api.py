from fastapi import FastAPI
from fastapi.responses import JSONResponse

from gear_rental.inventory import get_equipment, list_equipment

app = FastAPI(title="Film Equipment Inventory", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/equipment")
def equipment(category: str | None = None, availability: str | None = None):
    return list_equipment(category=category, availability=availability)


@app.get("/equipment/{item_id}")
def equipment_item(item_id: str):
    result = get_equipment(item_id)
    if result is None:
        return JSONResponse(status_code=404, content={"error": "Equipment not found"})
    return result
