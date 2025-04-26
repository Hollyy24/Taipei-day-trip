import mysql.connector
from mysql.connector import pooling
from datetime import datetime, timedelta, timezone
from modle.connectionpool import cnxpool

import os 
import shutil
import jwt
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("MY_SECRET_KEY")
UPLOAD_DIR = "uploads/memberpicture"


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

    
    def revise_userdata(user,user_id):
        print("here is revise userdata")
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor(buffered=True)
        try:
            sql = "UPDATE members SET name = %s,email = %s WHERE id = %s"
            cursor.execute(sql,(user.name,user.email,user_id,))
            cnx.commit()
            return True
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()
            
    def get_userdata(user_id):
        print("here is get userdata")
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor(buffered=True)
        try:
            sql = "SELECT name,email FROM members WHERE id = %s"
            cursor.execute(sql,(user_id,))
            result = cursor.fetchone()
            return result
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()
            
            
    def save_picture(photo):
        if not os.path.exists(UPLOAD_DIR):
                os.makedirs(UPLOAD_DIR)

        file_location = os.path.join(UPLOAD_DIR, photo.filename)
        try:
            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(photo.file, buffer)
                db_path = f"/{file_location}"  
                
            return db_path
        except Exception as e:
            print(e)
            return False
        

    def save_picture_database(path, user_id):
        print("save database")
        exist = Member.check_picture_status(user_id)  
        print(f"exist:{exist}")
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        try:
            
            if not exist:
                print("picture is not exist")
                sql = "INSERT INTO userPicture (user,url) VALUES (%s,%s)"
                cursor.execute(sql, (user_id, path))
            else:
                print("picture exist")
                sql = "UPDATE userPicture SET url = %s WHERE user= %s"
                cursor.execute(sql, (path, user_id))
            cnx.commit()
            if cnx:
                cnx.rollback()
            return path
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()

    def check_picture_status(user_id):  
        print("check_picture_status")
        try:
            cnx = cnxpool.get_connection()
            cursor = cnx.cursor()
            sql = "SELECT * FROM userPicture WHERE user = %s"
            cursor.execute(sql, (user_id,))
            result = cursor.fetchone()  
            print(bool(result))
            return bool(result)
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()
            
    def get_picture_url(user_id):
        print("get_picture_url")
        try:
            cnx = cnxpool.get_connection()
            cursor = cnx.cursor()
            sql = "SELECT * FROM userPicture WHERE user = %s"
            cursor.execute(sql, (user_id,))
            result = cursor.fetchone()  
            return result
        except Exception as e:
            print(e)
            return False
        finally:
            cnx.close()
    