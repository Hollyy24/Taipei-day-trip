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




def get_spots_data(cnx):
    sql = """SELECT spot_id,name,category,description,address,transport,mrt,lat,lng,Images 
        FROM spots 
        ORDER BY spot_id"""
    cursor = cnx.cursor()
    cursor.execute(sql)
    attractions = cursor.fetchall()
    print(attractions)
    return	attractions


def images_to_array(string):
    images_array = []
    if string :
        temp_array =  string.split("http")[1:]
        for url in temp_array:
            url = ("http"+ url)
            images_array.append(url)
    return images_array


def transform_to_dataformat(attractions_data):
    attractions_list = []
    for attraction in attractions_data:
        temp = {
        "id" : attraction[0],
		"name": attraction[1],
		"category": attraction[2],
		"description": attraction[3],
		"address": attraction[4],
		"transport": attraction[5],
		"mrt": attraction[6],
		"lat": attraction[7],
		"lng": attraction[8],
        "images": images_to_array(attraction[9])
		}
        attractions_list.append(temp)
    return attractions_list


def final_data(attractions_data):
    count = 1
    pages = math.ceil(len(attractions_data)/12)
    now_page = 0
    spots_data = {}
    spots_data[now_page] = { "nextPage": now_page+1 , "data":[] }
    for index,attraction in enumerate(attractions_data,start=1):
        if index %12 ==1 and index != 1:
            now_page += 1
            spots_data[now_page] = {"nextPage": now_page + 1 if now_page + 1 <= pages else None, "data": []}
        spots_data[now_page]["data"].append(attraction)
    return spots_data



headers = {"Content-Type": "application/json; charset=utf-8"}

@app.exception_handler(HTTPException)
async def different_http_exception_handler(request, exc: HTTPException):
    if exc.status_code == 400:
        return JSONResponse(
            status_code= exc.status_code,
            content={
                "error": True,
                "message": exc.detail
            },
            headers = headers
        )
    elif exc.status_code == 500:
        return JSONResponse(
            status_code= exc.status_code,
            content={
                "error": True,
                "message": exc.detail
            },
            headers = headers
        )


@app.get("/api/attractions")
async def attraction(request: Request,page:int,keyword:str| None = None):
    cnx = cnxpool.get_connection()
    spots_data = get_spots_data(cnx)
    spot_format = transform_to_dataformat(spots_data)
    full_data = final_data(spot_format)
    cnx.close()
    try:
        if keyword != None:
            with_keyword = [spot for spot in spot_format if keyword in spot["name"] ]
            without_keyword = [spot for spot in spot_format if keyword not in spot["name"] ]
            filter_keyword = with_keyword + without_keyword
            print(len(filter_keyword))
            full_data = final_data(filter_keyword)
        result = full_data[page]
        return JSONResponse(content=result,headers=headers)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="伺服器內部錯誤")


@app.get("/api/attraction/{attraction_ID}")
async def attraction(request: Request,attraction_ID: int):
    cnx = cnxpool.get_connection()
    spots_data = get_spots_data(cnx)
    spot_format = transform_to_dataformat(spots_data)
    cnx.close()
    try:
        for item  in spot_format:
            print(item)
            print(type(item["id"]))
            if item["id"] == attraction_ID:
                return JSONResponse(content=item,headers=headers)
        raise HTTPException(status_code=400, detail="景點編號不正確")
    except HTTPException as e:
        raise e
    except  Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="伺服器內部錯誤")



@app.get("/api/mrts")
async def attraction(request: Request):
    try:
        cnx = cnxpool.get_connection()
        sql  = "SELECT name,mrt from spots"
        cursor = cnx.cursor()
        cursor.execute(sql)
        raw_mrts = cursor.fetchall() 
        cnx.close()
        mrts = {}
        for mrt in raw_mrts:
            if mrt[1] not in mrts:
                mrts[mrt[1]] = 1
            else:
                mrts[mrt[1]] += 1
        temp = [(key,item) for key,item in mrts.items()]
        sort_data = sorted(temp, key=lambda x:x[1], reverse=True)
        result = [mrt[0] for mrt in sort_data if mrt[0] is not None ]
        return JSONResponse(content={"data":result},headers=headers)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="伺服器內部錯誤")
    
if __name__ == "__main__":
	uvicorn.run(app,host="0.0.0.0",port=8000)