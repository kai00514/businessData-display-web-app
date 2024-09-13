import pyodbc
import os
from dotenv import load_dotenv
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load Environment
dotenv_path = '.env'
load_dotenv(dotenv_path)

def execute_sql(sql):
    # Extract connection information
    print("------- login.py -------")
    server     = os.getenv("DB_SERVER")
    database   = os.getenv("DB_NAME")
    username   = os.getenv('DB_USER')
    password   = os.getenv('DB_PASSWORD')
    sql_server = '{ODBC Driver 13 for SQL Server}'
    logger.debug(f"{server}, {database}, {username}, {password}")
    print(f"login.py: {server}, {database}, {username}, {password}")
    try:    
        # pyodbc settings
        conn = pyodbc.connect('DRIVER={sql_server};SERVER={server};PORT=1433;DATABASE={database};UID={username};PWD={password};'.format(sql_server=sql_server, server=server, database=database, username=username, password=password))
        cursor = conn.cursor()
        cursor.execute(sql)
        rows = cursor.fetchall()
        result = [list(row) for row in rows]
        print("result: ", len(result))
        cursor.close()
        conn.close()
        return result
    except:
        print("------------- login.py failed ----------------")
        return False

def login(staffno, staffpassword):
    logger.debug("staffNO, staffpassword")
    # STAFFテーブルから入力されたログイン情報をもとに検索するクエリ
    sql = f"SELECT BaseNo, StaffNo, StaffPassword FROM STAFF WHERE StaffNo='{staffno}' AND StaffPassword='{staffpassword}'"
    
    result = execute_sql(sql)
    print(result)
    # print(result)
    if isinstance(result, list) and len(result) > 0:
        result = result[0]
    
    if result:
        # ログイン情報が正しい場合
        return {"result": "OK", "message": "Login successful", "user_role": "staff", "staffno": {staffno}}
    else:
        # ログイン情報が正しくない場合
        return {"result": "NG", "message": "Login faild"}