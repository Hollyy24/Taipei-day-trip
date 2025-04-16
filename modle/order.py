import mysql.connector
from mysql.connector import pooling
import os 
import json
from dotenv import load_dotenv
import urllib.request
import  datetime

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

MY_PARTNER_KEY = os.getenv("MY_PARTNER_KEY")

class Order:
    
    def send_to_tappay(data):
        print("here is send to tappay")
        ordernumber = Order.create_orderdata(data)
        if ordernumber is False:
            return 400
        URL = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": MY_PARTNER_KEY}
        body = {
        "prime": data.prime,
        "partner_key": MY_PARTNER_KEY,
        "merchant_id": "tppf_holly_GP_POS_2",
        "details":"travel order",
        "amount": data.order["price"],
        "order_number":ordernumber,
        "cardholder": {
        "phone_number":data.order["contact"]["phone"],
        "name": data.order["contact"]["name"],
        "email": data.order["contact"]["email"],
        },
        "remember": "false"
        }

        json_data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(URL, data=json_data, headers=headers, method='POST')

        with urllib.request.urlopen(req) as response:
            response_data  = response.read()
            result =json.loads(response_data )
            if result['status'] == 0 :
                if Order.set_order_status(ordernumber) is False:
                    return 400
                data = {
                        "number":ordernumber,
                        "payment":{
                            "status":0,
                            "message":"付款成功"
                        }
                    }
                
                
                return data
            else:
                print(result['msg'])
                return 400
    
    
    def create_orderdata(data):
        print("create_orderdata")
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        try:
            number = Order.get_id_from_db()
            if number is False:
                return False
            time = datetime.datetime.today().strftime('%Y%m%d')
            order_number = time + str(number).zfill(6)
            insert_data = (
                order_number,
                data.order["trip"]["attraction"]["id"],
                data.order["trip"]['date'],
                data.order["trip"]['time'],
                data.order['price'],
                data.order["contact"]["name"],
                data.order["contact"]["email"],
                data.order["contact"]["phone"],
                False
            )
            
            sql = """INSERT INTO  orders(
                number,
                attraction_id,
                date,
                time,
                price,
                order_name,
                order_email,
                order_phone,
                paid
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""

            cursor.execute(sql, insert_data)
            cnx.commit()
            return order_number
        except Exception as e:
            print(f"EXCEPTION: {e}")
            return False
        finally:
            cnx.close()

    def get_id_from_db():
        print("get_id")
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        try:
            sql = "SELECT COUNT(*) FROM orders  WHERE number LIKE %s"
            time = f"{datetime.datetime.today().strftime('%Y%m%d')}%"
            cursor.execute(sql,(time,))
            number = cursor.fetchone()[0]
            number = str(number+1)
            return number
        except mysql.connector.Error as e:
            return 400
        except Exception as e:
            print(e)
            return 500
        finally:
            cnx.close()
    
    def search_order(order_number):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor(dictionary=True)
        try:
            sql = ("""SELECT orders.*,
                    spots.name AS attraction_name,
                    spots.address AS attraction_address,
                    spots.images AS attraction_images
                    FROM orders 
                    LEFT JOIN spots ON orders.attraction_id = spots.id 
                    WHERE number = %s  """)
            cursor.execute(sql,(order_number,))
            original_data = cursor.fetchone()
            data = {
                "number": original_data["number"],
                "price": original_data["price"],
                "trip": {
                "attraction": {
                    "id": original_data["attraction_id"],
                    "name": original_data["attraction_name"],
                    "address": original_data["attraction_address"],
                    "image": json.loads(original_data["attraction_images"])[0],
                },
                "date": original_data["paid"],
                "time": original_data["paid"],
                },
                "contact": {
                "name": original_data["order_name"],
                "email": original_data["order_email"],
                "phone": original_data["order_phone"]
                },
                "status": original_data["paid"]
            }
            return data
        except Exception as e:
            print(f"EXCEPTION:{e}")
            return False
        finally:
            cnx.close()
    
    
    def set_order_status(order_number):
        print("here is set order status")
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        try:
            sql = "UPDATE orders SET paid = %s WHERE number = %s"
            cursor.execute(sql,(True,order_number,))
            cnx.commit()
        except Exception as e:
            print(f"EXCEPTION:{e}")
            return False
        finally:
            cnx.close()
            
            

    
