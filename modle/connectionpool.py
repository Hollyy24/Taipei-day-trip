import mysql.connector
from mysql.connector import pooling
import os 
from dotenv import load_dotenv

load_dotenv()
dbconfig = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DATA_USER"),
    "password":os.getenv("MY_PASSWORD"),
    "database":"travelSpots"
}



cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                      pool_size=10,
                                                      **dbconfig)