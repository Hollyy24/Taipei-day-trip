import mysql.connector
from mysql.connector import pooling
import os 
import json

from dotenv import load_dotenv

load_dotenv()

dbconfig = {
    "host" : "localhost",
    "user" : os.getenv("DATA_USER"),
    "password":os.getenv("MY_PASSWORD"),
    "database": "travelSpots"
}

cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                pool_size = 5,
                                                **dbconfig)


class Booking:
    
    def get_booking_data(user_id):
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
            return data
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()
            
    
    def add_booking_data(user_id,bookingdata):
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
            return "200"
        except  mysql.connector.IntegrityError:
            return "400"
        except Exception as e:
            print(e)
            return "500"
        finally:
            cnx.close()
        
        
    def delete_booking_data(user_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        try:
            sql = "DELETE FROM  booking WHERE user_id = %s"
            cursor.execute(sql,(user_id,))
            cnx.commit()
            return True
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()
    