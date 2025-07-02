import mysql.connector
from mysql.connector import pooling
from mysql.connector import errorcode
import json
from json import load
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


def insert_spot_data(mydb, spot_list):
    sql = """INSERT INTO spots(id,name,category,description,address,transport,mrt,lat,lng,images) 
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
    for spot in spot_list:
        cursor = mydb.cursor()
        cursor.execute(sql, spot)
        mydb.commit()
    cursor.close()


def filter_imges(images_string):
    images_url = []
    temp_images_URL = images_string.split("http")[1:]
    for url in temp_images_URL:
        full_url = "http" + url.strip()
        if full_url.lower().endswith((".jpg", ".png")):
            images_url.append(full_url)
    URL_string = json.dumps(images_url)
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
        transport = spot["direction"]
        mrt = spot["MRT"]
        lat = spot["latitude"]
        lng = spot["longitude"]
        images = filter_imges(spot["file"])
        result_data = (id, name, category, description, address,
                       transport, mrt, lat, lng, images)
        all_spots.append(result_data)
    insert_spot_data(mydb, all_spots)


with open('data/taipei-attractions.json', 'r', encoding="utf-8") as file:
    db_config = {
        'host': 'localhost',
        'user': os.getenv("DATA_USER"),
        'password': os.getenv("MY_PASSWORD"),
        'database': "travelSpots",
    }

    mydb = mysql.connector.connect(**db_config)

    data = json.load(file)["result"]
    spot_data = data["results"]
    transform_spot_data(spot_data)
