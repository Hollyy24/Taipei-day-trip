from fastapi import *
from fastapi.responses import FileResponse,JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from  dotenv import load_dotenv
from mysql.connector import pooling
import mysql.connector
import os
import json
import uvicorn
import jwt
from datetime import datetime, timedelta, timezone

load_dotenv()

class UnicornException(Exception):
    def __init__(self, name:str):
        self.name = name


app=FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")




dbconfig = {
    "host" : "localhost",
    "user" : os.getenv("DATA_USER"),
    "password":os.getenv("MY_PASSWORD"),
    "database": "travelSpots"
}

cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                pool_size = 5,
                                                **dbconfig)


# Static Pages (Never Modify Code in this Block)
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




def get_length(cnx,keyword):
    cursor = cnx.cursor()
    if keyword :
        sql= "SELECT COUNT(*) FROM spots WHERE mrt = %s OR name LIKE %s"
        cursor.execute(sql,(keyword,f"%{keyword}%",))
    else:
        sql= "SELECT COUNT(*) FROM spots"
        cursor.execute(sql)
    length = cursor.fetchone()[0]
    total_page = length // 12 
    if length % 12 > 0 :
        total_page += 1 
    cursor.close()
    return  (length,total_page)


def get_data_by_page(cnx,page,keyword):
    cursor = cnx.cursor(dictionary=True)
    
    length,total_page = get_length(cnx,keyword)    
    start = page * 12
    if start > length :
        return (None,None)
    elif start <= length:  
        if keyword:
            sql = """
            SELECT id,name,category,description,address,transport,mrt,lat,lng,images FROM spots
            WHERE mrt = %s OR name LIKE %s
            ORDER BY id 
            LIMIT 12 OFFSET %s """
            cursor.execute(sql,(keyword,f"%{keyword}%",start,))
        else:
            sql = """
            SELECT id,name,category,description,address,transport,mrt,lat,lng,images FROM spots
            ORDER BY id
            LIMIT 12 OFFSET %s"""
            cursor.execute(sql,(start,))
        data = cursor.fetchall()
    if start+12 < length:
        next_page = page+1
    else:
        next_page = None
        
    cursor.close()            
    return (next_page,data)


def get_data_by_id(cnx,id):
    cursor = cnx.cursor(dictionary=True)
    
    sql = """
        SELECT id,name,category,description,address,transport,mrt,lat,lng,images FROM spots
        WHERE id = %s 
    """
    cursor.execute(sql,(id,))
    result = cursor.fetchone()
    cursor.close()
    if result:
        return result
    else:
        return None


def get_all_mrts(cnx):
    cursor = cnx.cursor()
    
    sql = """
        SELECT mrt FROM(
        SELECT mrt, COUNT(*) AS count FROM spots
        GROUP BY mrt
        )AS data
        WHERE mrt IS NOT NULL
        ORDER BY count DESC
    """

    cursor.execute(sql)
    mrts = cursor.fetchall()
    cursor.close()
    
    return mrts



headers = {"Content-Type": "application/json; charset=utf-8"}
@app.get("/api/attractions")
async def attractions(request: Request,page:int,keyword:str| None = None):
    cnx = cnxpool.get_connection()
    try:
        next_page, data = get_data_by_page(cnx,page,keyword)
        for spot in data:
            spot["images"] = json.loads(spot["images"])
        result = {
            "nextPage":next_page,
            "data": data
            }
        return JSONResponse(content=result,headers=headers)
    except :
        return JSONResponse(
                status_code=500,
                content={"error": True,"message": "伺服器內部錯誤"},
                headers = headers
                )
    finally:
        cnx.close()


@app.get("/api/attraction/{attraction_ID}")
async def attraction(request: Request,attraction_ID: int):
    cnx = cnxpool.get_connection()
    try:
        data = get_data_by_id(cnx,attraction_ID)
        if data is None:
            return JSONResponse(status_code=400,
                    content={
                        "error": True,
                        "message": "景點編號不正確"
                    },
                    headers = headers
                )
        data["images"] = json.loads(data["images"])
        result = {
            "data":data
            }
        return JSONResponse(content=result,headers=headers)
    except:
        return JSONResponse(
                    status_code=500,
                    content={"error": True,"message": "伺服器內部錯誤"},
                    headers = headers
                )
    finally:
        cnx.close()


@app.get("/api/mrts")
async def get_mrts(request: Request):
    cnx = cnxpool.get_connection()
    try:
        mrts = get_all_mrts(cnx)
        data = [mrt[0] for mrt in mrts]
        return JSONResponse(
            content={"data":data},
            headers= headers
        )
    except :
        return JSONResponse(
                status_code=500,
                content={"error": True,"message": "伺服器內部錯誤"},
                headers = headers
                )
    finally:
        cnx.close()
    
JWT_SECRET = os.getenv("MY_SECRET_KEY")


class User(BaseModel):
    name: str
    email: str
    password: str

class SigninForm(BaseModel):
    email: str
    password: str



def signJWT(user):
    payload = {
        "id" : user["id"],
        "name" : user["name"],
        "email":user["email"],
        "exp" : (datetime.now(tz=timezone.utc) + timedelta(hours=24*7)).timestamp()
    }
    token = jwt.encode(payload,JWT_SECRET,"HS256")
    print(token)
    return token


@app.post("/api/user")
async def sign_up(user:User):
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor()
    try:
        sql = "INSERT INTO members(name, email, password)  VALUES (%s,%s,%s)"
        cursor.execute(sql,(user.name,user.email,user.password,))
        cnx.commit()
        result =  cursor.rowcount
        if result > 0  :
            return JSONResponse(content={"ok":True})

    except mysql.connector.IntegrityError:
        return JSONResponse(
            status_code=400,
            content={"error": True,
            "message": "註冊失敗，Email 已被使用"})

    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"error":True,"message":"伺服器內部錯誤"})
    finally:
        cnx.close()


@app.get("/api/user/auth")
async def get_user(authorization: str = Header(None)):
    token = authorization.split("Bearer ")[1]
    data = jwt.decode(token,JWT_SECRET,algorithms="HS256")
    exp = data.get("exp")
    now = datetime.now(timezone.utc).timestamp()
    if exp and exp < now:
        return JSONResponse(content={"data":"null"})
    elif exp and exp > now:
        result ={
            "id":data["id"],
            "name" : data["name"],
            "email" : data["email"]
        }
        print(result)
        return JSONResponse(status_code=200,content={"data":result})
        

@app.put("/api/user/auth")
async def sign_in(user:SigninForm):
    print("sign-in")
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        sql = "SELECT * FROM members WHERE email=%s AND password = %s"
        cursor.execute(sql,(user.email,user.password,))
        result = cursor.fetchone()
        if result:
            token = signJWT(result)
            return JSONResponse(status_code=200,content={"token":token})
        else:
            return JSONResponse(status_code=400,content={"error":True,"message":"登入失敗，帳號或密碼錯誤或其他原因"})
    except Exception as e:
        print(e)
        return JSONResponse(status_code=500,content={"error":True,"message":"伺服器內部錯誤"})
    finally:
        cnx.close()


class BookingData(BaseModel):
        attractionId: str
        date: str
        time: str
        price:str
        

@app.get("/api/booking")
async def get_booking(authorization: str = Header(None)):
    print("here is get booking")
    token = authorization.split("Bearer ")[1]
    user = jwt.decode(token,JWT_SECRET,algorithms="HS256")
    exp = user.get("exp")
    now = datetime.now(timezone.utc).timestamp()
    
    if exp and exp < now:
        return JSONResponse(
            status_code=403,
            content={"error":True,"message":"未登入系統，拒絕存取"})
    user_id = user.get("id")
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        sql = "SELECT attraction_id,name,image,date,time,address,price FROM booking WHERE user_id = %s"
        cursor.execute(sql,(user_id,))
        result = cursor.fetchone()
        if result is None:
            data = None
        else:
            data={
            "attraction": {
                "id": result["attraction_id"],
                "name": result["name"],
                "address": result["address"],
                "image": result["image"],
                },
            "date": result["date"],
            "time": result["time"],
            "price": result["price"]
            }
        return JSONResponse(status_code=200,content={"data":data})
    except Exception as e:
        print(e)
    finally:
        cnx.close()


@app.post("/api/booking")
async def add_booking(bookingdata:BookingData,authorization: str = Header(None)):
    print("here is add_booking")
    token = authorization.split("Bearer ")[1]
    user = jwt.decode(token,JWT_SECRET,algorithms="HS256")
    exp = user.get("exp")
    now = datetime.now(timezone.utc).timestamp()
    
    if exp and exp < now:
        return JSONResponse(
            status_code=403,
            content={"error":True,"message":"未登入系統，拒絕存取"})
    user_id = user.get("id")
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        find_sql = "SELECT * FROM booking WHERE user_id = %s"
        cursor.execute(find_sql,(user_id,))
        allready_booking = cursor.fetchone()
        if allready_booking:
            print("delet allready")
            cursor.execute("DELETE FROM  booking WHERE user_id = %s",(user_id,))
            cnx.commit()
            
        search_sql  = "SELECT name,address,images FROM spots WHERE id = %s"
        cursor.execute(search_sql,(bookingdata.attractionId,))
        result = cursor.fetchone()
        images_url = json.loads(result["images"])
        insert_sql = "INSERT INTO booking (attraction_id,date,time,price,name,address,image,user_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)"
        cursor.execute(insert_sql, (bookingdata.attractionId,bookingdata.date,bookingdata.time,bookingdata.price,result["name"],result["address"],images_url[0],user_id,)) 
        cnx.commit()
        return JSONResponse(status_code=200,content={"ok":True})
    except mysql.connector.IntegrityError:
        return JSONResponse(
            status_code=400,
            content={"error":True,"message":"建立失敗，輸入不正確或其他原因"}
        )
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"error":True,"message":"伺服器內部錯誤"}
        )
    finally:
        cnx.close()

@app.delete("/api/booking")
async def delete_booking(authorization: str = Header(None)):
    token = authorization.split("Bearer ")[1]
    user = jwt.decode(token,JWT_SECRET,algorithms="HS256")
    exp = user.get("exp")
    now = datetime.now(timezone.utc).timestamp()
    if exp and exp < now:
        return JSONResponse(
            status_code=403,
            content={"error":True,"message":"未登入系統，拒絕存取"})
    user_id = user.get("id")
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor()
    try:
        sql = "DELETE FROM  booking WHERE user_id = %s"
        cursor.execute(sql,(user_id,))
        cnx.commit()
        return JSONResponse(status_code=200,content={"ok":True})
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"error":True,"message":"伺服器內部錯誤"}
        )
    finally:
        cnx.close()
        
if __name__ == "__main__":
	uvicorn.run(app,host="0.0.0.0",port=8000)