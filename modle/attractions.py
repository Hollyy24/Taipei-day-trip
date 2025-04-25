import mysql.connector
from mysql.connector import pooling
import os 
import json
from dotenv import load_dotenv
from modle.connectionpool import cnxpool
load_dotenv()


class Attraction:

    def get_length(keyword):
        cnx = cnxpool.get_connection()
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
        cnx.close()
        return  (length,total_page)


    def get_data_by_page(page,keyword):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor(dictionary=True)
        length,total_page = Attraction.get_length(keyword)
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
            
        cnx.close()          
        return (next_page,data)


    def get_data_by_id(id):
        print("get_data_by_id")
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor(dictionary=True)
        
        sql = """
            SELECT id,name,category,description,address,transport,mrt,lat,lng,images FROM spots
            WHERE id = %s 
        """
        cursor.execute(sql,(id,))
        result = cursor.fetchone()
        cnx.close()
        if result:
            return result
        else:
            return None


    def get_all_mrts():
        cnx = cnxpool.get_connection()
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
        cnx.close()
        return mrts


    def get_all_attractions(page,keyword):
        cnx = cnxpool.get_connection()
        try:
            next_page, data =Attraction.get_data_by_page(page,keyword)
            for spot in data:
                spot["images"] = json.loads(spot["images"])
            result = {
                "nextPage":next_page,
                "data": data
                }
            return result
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()


    def get_attraction_by_id(attraction_ID):
        cnx = cnxpool.get_connection()
        try:
            print("herer is get attraction! ")
            print(attraction_ID)
            data = Attraction.get_data_by_id(attraction_ID)
            print(data)
            if data is None:
                result = "400"
                return result
            data["images"] = json.loads(data["images"])
            result = {
                "data":data
                }
            return result
        except Exception as e:
            print(e)
            return "500"
        finally:
            cnx.close()
            
            
    
    def get_attraction_by_mrt():
        cnx = cnxpool.get_connection()
        try:
            mrts = Attraction.get_all_mrts()
            data = [mrt[0] for mrt in mrts]
            return data
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()