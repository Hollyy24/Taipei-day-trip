from fastapi import *
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from mysql.connector import pooling
import mysql.connector
from modle.attractions import Attraction
from modle.member import Member
import os

user_router = APIRouter()


class User(BaseModel):
    name: str
    email: str
    password: str


class ReviseData(BaseModel):
    name: str
    email: str


class SigninForm(BaseModel):
    email: str
    password: str


@user_router.post("/api/user")
async def sign_up(user: User):
    result = Member.add_user_data(user)
    if result == "200":
        return JSONResponse(status_code=200, content={"ok": True})

    elif result == "400":
        return JSONResponse(
            status_code=400,
            content={"error": True,
                     "message": "註冊失敗，Email 已被使用"})
    elif result == "500":
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "伺服器內部錯誤"})


@user_router.patch("/api/user")
async def revise_userdata(user: ReviseData, authorization: str = Header(None)):
    print("here is revise router")
    print(user)
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    result = Member.revise_userdata(user, user_data["id"])
    if result == False:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "伺服器內部錯誤"})
    return JSONResponse(status_code=200, content={"ok": True})


@user_router.get("/api/user")
async def get_userdata(authorization: str = Header(None)):
    print("here is get userdata")
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    result = Member.get_userdata(user_data["id"])
    if result == False:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "伺服器內部錯誤"})
    return JSONResponse(status_code=200, content={"ok": True, "data": result})


@user_router.get("/api/user/auth")
async def get_user(authorization: str = Header(None)):
    token = authorization.split("Bearer ")[1]
    user_data = Member.check_user_status(token)
    print(user_data)
    if user_data is False:
        return JSONResponse(status_code=401, content={"message": "expired"})
    elif user_data:
        return JSONResponse(status_code=200, content={"data": user_data})


@user_router.put("/api/user/auth")
async def sign_in(user: SigninForm):
    print("sign-in")
    signin_result = Member.user_signin(user)

    if signin_result == "400":
        return JSONResponse(status_code=400, content={"error": True, "message": "登入失敗，帳號或密碼錯誤或其他原因"})
    elif signin_result == "500":
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    else:
        return JSONResponse(status_code=200, content={"token": signin_result})
