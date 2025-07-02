from fastapi import *
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from modle.member import Member
from modle.booking import Booking


booking_router = APIRouter()


class BookingData(BaseModel):
    attractionId: str
    date: str
    time: str
    price: str


@booking_router.get("/api/booking")
async def get_booking(authorization: str = Header(None)):
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": "未登入系統，拒絕存取"})
    user_id = user_data.get("id")
    booking_data = Booking.get_booking_data(user_id)
    if booking_data is False:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "伺服器內部錯誤"})
    else:
        return JSONResponse(status_code=200, content={"data": booking_data})


@booking_router.post("/api/booking")
async def add_booking(bookingdata: BookingData, authorization: str = Header(None)):
    print("here is add_booking")
    token = authorization.split("Bearer ")[1]
    print("token", token)
    user_data = Member.check_user_status(token)
    print("user_data", user_data)
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": "未登入系統，拒絕存取"})
    user_id = user_data.get("id")
    result = Booking.add_booking_data(user_id, bookingdata)
    if result == "200":
        return JSONResponse(status_code=200, content={"ok": True})
    elif result == "400":
        return JSONResponse(
            status_code=400,
            content={"error": True, "message": "建立失敗，輸入不正確或其他原因"}
        )
    elif result == "500":
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "伺服器內部錯誤"}
        )


@booking_router.delete("/api/booking")
async def delete_booking(authorization: str = Header(None)):
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": "未登入系統，拒絕存取"})
    user_id = user_data.get("id")
    result = Booking.delete_booking_data(user_id)
    if result is True:
        return JSONResponse(status_code=200, content={"ok": True})
    elif result is False:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "伺服器內部錯誤"}
        )
