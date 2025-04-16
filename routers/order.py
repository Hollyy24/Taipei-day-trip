from fastapi import *
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from modle.member import Member
import json

from modle.order import Order
from modle.booking import Booking
order_router = APIRouter()



class OrderData(BaseModel):
    prime: str
    order: dict
    

@order_router.post("/api/users")
async def request_to_tappay(orderdata:OrderData,authorization: str = Header(None)):
    print("here is get users")
    token = authorization.split("Bearer ")[1]
    user_data  = Member.check_user_status(token)
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={"error":True,"message":"未登入系統，拒絕存取"})
    user_id = user_data.get("id")
    pay_result  = Order.send_to_tappay(orderdata)
    if pay_result == 400:    
        return JSONResponse(
            status_code=400,
            content={"error":True,"message":"訂單建立失敗，輸入不正確或其他原因"})
    elif pay_result == 500:    
        return JSONResponse(
            status_code=500,
            content={"error":True,"message":"伺服器內部錯誤"})
    else:
        Booking.delete_booking_data(user_id)
        return JSONResponse(
                status_code=200,
                content={"data":pay_result})



@order_router.get("/api/users/{order_number}")
async def get_orderdata(order_number,authorization: str = Header(None)):
    print("here is get orderdata")
    token = authorization.split("Bearer ")[1]
    user_data  = Member.check_user_status(token)
    if user_data is None:
        return JSONResponse(
            status_code=403,
            content={"error":True,"message":"未登入系統，拒絕存取"})
    order_data = Order.search_order(order_number)
    return JSONResponse(
            status_code=200,
            content={"data":order_data})
