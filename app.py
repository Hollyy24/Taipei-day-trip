from fastapi import *
from fastapi.responses import FileResponse,JSONResponse
from  dotenv import load_dotenv
from mysql.connector import pooling
import mysql.connector
import os
import math
import uvicorn

class UnicornException(Exception):
    def __init__(self, name:str):
        self.name = name



app=FastAPI()


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
    print(start)
    if start+12 < length:
        print(start+12)
        next_page = page+1
    else:
        next_page = None
        
    print(f"length:{length},page:{page},next_page:{next_page},total_page{total_page}")
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
    print(result)
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
        result = {
            "next_page":next_page,
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
        
if __name__ == "__main__":
	uvicorn.run(app,host="0.0.0.0",port=8000)