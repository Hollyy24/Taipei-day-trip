from fastapi import *
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from modle.member import Member
import json

from modle.order import Order
from modle.booking import Booking
member_router = APIRouter()


@member_router.get("/api/member")
async def get_order_data(authorization: str = Header(None)):
    print("here is get users")
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": "未登入系統，拒絕存取"})
    user_id = user_data.get("id")
    data = Order.get_order(user_id)
    if data == False:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "伺服器內部錯誤"})
    else:
        return JSONResponse(
            status_code=200,
            content={"true": "ok", "data": data}
        )


@member_router.post("/api/uploads")
async def upload_image(photo: UploadFile = File(...), authorization: str = Header(None)):
    print("here is uploads")
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    user_id = user_data.get("id")
    path = Member.save_picture(photo)
    if path == False:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    result = Member.save_picture_database(path, user_id)
    print(f"result:{result}")
    if result == False:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    return JSONResponse(content={"ok": "true", "path": result})


@member_router.get("/api/uploads")
async def get_user_picture(authorization: str = Header(None)):
    print("here get user_url")
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    user_id = user_data.get("id")
    result = Member.get_picture_url(user_id)
    print(result)
    if result:
        return JSONResponse(status_code=200, content={"ok": True, "data": result})
    return JSONResponse(status_code=500, content={"error": True})
