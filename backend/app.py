from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user
from datetime import timedelta
import secrets

from login import login
from display import main

import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

app.secret_key = secrets.token_hex(32)  # セッションの暗号化に必要なキーを設定
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'

# Flask-Loginのセットアップ
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login_route"

CORS(app, resources={r"/*": {"origins": ["http://localhost", "http://localhost:3000"]}}, supports_credentials=True)

# ユーザークラス
class User(UserMixin):
    def __init__(self, id):
        self.id = id

# ログインマネージャーによるユーザーのロード
@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

# login-display
@app.route('/api/login', methods=['POST'])
def login_route():
    print("----- login successful ------")
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    logger.debug(f"Input : {username}, {password}")
    # logger.debug(f"Output : {result}")


    if username == "1" and password == "1":
        user = User(id=username)
        login_user(user)
        session.permanent = True
        app.permanent_session_lifetime = timedelta(minutes=25) # 25分でセッションを切る
        session['user_id'] = user.id
        return jsonify({"message": "Login successful", "status": 200})
    else:
        print("username & passwrd: failed")
    # else:
    #     return jsonify({"message": "Invalid credentials"}), 401    
# home-display
@app.route('/api/')
@login_required  # ルートアクセス時に認証されていない場合はログインページにリダイレクト
def index():
    print("----- index -------")
    return jsonify({"message": "Welcome to the home page!", "user": current_user.id})

@app.route('/api/display_by_store', methods=['POST'])
# @login_required  # このエンドポイントはログインが必要
def display_by_store(): # 店舗別データ表示    
    print("----- displya_by_store ------")
    try:
        request_data = request.get_json()
        response = main(request_data)
        return jsonify(response), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/display_by_date', methods=['POST'])
@login_required  # このエンドポイントはログインが必要
def display_by_date(): # 日別データ表示
    try:
        request_data = request.get_json()
        response = main(request_data)
        return jsonify(response), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
    
