import mysql.connector
from mysql.connector import pooling
from datetime import datetime, timedelta, timezone
import os 
import jwt

dbconfig = {
    "host": "localhost",
    "user": os.getenv("DATA_USER"),
    "password":os.getenv("MY_PASSWORD"),
    "database":"travelSpots"
}



cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool",
                                                      pool_size=5,
                                                      **dbconfig)

JWT_SECRET = os.getenv("MY_SECRET_KEY")

class Member:
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


    def check_user_status(token):
        data = jwt.decode(token,JWT_SECRET,algorithms="HS256")
        exp = data.get("exp")
        now = datetime.now(timezone.utc).timestamp()
        if exp and exp < now:
            return None
        elif exp and exp > now:
            result ={
                "id":data["id"],
                "name" : data["name"],
                "email" : data["email"]
            }
            return result
        
        
        
    def add_user_data(user):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        try:
            sql = "INSERT INTO members(name, email, password)  VALUES (%s,%s,%s)"
            cursor.execute(sql,(user.name,user.email,user.password,))
            cnx.commit()
            result =  cursor.rowcount
            if result > 0  :
                return "200"

        except mysql.connector.IntegrityError:
            return "400"

        except Exception as e:
            print(e)
            return "500"
        finally:
            cnx.close()
            
        
        
    def user_signin(user):    
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor(dictionary=True)
        try:
            sql = "SELECT * FROM members WHERE email=%s AND password = %s"
            cursor.execute(sql,(user.email,user.password,))
            result = cursor.fetchone()
            if result:
                token = Member.signJWT(result)
                return token
            else:
                return "400"
        except Exception as e:
            print(e)
            return "500"
        finally:
            cnx.close()

    
    