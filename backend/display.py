import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
# DB Connection
import pyodbc
import sqlalchemy
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
# Environment
from dotenv import load_dotenv

# Load Environment
dotenv_path = '.env'
load_dotenv(dotenv_path)

def adjust_date_ranges(start_date_str, end_date_str, comparison_start_date_str, comparison_end_date_str):
    # 日付の文字列をdatetimeオブジェクトに変換
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    comparison_start_date = datetime.strptime(comparison_start_date_str, "%Y-%m-%d")
    comparison_end_date = datetime.strptime(comparison_end_date_str, "%Y-%m-%d")

    # 期間の日数を計算
    period_a_days = (end_date - start_date).days + 1
    period_b_days = (comparison_end_date - comparison_start_date).days + 1

    # 日数の少ない方に合わせて調整
    if period_a_days > period_b_days:
        # 期間Aの日数を調整
        end_date = start_date + timedelta(days=period_b_days - 1)
    elif period_b_days > period_a_days:
        # 期間Bの日数を調整
        comparison_end_date = comparison_start_date + timedelta(days=period_a_days - 1)

    return [start_date.strftime("%Y-%m-%d"),end_date.strftime("%Y-%m-%d"), comparison_start_date.strftime("%Y-%m-%d"),comparison_end_date.strftime("%Y-%m-%d")]

# def execute_sql(sql):
#     result = []
    
#     params = {
#         'server': os.getenv("DB_SERVER"),
#         'port': os.getenv("DB_PORT"),
#         'database': os.getenv("DB_NAME"),
#         'username': os.getenv("DB_USER"),
#         'password': os.getenv("DB_PASSWORD"),
#         'sql_server': os.getenv("SQL_SERVER")}
#     print(params)
#     engine = sqlalchemy.create_engine(f'mssql+pyodbc://{params["username"]}:{params["password"]}@{params["server"]}:{params["port"]}/{params["database"]}?driver={params["sql_server"]}',
#                                     echo=False,
#                                     pool_size=10,
#                                     max_overflow=5,
#                                     pool_timeout=30,
#                                     pool_recycle=3600)
    
#     session      = sessionmaker(bind=engine)()
#     query        = text(sql)
#     query_result = session.execute(query)
#     result = [list(row) for row in query_result]
#     return result

def execute_sql(sql):
    result = []
    server     = os.getenv("DB_SERVER")
    database   = os.getenv("DB_NAME")
    username   = os.getenv('DB_USER')
    password   = os.getenv('DB_PASSWORD')
    sql_server = '{ODBC Driver 13 for SQL Server}'
    print(f"display.py: {server}, {database}, {username}, {password}")
    try:
        # pyodbc settings
        conn = pyodbc.connect('DRIVER={sql_server};SERVER={server};PORT=1433;DATABASE={database};UID={username};PWD={password};'.format(sql_server=sql_server, server=server, database=database, username=username, password=password))
        print("conn: ", conn)
        cursor = conn.cursor()
        cursor.execute(sql)
        rows = cursor.fetchall()
        result = [list(row) for row in rows]
        cursor.close()
        conn.close()
        return result
    except:
        print("------------- display.py failed ----------------")
        return False
    
def get_sales_data(base_no, start_date, end_date):
    sql = f"""
        SELECT
            a.BaseNo,
            a.BusDate,
            a.CodeBase,
            a.ClsNo,
            a.Code,
            a.Sales,
            CODE.CdFName
        FROM (
        SELECT
            BaseNo,
            BusDate,
            CodeBase,
            ClsNo,
            Code,
            Sales,
            ReCnt,
            ReDate
        FROM SALEREPO
        WHERE BaseNo in ({base_no}) -- 対象店舗
            AND ClsNo = 8
            AND CodeBase = 0
            AND BusDate BETWEEN '{start_date}' AND '{end_date}' -- 対象日付
        ) AS a
        INNER JOIN CODE ON a.CodeBase = CODE.BaseNo
                        AND a.ClsNo = CODE.ClsNo
                        AND a.Code = CODE.Code
        WHERE
        CODE.Code = 31 -- 合計入場者数
        OR CODE.Code = 33 -- 精算者数
        OR CODE.Code = 23 -- 総売上合計
    """
    result = execute_sql(sql)
    return result

def get_tax_date(base_no):
    sql = f"""
        SELECT
            BaseNo,
            ActDate,
            TaxRate -- 指定日付時点の税率
        FROM
            BASECNG
        WHERE
            BaseNo In ({base_no}) -- 店舗番号
        ORDER BY
            BaseNo,
            ActDate
    """
    result = execute_sql(sql)
    return result

def get_new_members_data(base_no, start_date, end_date):
    sql = f"""
        SELECT 
            BaseNo, 
            MemNo, 
            CAST(JoinYear AS VARCHAR) + '-' + 
            RIGHT('0' + CAST(JoinMonth AS VARCHAR), 2) + '-' + 
            RIGHT('0' + CAST(JoinDay AS VARCHAR), 2) AS JoinDateFormatted
        FROM 
            MEMBER
        WHERE
            JoinYear BETWEEN 1999 AND 2050
            AND JoinMonth BETWEEN 1 AND 12
            AND JoinDay BETWEEN 1 AND 31
            AND CONVERT(DATETIME, CAST(JoinYear AS VARCHAR) + '/' + CAST(JoinMonth AS VARCHAR) + '/' + CAST(JoinDay AS VARCHAR), 120) BETWEEN '{start_date}' AND '{end_date}'
            AND BaseNo in ({base_no})
    """
    result = execute_sql(sql)
    return result

def get_other_sales_data(base_no, start_date, end_date):
    sql = f"""
        SELECT
        b.BaseNo, -- 拠点番号
        b.PubDate, -- 営業開始日
        b.ClassA,
        b.ClassB,
        b.ClassC,
        b.SaleAmt
        FROM (
            SELECT
                a.BaseNo,
                a.PubDate,
                a.SlipClsNo,
                a.SlipNo,
                PAYSYO.SeriesNo,
                PAYSYO.ClassA,
                PAYSYO.ClassB,
                PAYSYO.ClassC,
                PAYSYO.SaleCnt,
                PAYSYO.SaleAmt,
                PAYSYO.SaleCost
            FROM (
                SELECT
                    BaseNo,
                    PubDate,
                    SlipClsNo,
                    SlipNo,
                    PayClsNo,
                    PayChargeNo,
                    POSNo
                FROM
                    JCTPAY
                WHERE
                    PubDate >= '{start_date} 00:00:00'
                    AND PubDate <= '{end_date} 23:59:59'
                    AND BaseNo IN ({base_no})
                    AND SlipClsNo = 1
            ) AS a
            LEFT OUTER JOIN PAYSYO
                ON a.BaseNo = PAYSYO.BaseNo
                AND a.PubDate = PAYSYO.PubDate
                AND a.SlipClsNo = PAYSYO.SlipClsNo
                AND a.SlipNo = PAYSYO.SlipNo
            WHERE
                PAYSYO.ClassA = 100
                AND PAYSYO.ClassC BETWEEN 100 AND 1099
        ) AS b
        LEFT OUTER JOIN PAYTAX
            ON b.BaseNo = PAYTAX.BaseNo
            AND b.PubDate = PAYTAX.PubDate
            AND b.SlipClsNo = PAYTAX.SlipClsNo
            AND b.SlipNo = PAYTAX.SlipNo
            AND b.SeriesNo = PAYTAX.SeriesNo
        ORDER BY
        BaseNo,
        PubDate
    """
    result = execute_sql(sql)
    return result

def data_translater(lis):
    # NumPy配列に変換
    data_np = np.array(lis, dtype=str)
    print("data_np.shape in data_traslater: ", data_np.shape)

    # uniqueなBaseNoとBusDateの組み合わせを取得
    unique_combinations = np.unique(data_np[:, [0, 1]], axis=0)

    # 結果を格納するためのリスト
    result = []

    # unique_combinationsごとに処理
    for base_no, date in unique_combinations:
        # 現在のBaseNoとBusDateのフィルタリング
        filtered_data = data_np[(data_np[:, 0] == base_no) & (data_np[:, 1] == date)]

        # 必要な値を抽出
        total_sales = int(float(filtered_data[filtered_data[:, 6] == "総売上合計"][0, 5]))
        total_visitors = int(float(filtered_data[filtered_data[:, 6] == "合計入場者数"][0, 5]))
        total_checkouts = int(float(filtered_data[filtered_data[:, 6] == "精算者数"][0, 5]))

        # 税率を設定 (例として0.08を使用)
        tax_rate = 0.08

        # 結果を追加
        result.append([base_no, date, total_sales, total_visitors, total_checkouts, tax_rate])

    # NumPy配列に変換して返す
    return np.array(result)

def add_tax_to_sales(sales_df, tax_df):
    # 日付をパース
    sales_df['BusDate'] = pd.to_datetime(sales_df['BusDate'])
    tax_df['ActDate'] = pd.to_datetime(tax_df['ActDate'])

    # BaseNoを文字列型に変換
    sales_df['BaseNo'] = sales_df['BaseNo'].astype(str)
    tax_df['BaseNo'] = tax_df['BaseNo'].astype(str)

    # tax_dfをBaseNoとActDateでソート（merge_asofを使用するため）
    tax_df = tax_df.sort_values(by=['BaseNo', 'ActDate'])

    # merge_asofを使用して、BusDateに最も近い（またはそれ以前の）税率を取得
    merged_df = pd.merge_asof(
        sales_df.sort_values('BusDate'),
        tax_df[['BaseNo', 'ActDate', 'TaxRate']].sort_values('ActDate'),
        by='BaseNo',
        left_on='BusDate',
        right_on='ActDate',
        direction='backward'
    )

    # 不要なActDate列を削除
    merged_df.drop(columns=['ActDate'], inplace=True)

    # マージされたTaxRateを既存のTaxRateカラムに置き換え
    merged_df['TaxRate'] = merged_df['TaxRate_y']

    # 不要なカラムを削除
    merged_df.drop(columns=['TaxRate_x', 'TaxRate_y'], inplace=True)
    
    # TotalSalesを数値型にキャスト
    merged_df['TotalSales'] = pd.to_numeric(merged_df['TotalSales'], errors='coerce')

    # TotalSalesを税抜金額に変換
    merged_df['TotalSales'] = merged_df['TotalSales'] / (1 + merged_df['TaxRate'])

    # TotalSalesを整数に丸める
    merged_df['TotalSales'] = merged_df['TotalSales'].round().astype(int)

    # TotalSalesを元の形式に戻す（カンマなし）
    merged_df['TotalSales'] = merged_df['TotalSales'].astype(str)

    # 店舗ごと、日付順にソート
    merged_df_sorted = merged_df.sort_values(by=['BaseNo', 'BusDate'])

    return merged_df_sorted

def store_filter_conditions(base_no, business_type, store_location):
    store_data = [
        [1357, "浅草雷門", "FC", "駅前", "東京都", "関東", "S雷門"],
        [1243, "荻窪", "FC", "駅前", "東京都", "関東", "S荻窪"],
        [1331, "宇都宮オリオン通り", "FC", "駅前", "栃木県", "関東", "S宇ｵﾘ"],
        [1332, "南浦和駅東口", "FC", "駅前", "埼玉県", "関東", "S南浦"],
        [1336, "NEXT赤坂見附", "FC", "駅前", "東京都", "関東", "S赤2"],
        [1337, "押上", "FC", "駅前", "東京都", "関東", "S押駅"],
        [1347, "津田沼北口", "FC", "駅前", "千葉県", "関東", "S津田"],
        [1376, "目黒駅前", "FC", "駅前", "東京都", "関東", "S目黒"],
        [1510, "葛西駅前", "FC", "駅前", "東京都", "関東", "S葛西"],
        [1525, "草加駅前", "FC", "駅前", "埼玉県", "関東", "S草加"],
        [1527, "日暮里2号", "FC", "駅前", "東京都", "関東", "S日2"],
        [1652, "茅ヶ崎エメロード", "FC", "駅前", "神奈川県", "関東", "S茅ヶ"],
        [1656, "国分寺駅南口", "FC", "駅前", "東京都", "関東", "S国寺"],
        [1660, "岩国駅前", "FC", "駅前", "山口県", "中国", "S岩国"],
        [1856, "大塚", "FC", "駅前", "東京都", "関東", "S大塚"],
        [1898, "立川南口", "FC", "駅前", "東京都", "関東", "S立南"],
        [1342, "飯塚", "FC", "郊外", "福岡県", "九州", "S飯塚"],
        [1343, "薩摩川内", "FC", "郊外", "鹿児島県", "九州", "S薩川"],
        [1344, "大分下郡", "FC", "郊外", "大分県", "九州", "S下郡"],
        [1349, "福岡福重", "FC", "郊外", "福岡県", "九州", "S福重"],
        [1369, "伊勢小俣", "FC", "郊外", "三重県", "東海", "S伊小"],
        [1371, "古賀", "FC", "郊外", "福岡県", "九州", "S古賀"],
        [1379, "BREAKES我孫子", "FC", "郊外", "千葉県", "関東", "SB我"],
        [1382, "新潟佐渡", "FC", "郊外", "新潟県", "甲信越", "S新佐"],
        [1383, "中津池永", "FC", "郊外", "大分県", "九州", "S中津"],
        [1388, "久留米櫛原", "FC", "郊外", "福岡県", "九州", "S久櫛"],
        [1395, "新潟黒崎", "FC", "郊外", "新潟県", "甲信越", "S新黒"],
        [1505, "常陸大宮", "FC", "郊外", "茨城県", "関東", "S常大"],
        [1522, "燕三条", "FC", "郊外", "新潟県", "甲信越", "S燕三"],
        [1524, "別府若草", "FC", "郊外", "大分県", "九州", "S別府"],
        [1534, "大分光吉", "FC", "郊外", "大分県", "九州", "S大光"],
        [1545, "長崎時津", "FC", "郊外", "長崎県", "九州", "S長崎"],
        [1623, "宇都宮簗瀬", "FC", "郊外", "栃木県", "関東", "S簗瀬"],
        [1625, "太宰府", "FC", "郊外", "福岡県", "九州", "S太宰"],
        [1640, "鹿児島国分", "FC", "郊外", "鹿児島県", "九州", "S国分"],
        [1645, "久留米上津バイパス", "FC", "郊外", "福岡県", "九州", "S久留"],
        [1650, "丸亀川西", "FC", "郊外", "香川県", "四国", "S丸亀"],
        [1663, "秩父中央", "FC", "郊外", "埼玉県", "関東", "S秩父"],
        [1665, "八戸沼館", "FC", "郊外", "青森県", "東北", "S沼館"],
        [1667, "湖浜", "FC", "郊外", "長野県", "甲信越", "S湖浜"],
        [1670, "多治見", "FC", "郊外", "岐阜県", "東海", "S多治"],
        [1676, "武蔵中原", "FC", "郊外", "神奈川県", "関東", "S武中"],
        [1681, "倉敷下庄", "FC", "郊外", "岡山県", "中国", "S倉下"],
        [1727, "佐久", "FC", "郊外", "長野県", "甲信越", "S佐久"],
        [1785, "鹿児島中央", "FC", "郊外", "鹿児島県", "九州", "S鹿児"],
        [1788, "鹿屋", "FC", "郊外", "鹿児島県", "九州", "S鹿屋"],
        [1789, "大府", "FC", "郊外", "愛知県", "東海", "S大府"],
        [1865, "君津", "FC", "郊外", "千葉県", "関東", "S君津"],
        [1891, "宮崎北", "FC", "郊外", "宮崎県", "九州", "S宮崎"],
        [1325, "米子マンガミュージアム", "FC", "郊外", "鳥取県", "中国", "S米子"],
        [1324, "柏崎", "FC", "郊外", "新潟県", "甲信越", "S柏崎"],
        [1237, "伊勢佐木長者町", "直営", "駅前", "神奈川県", "関東", "S伊長"],
        [1238, "藤沢駅南口", "直営", "駅前", "神奈川県", "関東", "S藤前"],
        [1239, "恵比寿", "直営", "駅前", "東京都", "関東", "S恵比"],
        [1240, "新橋", "直営", "駅前", "東京都", "関東", "S新橋"],
        [1241, "横浜西口2号", "直営", "駅前", "神奈川県", "関東", "S横西2"],
        [1244, "原宿", "直営", "駅前", "東京都", "関東", "S原宿"],
        [1254, "AC伊勢佐木長者町", "直営", "駅前", "神奈川県", "関東", "A伊長"],
        [1608, "井土ヶ谷", "直営", "郊外", "神奈川県", "関東", "S井戸"],
        [1233, "池袋西口ROSA", "直営", "駅前", "東京都", "関東", "S池RO"],
        [1234, "NEXT蒲田西口", "直営", "駅前", "東京都", "関東", "S蒲西"],
        [1351, "新横浜駅前", "直営", "駅前", "神奈川県", "関東", "S新横"],
        [1353, "西川口", "直営", "駅前", "埼玉県", "関東", "S西川"],
        [1354, "横浜西口", "直営", "駅前", "神奈川県", "関東", "S横西"],
        [1355, "巣鴨駅前", "直営", "駅前", "東京都", "関東", "S巣鴨"],
        [1360, "河原町店", "直営", "駅前", "京都府", "近畿", "S河原"],
        [1362, "五反田東口", "直営", "駅前", "東京都", "関東", "S五東"],
        [1514, "札幌駅前南口", "直営", "駅前", "北海道", "北海道", "S札南"],
        [1546, "朝霞台南口", "直営", "駅前", "埼玉県", "関東", "S朝霞"],
        [1547, "BIGBOX高田馬場", "直営", "駅前", "東京都", "関東", "S馬場"],
        [1549, "成増", "直営", "駅前", "東京都", "関東", "S成増"],
        [1695, "多摩センター", "直営", "駅前", "東京都", "関東", "S多ｾﾝ"],
        [1696, "明石駅前", "直営", "駅前", "兵庫県", "近畿", "S明石"],
        [1772, "京都新京極", "直営", "駅前", "京都府", "近畿", "S新京"],
        [1792, "亀戸", "直営", "駅前", "東京都", "関東", "S亀戸"],
        [1830, "川越", "直営", "駅前", "埼玉県", "関東", "S川越"],
        [1855, "高円寺", "直営", "駅前", "東京都", "関東", "S高円"],
        [1888, "和光", "直営", "駅前", "埼玉県", "関東", "S和光"],
        [1647, "苫小牧", "直営", "郊外", "北海道", "北海道", "S苫小"],
        [1657, "恵庭住吉", "直営", "郊外", "北海道", "北海道", "S恵庭"],
        [1671, "松本インター", "直営", "郊外", "長野県", "甲信越", "S松ｲﾝ"],
        [1747, "三鷹", "直営", "郊外", "東京都", "関東", "S三鷹"],
        [1768, "熊谷籠原", "直営", "郊外", "埼玉県", "関東", "S籠原"],
        [1771, "堺山本町", "直営", "郊外", "大阪府", "近畿", "S堺山"],
        [1779, "手稲前田", "直営", "郊外", "北海道", "北海道", "S手稲"],
        [1793, "熊本十禅寺", "直営", "郊外", "熊本県", "九州", "S十禅"],
        [1835, "札幌北光", "直営", "郊外", "北海道", "北海道", "S北光"],
        [1839, "札幌西町", "直営", "郊外", "北海道", "北海道", "S西町"],
        [1844, "札幌清田", "直営", "郊外", "北海道", "北海道", "S清田"],
        [1255, "AC新京極", "直営", "駅前", "京都府", "近畿", "A京都"],
        [1232, "ジクー西武新宿駅前", "直営", "駅前", "東京都", "関東", "A西新"],
        [9999, "築地虎杖　〆虎", "直営", "駅前", "なし", "なし", None]
    ]

    # 全店舗情報取得
    store_df = pd.DataFrame(store_data, columns=["店舗番号", "店舗名1", "大区分", "中区分", "都道府県", "エリア区分", "店舗名2"])
    base_no_lis = base_no.split(", ")
    base_no_lis = [int(no) for no in base_no_lis]
    # 全店舗情報からパラメータにある店舗情報を取得
    filtered_df = store_df[store_df["店舗番号"].isin(base_no_lis)]

    # 全て + 全て
    if business_type == "全て" and store_location == "全て":
        return filtered_df[["店舗番号", "店舗名2"]].values.tolist()
    
    # 全て + 駅前
    elif business_type == "全て" and store_location == "駅前":
        return filtered_df[filtered_df["中区分"] == "駅前"][["店舗番号", "店舗名2"]].values.tolist()
    
    # 全て + 郊外
    elif business_type == "全て" and store_location == "郊外":
        return filtered_df[filtered_df["中区分"] == "郊外"][["店舗番号", "店舗名2"]].values.tolist()
    
    # 直営 + 全て
    elif business_type == "直営" and store_location == "全て":
        return filtered_df[filtered_df["大区分"] == "直営"][["店舗番号", "店舗名2"]].values.tolist()
    
    # 直営 + 駅前
    elif business_type == "直営" and store_location == "駅前":
        return filtered_df[(filtered_df["大区分"] == "直営") & (filtered_df["中区分"] == "駅前")][["店舗番号", "店舗名2"]].values.tolist()
    
    # 直営 + 郊外
    elif business_type == "直営" and store_location == "郊外":
        return filtered_df[(filtered_df["大区分"] == "直営") & (filtered_df["中区分"] == "郊外")][["店舗番号", "店舗名2"]].values.tolist()
    
    # FC + 全て
    elif business_type == "FC" and store_location == "全て":
        return filtered_df[filtered_df["大区分"] == "FC"][["店舗番号", "店舗名2"]].values.tolist()
    
    # FC + 駅前
    elif business_type == "FC" and store_location == "駅前":
        return filtered_df[(filtered_df["大区分"] == "FC") & (filtered_df["中区分"] == "駅前")][["店舗番号", "店舗名2"]].values.tolist()
    
    # FC + 郊外
    elif business_type == "FC" and store_location == "郊外":
        return filtered_df[(filtered_df["大区分"] == "FC") & (filtered_df["中区分"] == "郊外")][["店舗番号", "店舗名2"]].values.tolist()
    
    else:
        return 0        

def access_database(base_no, start_date, end_date):
    # データ抽出
    ### 売上データ取得
    print("start sales_data")
    sales_data = get_sales_data(base_no, start_date, end_date)
    print("end sales_data")

    print("start data_translater")
    sales_data = data_translater(sales_data)
    print("end data_translater")
    print("start pd_DataFrame")
    sales_df = pd.DataFrame(sales_data, columns=["BaseNo", "BusDate", "TotalSales", "TotalVisitors", "TotalCheckouts", "TaxRate"])
    print("end pd_DataFrame")

    ### 税率データ取得
    print("start tax_data")
    tax_data   = get_tax_date(base_no)
    print("end tax_data")
    tax_df = pd.DataFrame(tax_data, columns=["BaseNo","ActDate", "TaxRate"])
    # tax_df = pd.DataFrame(tax_data)
    
    ### 新規数データ取得
    print("start new_members_data")
    new_data   = get_new_members_data(base_no, start_date, end_date)
    print("end new_members_data")
    new_df = pd.DataFrame(new_data, columns=["BaseNo", "MemNo", "JoinDateFormatted"])
    # new_df = pd.DataFrame(new_data)
    
    ### その他売上データ取得
    print("start other_data")
    other_data = get_other_sales_data(base_no, start_date, end_date)
    print("end other_data")
    other_df = pd.DataFrame(other_data, columns=["BaseNo" , "PubDate", "ClassA", "ClassB", "ClassC", "SaleAmt"])
    # other_df = pd.DataFrame(other_data)
    
    ### 売上データと税率データをマージ
    sales_df = add_tax_to_sales(sales_df, tax_df)

    return sales_df, new_df, other_df

def get_parameter(parameters):
    ### 店舗別 or 日別
    view_type = parameters.get('displayType')

    ### 対象期間日付1
    start_date = parameters['range']['start']

    ### 対象期間日付2
    end_date = parameters['range']['end']

    ### 比較対象期間日付1
    comparison_start_date = parameters['comparisonRange'].get('start')
    
    ### 比較対象期間日付2
    comparison_end_date = parameters['comparisonRange'].get('end')

    # 対象店舗
    selected_store = parameters['storeSelection']['selectedStore']

    # 都道府県検索
    prefecture_type = parameters['storeSelection'].get('prefecture')

    # 全て or 直営 or FC
    business_type = parameters['otherConditions'].get('businessType')

    # 全て or 駅前 or 郊外
    store_location = parameters['otherConditions'].get('storeLocation')

    # その他売上込み or その他売上抜き
    include_sales = parameters.get('includeSales')

    return view_type, start_date, end_date, comparison_start_date, comparison_end_date, selected_store, prefecture_type, business_type, store_location, include_sales

def process_store1_data(sales_data: pd.DataFrame, new_data: pd.DataFrame, other_data: pd.DataFrame, include_sales, store_info) -> dict:
    # Ensure the numeric columns are correctly parsed as numbers

    sales_data['TotalSales'] = pd.to_numeric(sales_data['TotalSales'], errors='coerce')
    sales_data['BaseNo'] = pd.to_numeric(sales_data['BaseNo'], errors='coerce')
    sales_data['TotalVisitors'] = pd.to_numeric(sales_data['TotalVisitors'], errors='coerce')
    try:
        other_data['SaleAmt'] = pd.to_numeric(other_data['SaleAmt'], errors='coerce')
    except:
        other_data = ""
        
    # Calculate the total values for all stores
    try:
        sum_total_sales = sales_data['TotalSales'].sum()
        if sum_total_sales == 0:
            sum_total_sales = ""
    except:
        sum_total_sales = ""
        
    try:
        sum_total_visitors = sales_data['TotalVisitors'].sum()
        if sum_total_visitors == 0:
            sum_total_visitors = ""
    except:
        sum_total_visitors = ""
        
    try:
        avg_sales_per_visitor = (sum_total_sales / sum_total_visitors) if sum_total_sales != 0 and sum_total_visitors != 0 else ""
    except:
        avg_sales_per_visitor = ""
    
    try:    
        sum_new_customers = new_data.shape[0]
        if sum_new_customers == 0:
            sum_new_customers = ""
    except:
        sum_new_customers = ""
        
    try:    
        avg_new_customers_rate = (f"{sum_new_customers / sum_total_visitors * 100:.2f}%") if sum_new_customers != 0 and sum_total_visitors != 0 else ""
    except:
        avg_new_customers_rate = ""
        
    try:
        sum_other_sales = other_data['SaleAmt'].sum()
        if sum_other_sales == 0.0:
            sum_other_sales = ""
    except:
        sum_other_sales = ""
        
    # その他売上
    if include_sales == "true" and sum_total_sales != "" and sum_other_sales != "":
        sum_total_sales = int(sum_total_sales + sum_other_sales)

    # Initialize the output dictionary with '合計' data
    output_data = {
        "合計": {
            "base_name": "合計",
            "base_no": "",
            "sales_total1": sum_total_sales,
            "sales_total2": "",
            "sales_total_diff": "",
            "sales_total_ab_ratio": "",
            "users1": sum_total_visitors,
            "users2": "",
            "users_total_diff": "",
            "users_total_ab_ratio": "",
            "average_spend1": avg_sales_per_visitor,
            "average_spend2": "",
            "average_spend_total_diff": "",
            "average_spend_total_ab_ratio": "",
            "new_users1": sum_new_customers,
            "new_users2": "",
            "new_users_total_diff": "",
            "new_users_total_ab_ratio": "",
            "new_rate1": avg_new_customers_rate,
            "new_rate2": "",
            "other_sales_total1": sum_other_sales,
            "other_sales_total2": "",
            "other_sales_total_diff": "",
            "other_sales_total_ab_ratio": ""
        },
        "店舗データ": []
    }

    # Process each store's data based on BaseNo (store number)
    for base_no in store_info:
        store_sales_data = sales_data[sales_data['BaseNo'] == int(base_no[0])]
        store_new_data = new_data[new_data['BaseNo'] == int(base_no[0])]
        try:
            store_other_data = other_data[other_data['BaseNo'] == int(base_no[0])]
        except:
            store_other_data = ""
            
        # Calculate the required sums and averages for each store
        try:
            total_sales = store_sales_data['TotalSales'].sum() 
            if total_sales == 0:
                total_sales = ""
        except:
            total_sales = ""
        
        try:    
            total_visitors = store_sales_data['TotalVisitors'].sum()
            if total_visitors == 0:
                total_visitors = ""
        except:
            total_visitors = ""

        try:
            sales_per_visitor = (total_sales / total_visitors) if total_sales != 0 and total_visitors != 0 else ""
        except:
            sales_per_visitor = ""
            
        try:
            new_customers = store_new_data.shape[0]
            if new_customers == 0:
                new_customers = ""
        except:
            new_customers = ""
            
        try:
            if new_customers == "":
                new_customers_rate = ""
            else:
                new_customers_rate = (f"{new_customers / total_visitors * 100:.2f}%") if new_customers != 0 and total_visitors != 0 else ""
        except:
            new_customers_rate = ""
        
        try:    
            other_sales = store_other_data['SaleAmt'].sum()
            if other_sales == 0.0:
                other_sales = ""
        except:
            other_sales = ""
            
        # その他売上
        if include_sales == "true" and total_sales != "" and other_sales != "":
            total_sales = int(total_sales + other_sales)

        output_data["店舗データ"].append({
            "base_name": base_no[1],
            "base_no": base_no[0],
            "sales_total1": total_sales,
            "sales_total2": "",
            "sales_total_diff": "",
            "sales_total_ab_ratio": "",
            "users1": total_visitors,
            "users2": "",
            "users_total_diff": "",
            "users_total_ab_ratio": "",
            "average_spend1": sales_per_visitor,
            "average_spend2": "",
            "average_spend_total_diff": "",
            "average_spend_total_ab_ratio": "",
            "new_users1": new_customers,
            "new_users2": "",
            "new_users_total_diff": "",
            "new_users_total_ab_ratio": "",
            "new_rate1": new_customers_rate,
            "new_rate2": "",
            "other_sales_total1": other_sales,
            "other_sales_total2": "",
            "other_sales_total_diff": "",
            "other_sales_total_ab_ratio": ""
        })   

    return output_data

def process_store2_data(sales_data: pd.DataFrame, new_data: pd.DataFrame, other_data: pd.DataFrame, include_sales, store_info) -> dict:
    # Ensure the numeric columns are correctly parsed as numbers
    sales_data['TotalSales'] = pd.to_numeric(sales_data['TotalSales'], errors='coerce')
    sales_data['BaseNo'] = pd.to_numeric(sales_data['BaseNo'], errors='coerce')
    sales_data['TotalVisitors'] = pd.to_numeric(sales_data['TotalVisitors'], errors='coerce')
    try:
        other_data['SaleAmt'] = pd.to_numeric(other_data['SaleAmt'], errors='coerce')
    except:
        other_data = ""

    # Calculate the total values for all stores
    try:
        sum_total_sales = sales_data['TotalSales'].sum()
        if sum_total_sales == 0:
            sum_total_sales = ""
    except:
        sum_total_sales = ""
        
    try:
        sum_total_visitors = sales_data['TotalVisitors'].sum()
        if sum_total_visitors == 0:
            sum_total_visitors = ""
    except:
        sum_total_visitors = ""
        
    try:
        avg_sales_per_visitor = (sum_total_sales / sum_total_visitors) if sum_total_sales != 0 and sum_total_visitors != 0 else ""
    except:
        avg_sales_per_visitor = ""
    
    try:    
        sum_new_customers = new_data.shape[0]
        if sum_new_customers == 0:
            sum_new_customers = ""
    except:
        sum_new_customers = ""
        
    try:    
        avg_new_customers_rate = (f"{sum_new_customers / sum_total_visitors * 100:.2f}%") if sum_new_customers != 0 and sum_total_visitors != 0 else ""
    except:
        avg_new_customers_rate = ""
        
    try:
        sum_other_sales = other_data['SaleAmt'].sum()
        if sum_other_sales == 0.0:
            sum_other_sales = ""
    except:
        sum_other_sales = ""
        
    # その他売上
    if include_sales == "true" and sum_total_sales != "" and sum_other_sales != "":
        sum_total_sales = int(sum_total_sales + sum_other_sales)

    # Initialize the output dictionary with '合計' data
    output_data = {
        "合計": {
            "base_name": "合計",
            "base_no": "",
            "sales_total1": "",
            "sales_total2": sum_total_sales,
            "sales_total_diff": "",
            "sales_total_ab_ratio": "",
            "users1": "",
            "users2": sum_total_visitors,
            "users_total_diff": "",
            "users_total_ab_ratio": "",
            "average_spend1": "",
            "average_spend2": avg_sales_per_visitor,
            "average_spend_total_diff": "",
            "average_spend_total_ab_ratio": "",
            "new_users1": "",
            "new_users2": sum_new_customers,
            "new_users_total_diff": "",
            "new_users_total_ab_ratio": "",
            "new_rate1": "",
            "new_rate2": avg_new_customers_rate,
            "other_sales_total1": "",
            "other_sales_total2": sum_other_sales,
            "other_sales_total_diff": "",
            "other_sales_total_ab_ratio": ""
        },
        "店舗データ": []
    }

    # Process each store's data based on BaseNo (store number)
    for base_no in store_info:
        store_sales_data = sales_data[sales_data['BaseNo'] == int(base_no[0])]
        store_new_data = new_data[new_data['BaseNo'] == int(base_no[0])]
        try:
            store_other_data = other_data[other_data['BaseNo'] == int(base_no[0])]
        except:
            store_other_data = ""
        # Calculate the required sums and averages for each store
        try:
            total_sales = store_sales_data['TotalSales'].sum() 
            if total_sales == 0:
                total_sales = ""
        except:
            total_sales = ""
        
        try:    
            total_visitors = store_sales_data['TotalVisitors'].sum()
            if total_visitors == 0:
                total_visitors = ""
        except:
            total_visitors = ""

        try:
            sales_per_visitor = (total_sales / total_visitors) if total_sales != 0 and total_visitors != 0 else ""
        except:
            sales_per_visitor = ""
            
        try:
            new_customers = store_new_data.shape[0]
            if new_customers == 0:
                new_customers = ""
        except:
            new_customers = ""
            
        try:
            if new_customers == "":
                new_customers_rate = ""
            else:
                new_customers_rate = (f"{new_customers / total_visitors * 100:.2f}%") if new_customers != 0 and total_visitors != 0 else ""
        except:
            new_customers_rate = ""
        
        try:    
            other_sales = store_other_data['SaleAmt'].sum()
            if other_sales == 0.0:
                other_sales = ""
        except:
            other_sales = ""
            
        # その他売上
        if include_sales == "true" and total_sales != "" and other_sales != "":
            total_sales = int(total_sales + other_sales)

        output_data["店舗データ"].append({
            "base_name": base_no[1],
            "base_no": base_no[0],
            "sales_total1": "",
            "sales_total2": total_sales,
            "sales_total_diff": "",
            "sales_total_ab_ratio": "",
            "users1": "",
            "users2": total_visitors,
            "users_total_diff": "",
            "users_total_ab_ratio": "",
            "average_spend1": "",
            "average_spend2": sales_per_visitor,
            "average_spend_total_diff": "",
            "average_spend_total_ab_ratio": "",
            "new_users1": "",
            "new_users2": new_customers,
            "new_users_total_diff": "",
            "new_users_total_ab_ratio": "",
            "new_rate1": "",
            "new_rate2": new_customers_rate,
            "other_sales_total1": "",
            "other_sales_total2": other_sales,
            "other_sales_total_diff": "",
            "other_sales_total_ab_ratio": ""
        })    
    return output_data

def process_date1_data(sales_data: pd.DataFrame, new_data: pd.DataFrame, other_data: pd.DataFrame, include_sales, store_info) -> dict:
    # Ensure the numeric columns are correctly parsed as numbers
    sales_data['BaseNo'] = pd.to_numeric(sales_data['BaseNo'], errors='coerce')
    sales_data['TotalSales'] = pd.to_numeric(sales_data['TotalSales'], errors='coerce')
    sales_data['TotalVisitors'] = pd.to_numeric(sales_data['TotalVisitors'], errors='coerce')

    if other_data is not None and not other_data.empty:
        other_data['SaleAmt'] = pd.to_numeric(other_data['SaleAmt'], errors='coerce')

    # Calculate the total values for all stores
    try:
        sum_total_sales = sales_data['TotalSales'].sum()
        if sum_total_sales == 0:
            sum_total_sales = ""
    except:
        sum_total_sales = ""
        
    try:
        sum_total_visitors = sales_data['TotalVisitors'].sum()
        if sum_total_visitors == 0:
            sum_total_visitors = ""
    except:
        sum_total_visitors = ""
        
    try:
        avg_sales_per_visitor = (sum_total_sales / sum_total_visitors) if sum_total_sales != 0 and sum_total_visitors != 0 else ""
    except:
        avg_sales_per_visitor = ""
    
    try:    
        sum_new_customers = new_data.shape[0]
        if sum_new_customers == 0:
            sum_new_customers = ""
    except:
        sum_new_customers = ""
        
    try:    
        avg_new_customers_rate = (f"{sum_new_customers / sum_total_visitors * 100:.2f}%") if sum_new_customers != 0 and sum_total_visitors != 0 else ""
    except:
        avg_new_customers_rate = ""
        
    try:
        sum_other_sales = other_data['SaleAmt'].sum()
        if sum_other_sales == 0.0:
            sum_other_sales = ""
    except:
        sum_other_sales = ""
        
    # その他売上
    if include_sales == "true" and sum_total_sales != "" and sum_other_sales != "":
        sum_total_sales = int(sum_total_sales + sum_other_sales)
        
    # Initialize the output dictionary with '合計' data
    output_data = {
        "合計": {
            "date": "合計",
            "base_no": "",
            "sales_total1": sum_total_sales,
            "sales_total2": "",
            "sales_total_diff": "",
            "sales_total_ab_ratio": "",
            "users1": sum_total_visitors,
            "users2": "",
            "users_total_diff": "",
            "users_total_ab_ratio": "",
            "average_spend1": avg_sales_per_visitor,
            "average_spend2": "",
            "average_spend_total_diff": "",
            "average_spend_total_ab_ratio": "",
            "new_users1": sum_new_customers,
            "new_users2": "",
            "new_users_total_diff": "",
            "new_users_total_ab_ratio": "",
            "new_rate1": avg_new_customers_rate,
            "new_rate2": "",
            "other_sales_total1": sum_other_sales,
            "other_sales_total2": "",
            "other_sales_total_diff": "",
            "other_sales_total_ab_ratio": ""
        },
        "店舗データ": []
    }

    # Get unique dates from the sales_data 'BusDate' column
    unique_dates = sales_data['BusDate'].unique()

    # 日付データをdatetime型に変換する
    sales_data['BusDate'] = pd.to_datetime(sales_data['BusDate'])
    new_data['JoinDateFormatted'] = pd.to_datetime(new_data['JoinDateFormatted'])
    try:
        other_data['PubDate'] = pd.to_datetime(other_data['PubDate'])
    except:
        pass
    # フィルタリングの再実装
    unique_dates = sales_data['BusDate'].unique()
    for date in unique_dates:
        # sales_dataのフィルタリング
        date_sales_data = sales_data[sales_data['BusDate'] == date]

        # new_dataのフィルタリング
        if new_data.empty:
            date_new_data = pd.DataFrame(columns=["BaseNo", "JoinDateFormatted"])
        else:
            date_new_data = new_data[new_data['JoinDateFormatted'] == date]

        # other_dataのフィルタリング
        if other_data.empty:
            date_other_data = pd.DataFrame(columns=["BaseNo", "PubDate", "ClassA", "ClassB", "ClassC", "SaleAmt"])
        else:
            date_other_data = other_data[other_data['PubDate'].dt.date == date.date()]
        for base_no in store_info:
            store_sales_data = date_sales_data[date_sales_data['BaseNo'] == int(base_no[0])]
            store_new_data = date_new_data[date_new_data['BaseNo'] == int(base_no[0])]# if not date_new_data.empty else pd.DataFrame()
            store_other_data = date_other_data[date_other_data['BaseNo'] == int(base_no[0])] #if not date_other_data.empty else pd.DataFrame()

            # Calculate the required sums and averages for each store
            try:
                total_sales = store_sales_data['TotalSales'].sum() 
                if total_sales == 0:
                    total_sales = ""
            except:
                total_sales = ""
            
            try:    
                total_visitors = store_sales_data['TotalVisitors'].sum()
                if total_visitors == 0:
                    total_visitors = ""
            except:
                total_visitors = ""

            try:
                sales_per_visitor = (total_sales / total_visitors) if total_sales != 0 and total_visitors != 0 else ""
            except:
                sales_per_visitor = ""
                
            try:
                new_customers = store_new_data.shape[0]
                if new_customers == 0:
                    new_customers = ""
            except:
                new_customers = ""
                
            try:
                if new_customers == "":
                    new_customers_rate = ""
                else:
                    new_customers_rate = (f"{new_customers / total_visitors * 100:.2f}%") if new_customers != 0 and total_visitors != 0 else ""
            except:
                new_customers_rate = ""
            
            try:    
                other_sales = store_other_data['SaleAmt'].sum()
                if other_sales == 0.0:
                    other_sales = ""
            except:
                other_sales = ""

            # Include other sales if requested
            if include_sales == "true" and total_sales != "" and other_sales != "":
                total_sales = int(total_sales + other_sales)

            formatted_date = date.strftime("%Y年{}月{}日").format(date.month, date.day)

            # Append the data for this date and store to the output dictionary
            output_data["店舗データ"].append({
                "date": formatted_date,
                "base_no": base_no[1],
                "sales_total1": total_sales,
                "sales_total2": "",
                "sales_total_diff": "",
                "sales_total_ab_ratio": "",
                "users1": total_visitors,
                "users2": "",
                "users_total_diff": "",
                "users_total_ab_ratio": "",
                "average_spend1": sales_per_visitor,
                "average_spend2": "",
                "average_spend_total_diff": "",
                "average_spend_total_ab_ratio": "",
                "new_users1": new_customers,
                "new_users2": "",
                "new_users_total_diff": "",
                "new_users_total_ab_ratio": "",
                "new_rate1": new_customers_rate,
                "new_rate2": "",
                "other_sales_total1": other_sales,
                "other_sales_total2": "",
                "other_sales_total_diff": "",
                "other_sales_total_ab_ratio": ""
            })
    return output_data

def process_date2_data(sales_data: pd.DataFrame, new_data: pd.DataFrame, other_data: pd.DataFrame, include_sales, store_info) -> dict:
    # Ensure the numeric columns are correctly parsed as numbers
    sales_data['BaseNo'] = pd.to_numeric(sales_data['BaseNo'], errors='coerce')
    sales_data['TotalSales'] = pd.to_numeric(sales_data['TotalSales'], errors='coerce')
    sales_data['TotalVisitors'] = pd.to_numeric(sales_data['TotalVisitors'], errors='coerce')

    if other_data is not None and not other_data.empty:
        other_data['SaleAmt'] = pd.to_numeric(other_data['SaleAmt'], errors='coerce')

    # Calculate the total values for all stores
    try:
        sum_total_sales = sales_data['TotalSales'].sum()
        if sum_total_sales == 0:
            sum_total_sales = ""
    except:
        sum_total_sales = ""
        
    try:    
        sum_total_visitors = sales_data['TotalVisitors'].sum()
        if sum_total_visitors == 0:
            sum_total_visitors = ""
    except:
        sum_total_visitors = ""
        
    try:
        avg_sales_per_visitor = (sum_total_sales / sum_total_visitors ) if sum_total_sales != 0 and sum_total_visitors != 0 else ""
    except:
        avg_sales_per_visitor = ""
        
    try:    
        sum_new_customers = new_data.shape[0]
        if sum_new_customers == 0:
            sum_new_customers = ""
    except:
        sum_new_customers = ""
        
    try:
        avg_new_customers_rate = (f"{sum_new_customers / sum_total_visitors * 100:.2f}%") if sum_new_customers != 0 and sum_total_visitors != 0 else ""
    except:
        avg_new_customers_rate = ""
        
    try:
        sum_other_sales = other_data['SaleAmt'].sum()
        if sum_other_sales == 0.0:
            sum_other_sales = ""
    except:
        sum_other_sales = ""
        
    # その他売上
    if include_sales == "true" and sum_total_sales != "" and sum_other_sales != "":
        sum_total_sales = int(sum_total_sales + sum_other_sales)

    # Initialize the output dictionary with '合計' data
    output_data = {
        "合計": {
            "date": "合計",
            "base_no": "",
            "sales_total1": "",
            "sales_total2": sum_total_sales,
            "sales_total_diff": "",
            "sales_total_ab_ratio": "",
            "users1": "",
            "users2": sum_total_visitors,
            "users_total_diff": "",
            "users_total_ab_ratio": "",
            "average_spend1": "",
            "average_spend2": avg_sales_per_visitor,
            "average_spend_total_diff": "",
            "average_spend_total_ab_ratio": "",
            "new_users1": "",
            "new_users2": sum_new_customers,
            "new_users_total_diff": "",
            "new_users_total_ab_ratio": "",
            "new_rate1": "",
            "new_rate2": avg_new_customers_rate,
            "other_sales_total1": "",
            "other_sales_total2": sum_other_sales,
            "other_sales_total_diff": "",
            "other_sales_total_ab_ratio": ""
        },
        "店舗データ": []
    }

    # Get unique dates from the sales_data 'BusDate' column
    unique_dates = sales_data['BusDate'].unique()

    # 日付データをdatetime型に変換する
    sales_data['BusDate'] = pd.to_datetime(sales_data['BusDate'])
    new_data['JoinDateFormatted'] = pd.to_datetime(new_data['JoinDateFormatted'])
    try:
        other_data['PubDate'] = pd.to_datetime(other_data['PubDate'])
    except:
        pass

    # フィルタリングの再実装
    unique_dates = sales_data['BusDate'].unique()

    for date in unique_dates:
        # sales_dataのフィルタリング
        date_sales_data = sales_data[sales_data['BusDate'] == date]

        # new_dataのフィルタリング
        if new_data.empty:
            date_new_data = pd.DataFrame(columns=["BaseNo", "JoinDateFormatted"])
        else:
            date_new_data = new_data[new_data['JoinDateFormatted'] == date]

        # other_dataのフィルタリング
        if other_data.empty:
            date_other_data = pd.DataFrame(columns=["BaseNo", "PubDate", "ClassA", "ClassB", "ClassC", "SaleAmt"])
        else:
            date_other_data = other_data[other_data['PubDate'].dt.date == date.date()]

        for base_no in store_info:
            store_sales_data = date_sales_data[date_sales_data['BaseNo'] == int(base_no[0])]
            store_new_data = date_new_data[date_new_data['BaseNo'] == int(base_no[0])]# if not date_new_data.empty else pd.DataFrame()
            store_other_data = date_other_data[date_other_data['BaseNo'] == int(base_no[0])] #if not date_other_data.empty else pd.DataFrame()

            # Calculate the required sums and averages for each store
            try:
                total_sales = store_sales_data['TotalSales'].sum()
                if total_sales == 0:
                    total_sales = ""
            except:
                total_sales = ""    
            
            try:    
                total_visitors = store_sales_data['TotalVisitors'].sum()
                if total_visitors == 0:
                    total_visitors = ""
            except:
                total_visitors = ""
            
            try:    
                sales_per_visitor = (total_sales / total_visitors) if total_sales != 0 and total_visitors != 0 else ""
            except:
                sales_per_visitor = ""
            
            try:    
                new_customers = store_new_data.shape[0]
                if new_customers == 0:
                    new_customers = ""
            except:
                new_customers = ""
            
            try:   
                new_customers_rate = (f"{new_customers / total_visitors * 100:.2f}%") if new_customers != 0 and total_visitors != 0 else "" 
            except:
                new_customers_rate = ""                
            
            try:
                other_sales = store_other_data['SaleAmt'].sum()
                if other_sales == 0.0:
                    other_sales = ""
            except:
                other_sales = ""

            # その他売上
            if include_sales == "true" and total_sales != "" and other_sales != "":
                total_sales = int(total_sales + other_sales)

            formatted_date = date.strftime("%Y年{}月{}日").format(date.month, date.day)

            # Append the data for this date and store to the output dictionary
            output_data["店舗データ"].append({
                "date": formatted_date,
                "base_no": base_no[1],
                "sales_total1": "",
                "sales_total2": total_sales,
                "sales_total_diff": "",
                "sales_total_ab_ratio": "",
                "users1": "",
                "users2": total_visitors,
                "users_total_diff": "",
                "users_total_ab_ratio": "",
                "average_spend1": "",
                "average_spend2": sales_per_visitor,
                "average_spend_total_diff": "",
                "average_spend_total_ab_ratio": "",
                "new_users1": "",
                "new_users2": new_customers,
                "new_users_total_diff": "",
                "new_users_total_ab_ratio": "",
                "new_rate1": "",
                "new_rate2": new_customers_rate,
                "other_sales_total1": "",
                "other_sales_total2": other_sales,
                "other_sales_total_diff": "",
                "other_sales_total_ab_ratio": ""
            })
    return output_data


def store_merge_and_calculate_data(json1, json2):
    # 合計を統合する関数
    def merge_total_data(json1_total, json2_total):
        for key in json1_total.keys():
            if json1_total[key] == "" and json2_total[key] != "":
                json1_total[key] = json2_total[key]
        return json1_total

    # 店舗データを統合する関数
    def merge_store_data(json1_store, json2_store):
        store_dict = {store['base_no']: store for store in json1_store}

        for store in json2_store:
            base_no = store['base_no']
            if base_no in store_dict:
                for key in store_dict[base_no].keys():
                    if store_dict[base_no][key] == "" and store[key] != "":
                        store_dict[base_no][key] = store[key]
        
        return list(store_dict.values())

    # 計算を行う関数
    def calculate_diff_and_ratio(data):
        def format_ratio(value):
            return f"{value}"  # 文字列として%を付加
        
        if data['sales_total1'] != "" and data['sales_total2'] != "":
            data['sales_total_diff'] = data['sales_total1'] - data['sales_total2']
            try:
                ratio = round(data['sales_total1'] / data['sales_total2'] * 100, 2)
            except:
                ratio = ""
            data['sales_total_ab_ratio'] = format_ratio(ratio)
        
        if data['users1'] != "" and data['users2'] != "":
            data['users_total_diff'] = data['users1'] - data['users2']
            try:
                ratio = round(data['users1'] / data['users2'] * 100, 2)
            except:
                ratio = ""
            data['users_total_ab_ratio'] = format_ratio(ratio)
        
        if data['average_spend1'] != "" and data['average_spend2'] != "":
            data['average_spend_total_diff'] = data['average_spend1'] - data['average_spend2']
            try:
                ratio = round(data['average_spend1'] / data['average_spend2'] * 100, 2)
            except:
                ratio = ""
            data['average_spend_total_ab_ratio'] = format_ratio(ratio)
        
        if data['new_users1'] != "" and data['new_users2'] != "":
            data['new_users_total_diff'] = data['new_users1'] - data['new_users2']
            try:
                ratio = round(data['new_users1'] / data['new_users2'] * 100, 2)
            except:
                ratio = ""
            data['new_users_total_ab_ratio'] = format_ratio(ratio)
        
        if data['other_sales_total1'] != "" and data['other_sales_total2'] != "":
            data['other_sales_total_diff'] = data['other_sales_total1'] - data['other_sales_total2']
            try:
                ratio = round(data['other_sales_total1'] / data['other_sales_total2'] * 100, 2)
            except:
                ratio = ""
            data['other_sales_total_ab_ratio'] = format_ratio(ratio)

        return data

    # 合計データの統合
    merged_total = merge_total_data(json1["合計"], json2["合計"])

    # 店舗データの統合
    merged_store_data = merge_store_data(json1["店舗データ"], json2["店舗データ"])

    # 計算を実行
    merged_total = calculate_diff_and_ratio(merged_total)
    merged_store_data = [calculate_diff_and_ratio(store) for store in merged_store_data]

    # 統合されたJSONを生成
    merged_json = {
        "合計": merged_total,
        "店舗データ": merged_store_data
    }
    return merged_json

def date_merge_and_calculate_data(json1, json2):
    # 合計を統合する関数
    def merge_total_data(json1_total, json2_total):
        for key in json1_total.keys():
            if json1_total[key] == "" and json2_total[key] != "":
                json1_total[key] = json2_total[key]
        return json1_total

    # 店舗データを統合する関数
    def merge_store_data(store1, store2):
        merged_store = store1.copy()
        for key in store1.keys():
            if store1[key] == "" and store2[key] != "":
                merged_store[key] = store2[key]
        return merged_store

    # 計算を行う関数
    def calculate_diff_and_ratio(data):
        def format_ratio(value):
            return f"{value}"
        
        if data['sales_total1'] != "" and data['sales_total2'] != "":
            data['sales_total_diff'] = data['sales_total1'] - data['sales_total2']
            try:
                ratio = round(data['sales_total1'] / data['sales_total2'] * 100, 2)
            except:
                ratio = ""
            data['sales_total_ab_ratio'] = format_ratio(ratio)
        
        if data['users1'] != "" and data['users2'] != "":
            data['users_total_diff'] = data['users1'] - data['users2']
            try:
                ratio = round(data['users1'] / data['users2'] * 100, 2)
            except:
                ratio = ""
            data['users_total_ab_ratio'] = format_ratio(ratio)
        
        if data['average_spend1'] != "" and data['average_spend2'] != "":
            data['average_spend_total_diff'] = data['average_spend1'] - data['average_spend2']
            try:
                ratio = round(data['average_spend1'] / data['average_spend2'] * 100, 2)
            except:
                ratio = ""
            data['average_spend_total_ab_ratio'] = format_ratio(ratio)
        
        if data['new_users1'] != "" and data['new_users2'] != "":
            data['new_users_total_diff'] = data['new_users1'] - data['new_users2']
            try:
                ratio = round(data['new_users1'] / data['new_users2'] * 100, 2)
            except:
                ratio = ""
            data['new_users_total_ab_ratio'] = format_ratio(ratio)
        
        if data['other_sales_total1'] != "" and data['other_sales_total2'] != "":
            data['other_sales_total_diff'] = data['other_sales_total1'] - data['other_sales_total2']
            try:
                ratio = round(data['other_sales_total1'] / data['other_sales_total2'] * 100, 2)
            except:
                ratio = ""
            data['other_sales_total_ab_ratio'] = format_ratio(ratio)

        return data

    # 日数の少ない方に合わせてループ処理を行う
    min_days = len(json1["店舗データ"])
    
    merged_store_data = []
    for i in range(min_days):
        # json1とjson2の店舗リストからユニークなbase_noを取得
        json1_date = json1["店舗データ"][i]
        json2_date = json2["店舗データ"][i]
        
        merged_store = merge_store_data(json1_date, json2_date)
        calculated_store = calculate_diff_and_ratio(merged_store)
        merged_store_data.append(calculated_store)

    # 合計データの統合
    merged_total = merge_total_data(json1["合計"], json2["合計"])
    merged_total = calculate_diff_and_ratio(merged_total)

    # 統合されたJSONを生成
    merged_json = {
        "合計": merged_total,
        "店舗データ": merged_store_data
    }

    return merged_json


def format_data(data):
    # カンマを付けるための関数
    def format_with_comma(value):
        if isinstance(value, (int, np.int64)):  # 数値型かどうかをチェック
            return "{:,}".format(value)

    # 小数点第三位で四捨五入し、カンマを付ける関数
    def format_float(value):
        if isinstance(value, (float, np.float64)):  # 数値型かどうかをチェック
            return "{:,.2f}".format(round(value, 2))

    # int型に変換し、カンマを付ける関数
    def format_int(value):
        return "{:,}".format(int(value))

    # データ項目1の処理
    data_items_1 = [
        "sales_total1", "sales_total2", "sales_total_diff", 
        "users1", "users2", "users_total_diff", 
        "new_users1", "new_users2", "new_users_total_diff"
    ]
    for item in data_items_1:
        data["合計"][item] = format_with_comma(data["合計"][item])
        for store_data in data["店舗データ"]:
            store_data[item] = format_with_comma(store_data[item])
            
    # Nullを空文字に変換する関数
    def replace_null_with_empty_string(value):
        if value is None:
            return ""
        return value
    
    # データ項目3の処理
    data_items_3 = [
        "average_spend1", "average_spend2", "average_spend_total_diff"
    ]
    for item in data_items_3:
        data["合計"][item] = format_float(data["合計"][item])
        for store_data in data["店舗データ"]:
            store_data[item] = format_float(store_data[item])

    # データ項目4の処理
    data_items_4 = [
        "other_sales_total1", "other_sales_total2", "other_sales_total_diff"
    ]
    for item in data_items_4:
        if data["合計"][item] != "":
            data["合計"][item] = format_int(data["合計"][item])
        for store_data in data["店舗データ"]:
            if store_data[item] != "":
                store_data[item] = format_int(store_data[item])

    # Null値を空文字に変換
    for key, value in data["合計"].items():
        data["合計"][key] = replace_null_with_empty_string(value)

    for store_data in data["店舗データ"]:
        for key, value in store_data.items():
            store_data[key] = replace_null_with_empty_string(value)
    return data

def main(params):
    # パラメータ取得
    view_type, start_date, end_date, comparison_start_date, comparison_end_date, selected_store, prefecture_type, business_type, store_location, include_sales = get_parameter(params)  

    # 店舗フィルター
    selected_store = store_filter_conditions(selected_store, business_type, store_location)
    
    # access_database用
    only_selected_store = ','.join(map(str, [i[0] for i in selected_store]))
    # 店舗名2含む
    store_info_list_str = [[str(item[0]), item[1]] for item in selected_store]
    
    # # 日別店舗別分岐
    # ### 比較期間なし
    if comparison_start_date == "" and comparison_end_date == "":
        if view_type == "店舗別":
            sales_df, new_df, other_df = access_database(only_selected_store, start_date, end_date)
            output_data1               = process_store1_data(sales_df, new_df, other_df, include_sales, store_info_list_str)
            output                     = format_data(output_data1)
            return output

        elif view_type == "日別":
            sales_df, new_df, other_df = access_database(only_selected_store, start_date, end_date)
            output_data1               = process_date1_data(sales_df, new_df, other_df, include_sales, store_info_list_str)
            output                     = format_data(output_data1)
            return output
            
    ### 比較期間あり
    elif comparison_start_date != "" and comparison_end_date != "":
        start_date, end_date, comparison_start_date, comparison_end_date = adjust_date_ranges(start_date, end_date, comparison_start_date, comparison_end_date)
        if view_type == "店舗別":
            # 期間1
            sales_df, new_df, other_df = access_database(only_selected_store, start_date, end_date)
            output_data1               = process_store1_data(sales_df, new_df, other_df, include_sales, store_info_list_str)
            # 期間2
            sales_df, new_df, other_df = access_database(only_selected_store, comparison_start_date, comparison_end_date)
            output_data2               = process_store2_data(sales_df, new_df, other_df, include_sales, store_info_list_str)
            # 統合
            output_data                = store_merge_and_calculate_data(output_data1, output_data2)
            output                     = format_data(output_data)
            return output
            
        elif view_type == "日別":
            # 期間1
            sales_df, new_df, other_df = access_database(only_selected_store, start_date, end_date)
            output_json1               = process_date1_data(sales_df, new_df, other_df, include_sales, store_info_list_str)
            # 期間2
            sales_df, new_df, other_df = access_database(only_selected_store, comparison_start_date, comparison_end_date)
            output_json2               = process_date2_data(sales_df, new_df, other_df, include_sales, store_info_list_str)
            # 統合
            output_data                = date_merge_and_calculate_data(output_json1, output_json2)
            output                     = format_data(output_data)
            return output
# if __name__ == "__main__":
    # app.run()
#     param = {
#         "displayType": "店舗別", # 日別or店舗別
#         "range": {
#             "start": "2018-01-01", # 比較期間S
#             "end": "2018-01-30"    # 比較期間E
#         },
#         "comparisonRange": {
#             "start": "", # 比較期間S
#             "end": ""    # 比較期間E
#         },
#         "storeSelection": {
#             "selectedStore": "1357, 1243", # 対象店舗
#             # "selectedStore": "1357, 1243, 1331, 1332, 1336, 1337, 1347, 1376, 1510, 1525, 1527, 1652, 1656, 1660, 1856, 1898, 1342", # 対象店舗
#             "prefecture": "" # 要らない？
#         },
#         "otherConditions": { 
#             "businessType": "全て", # 対象店舗
#             "storeLocation": "全て" # その他条件
#         },
#         "includeSales": "True" # その他売上込み
#     }    
#     main(param)