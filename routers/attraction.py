from fastapi import *
from fastapi.responses import JSONResponse
from modle.attractions import Attraction




attraction_router = APIRouter()


headers = {"Content-Type": "application/json; charset=utf-8"}


@attraction_router.get("/api/attractions")
async def all_attractions(request: Request,page:int,keyword:str| None = None):
    attractions_data = Attraction.get_all_attractions(page,keyword)
    if attractions_data :
        return JSONResponse(content=attractions_data,headers=headers)
    elif attractions_data is False:
        return JSONResponse(
                status_code=500,
                content={"error": True,"message": "伺服器內部錯誤"},
                headers = headers
                )


@attraction_router.get("/api/attraction/{attraction_ID}")
async def attraction_by_id(request: Request,attraction_ID: int):
    attraction_data = Attraction.get_attraction_by_id(attraction_ID)
    if attraction_data == "400":
        return JSONResponse(status_code=400,
                content={
                    "error": True,
                    "message": "景點編號不正確"
                },
                headers = headers
            )
    elif attraction_data == "500":
        return JSONResponse(
            status_code=500,
            content={"error": True,"message": "伺服器內部錯誤"},
            headers = headers
        )
    else: 
        return JSONResponse(content=attraction_data,headers=headers)


@attraction_router.get("/api/mrts")
async def get_mrts(request: Request):
    mrt_result =  Attraction.get_attraction_by_mrt()
    if mrt_result == "500":
        return JSONResponse(
                status_code=500,
                content={"error": True,"message": "伺服器內部錯誤"},
                headers = headers
                )
    else:
        return JSONResponse(
            content={"data":mrt_result},
            headers= headers
        )

