from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from routers.attraction import attraction_router
from routers.user import user_router
from routers.booking import booking_router
from routers.order import order_router
from routers.member import member_router


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


app.include_router(attraction_router)
app.include_router(user_router)
app.include_router(booking_router)
app.include_router(order_router)
app.include_router(member_router)


@app.get("/", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")


@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
    return FileResponse("./static/attraction.html", media_type="text/html")


@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
    return FileResponse("./static/booking.html", media_type="text/html")


@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
    return FileResponse("./static/thankyou.html", media_type="text/html")


@app.get("/member", include_in_schema=False)
async def member(request: Request):
    return FileResponse("./static/member.html", media_type="text/html")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
