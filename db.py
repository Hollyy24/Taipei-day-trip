import mysql.connector
from mysql.connector import pooling
import json
from json import load
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

mydb = mysql.connector.connect(
    host = "localhost",
    user = os.getenv("DATA_USER"),
    password = os.getenv("MY_PASSWORD"),
    database= "travelSpots",
)  




def insert_spot_data(mydb,spot_list):
    sql ="""INSERT INTO spots(id,name,category,description,address,transport,mrt,lat,lng,images) 
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
    for spot in spot_list:
        cursor = mydb.cursor()
        cursor.execute(sql, spot)
        mydb.commit()
    cursor.close()


def filter_imges(images_string):
    images_URL = []
    temp_images_URL = images_string.split("http")[1:]
    for URL in temp_images_URL:
        full_URL =  "http" + URL.strip()
        if full_URL.lower().endswith((".jpg",".png")):
            images_URL.append(full_URL)
    URL_string = json.dumps(images_URL)
    print(URL_string)
    return URL_string


def transform_spot_data(spot_data):
    all_spots = []
    for spot in spot_data:
        id = spot["_id"]
        name = spot["name"]
        category = spot["CAT"]
        description = spot["description"]    
        address = spot["address"]
        transport= spot["direction"]
        mrt = spot["MRT"]
        lat = spot["latitude"]
        lng = spot["longitude"]
        images =filter_imges(spot["file"])
        result_data = (id,name,category,description,address,transport,mrt,lat,lng,images)
        all_spots.append(result_data)
    insert_spot_data(mydb,all_spots)


with open('data/taipei-attractions.json','r',encoding="utf-8") as file:
    data = json.load(file)["result"]
    spot_data = data["results"]
    transform_spot_data(spot_data)
    