import os

from flask import Flask, render_template, jsonify, request, redirect, url_for
# from flask_cors import CORS
from pymongo import MongoClient
import requests
import xmltodict
import json
import jwt
import hashlib
import random
import boto3
from datetime import datetime, timedelta
# python-dotenv 라이브러리 설치
from dotenv import load_dotenv
# mongoDB에서 String을 ObjectId으로 변환시키기 위함
from bson import ObjectId

application = Flask(__name__)
# cors = CORS(application, resources={r"/*": {"origins": "*"}})

# .env 파일 만들어서 외부 노출 방지
load_dotenv(verbose=True)
OPEN_API_KEY = os.getenv('OPEN_API_KEY')
DB_INFO = os.getenv('DB_INFO')
DB_PORT = os.getenv('DB_PORT')
REQUEST_URL = os.getenv('REQUEST_URL')

WEATHER_URL = os.getenv('WEATHER_URL')
WEATHER_KEY = os.getenv('WEATHER_KEY')
SECRET_KEY = os.getenv('SECRET_KEY')

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
BUCKET_NAME = os.getenv('BUCKET_NAME')
COVID_KEY = os.getenv('COVID_KEY')

client = MongoClient(DB_INFO, int(DB_PORT))
db = client.myTrip


# 로그인 페이지
@application.route('/')
def login():
    msg = request.args.get("msg")
    return render_template('index.html', msg=msg)


@application.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']

    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'username': username_receive, 'password': pw_hash})

    # 로그인 활성화 시간
    if result is not None:
        payload = {
            'id': username_receive,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)
        }
        # 로그인 성공 시 token 발급, 해당 부분 오류 발생 시 .decode('utf-8') 활성화
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')  # .decode('utf-8')
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


@application.route('/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "username": username_receive,  # 아이디
        "password": password_hash,  # 비밀번호
        "nickname": username_receive,  # 처음에는 아이디로 닉네임 설정하고 프로필 설정에서 변경 가능
        "profile_img": 'default_img.png'  # 처음에는 기본 이미지로 설정하고 프로필 설정에서 변경 가능
    }
    db.users.insert_one(doc)

    return jsonify({'result': 'success'})


@application.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    username_receive = request.form['username_give']
    exists = bool(db.users.find_one({"username": username_receive}))
    return jsonify({'result': 'success', 'exists': exists})


# main.html 렌더링

def main():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('main.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# main.html 렌더링
@application.route('/main', methods=['GET'])
def main():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('main.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))  # main.html 렌더링


@application.route('/near', methods=['POST'])
def get_near_place():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])

        if payload:
            lat_receive = request.form['lat_give']
            lng_receive = request.form['lng_give']

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                              'Chrome/73.0.3683.86 Safari/537.36'
            }

            url = f'{REQUEST_URL}?ServiceKey={OPEN_API_KEY}&contentTypeId=12&mapX={lng_receive}' \
                  f'&mapY={lat_receive}&radius=4000&listYN=Y&MobileOS=ETC' \
                  f'&MobileApp=TourAPI3.0_Guide&arrange=E&numOfRows=10&pageNo=1'

            r = requests.get(url, headers=headers)

            dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
            json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
            json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

            near_list = json_body['response']['body']['items']['item']
            return jsonify({'near_list': near_list})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


# main.html 랜덤으로 6가지 추천 여행지 띄어주기
@application.route('/popular/trips', methods=['POST'])
def get_popular_trips():
    info = random.randrange(1, 7)
    cat1 = 'C01'
    content_quantity = 13
    content_type_id = 25
    if info == 1:
        cat2 = 'C0112'
        cat3 = 'C01120001'
        trip_theme = '가족 '
    elif info == 2:
        cat2 = 'C0113'
        cat3 = 'C01130001'
        trip_theme = '나홀로 '
    elif info == 3:
        cat2 = 'C0114'
        cat3 = 'C01140001'
        trip_theme = '힐링 '
    elif info == 4:
        cat2 = 'C0115'
        cat3 = 'C01150001'
        trip_theme = '걷기 좋은 '
    elif info == 5:
        cat2 = 'C0116'
        cat3 = 'C01160001'
        trip_theme = '캠핑 '
    elif info == 6:
        cat2 = 'C0117'
        cat3 = 'C01170001'
        trip_theme = '맛집 '

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }
    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaBasedList?serviceKey={OPEN_API_KEY}&pageNo=1' \
          f'&numOfRows={content_quantity}&MobileApp=trips&MobileOS=ETC&arrange=P&cat1={cat1}' \
          f'&contentTypeId={content_type_id}&cat2={cat2}&cat3={cat3}&listYN=Y'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    popular_list = json_body['response']['body']['items']['item']

    return jsonify(
        {'popular_list': popular_list, 'trip_theme': trip_theme, 'content_type_id': content_type_id, 'cat1': cat1,
         'cat2': cat2, 'cat3': cat3})


# popularList.html 에서 추천 여행지 출력하기
@application.route('/popular/list', methods=['POST'])
def get_popular_trips2():
    content_quantity = request.form['quantity']
    cat1 = request.form['cat1']
    cat2 = request.form['cat2']
    cat3 = request.form['cat3']
    content_type_id = request.form['content_type_id']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }
    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/areaBasedList?serviceKey={OPEN_API_KEY}&pageNo=1' \
          f'&numOfRows={content_quantity}&MobileApp=trips&MobileOS=ETC&arrange=P&cat1={cat1}' \
          f'&contentTypeId={content_type_id}&cat2={cat2}&cat3={cat3}&listYN=Y'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    popular_list = json_body['response']['body']['items']['item']

    return jsonify(
        {'popular_list': popular_list, 'content_type_id': content_type_id, 'cat1': cat1, 'cat2': cat2, 'cat3': cat3})


# popularDetail.html 렌더링
@application.route('/popular/place/<content_id>', methods=['GET'])
def get_popular_detail(content_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('popularDetail.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# nearDetail.html 추천 여행지 상세정보 출력 : 개장일, 쉬는날, 이용시기, 이용시간, 주차시설 등
@application.route('/popular/place/intro', methods=['POST'])
def get_popular_detail_intro():
    content_id_receive = request.form['content_id_give']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }

    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailCommon?ServiceKey={OPEN_API_KEY}&' \
          f'contentId={content_id_receive}&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&firstImageYN=Y&' \
          f'areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    detail_intro_list = json_body['response']['body']['items']['item']

    return jsonify({'detail_intro_list': detail_intro_list})


# 인기있는 여행지 날씨 불러오기
@application.route('/popular/place/weather', methods=['POST'])
def get_weather_popular():
    place_lat = request.form['place_lat']
    place_lng = request.form['place_lng']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }

    url = f'{WEATHER_URL}?lat={place_lat}&lon={place_lng}&appid={WEATHER_KEY}&units=metric'

    r = requests.get(url, headers=headers)

    weather_info_popular = json.loads(r.text)  # json 문자열을 파이썬 객체(딕셔너리)로 변환
    return jsonify({'weather_info_popular': weather_info_popular})


# 즐겨찾기 기능 - 누가 어떤 여행지를 즐겨찾기 했는지 db에 저장_popular
@application.route("/popular/place/bookmark", methods=['POST'])
def bookmark_popular():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        content_id_receive = request.form['content_id_give']
        action_receive = request.form['action_give']
        title_receive = request.form['title_give']
        file_receive = request.form['file_give']

        doc = {
            'content_id': content_id_receive,
            'username': user_info['username'],
            'title': title_receive,
            'file': file_receive
        }

        if action_receive == "uncheck":
            db.bookmark_popular.delete_one(doc)
        else:
            db.bookmark_popular.insert_one(doc)

        return jsonify({"result": "success"})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


# 즐겨찾기 된 아이디 전송
@application.route('/popular/bookmark', methods=['POST'])
def give_popular_bookmarks_id():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        all_bookmarks = list(db.bookmark_popular.find({"username": user_info["username"]}, {"_id": False}))

        return jsonify({"all_bookmarks": all_bookmarks})
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# 즐겨찾기한 게시글은 나갔다 들어와도 즐겨찾기로 표시_popular
@application.route('/popular/place/bookmark/<content_id>', methods=['GET'])
def get_bookmark_popular(content_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        bookmark_status = bool(
            db.bookmark_popular.find_one({"content_id": content_id, "username": user_info["username"]}))

        return jsonify({"bookmark_status": str(bookmark_status)})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


# 인기 여행지 더보기 html 렌더링
@application.route('/popular/list', methods=['GET'])
def get_popular_near_place():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('popularList.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# nearList.html 렌더링
@application.route('/near/list', methods=['GET'])
def get_near_list():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('nearList.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# nearDetail.html 추천 여행지 상세정보 출력 : 개장일, 쉬는날, 이용시기, 이용시간, 주차시설 등
@application.route('/near/place/intro', methods=['POST'])
def get_near_detail_intro():
    content_id_receive = request.form['content_id_give']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }

    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailCommon?ServiceKey={OPEN_API_KEY}&' \
          f'contentId={content_id_receive}&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&firstImageYN=Y&' \
          f'areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    detail_intro_list = json_body['response']['body']['items']['item']

    return jsonify({'detail_intro_list': detail_intro_list})


# nearList.html에 리스트 출력
@application.route('/near/list', methods=['POST'])
def get_near_type():
    lat_receive = request.form['lat_give']
    lng_receive = request.form['lng_give']
    type_receive = request.form['type_give']
    quantity_receive = request.form['quantity_give']

    if type_receive == 'trip':
        type_code = 12
    elif type_receive == 'food':
        type_code = 39
    elif type_receive == 'accommodation':
        type_code = 32
    else:
        type_code = 15

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }

    url = f'{REQUEST_URL}?ServiceKey={OPEN_API_KEY}&contentTypeId={type_code}&mapX={lng_receive}&mapY={lat_receive}' \
          f'&radius=5000&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=E&numOfRows={quantity_receive}&' \
          f'pageNo=1'

    r = requests.get(url, headers=headers)


    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    near_list = json_body['response']['body']['items']['item']
    return jsonify({'near_list': near_list})


# nearDetail.html 렌더링
@application.route('/near/place/<content_id>', methods=['GET'])
def get_near_detail(content_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('nearDetail.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# 즐겨찾기 기능 - 누가 어떤 여행지를 즐겨찾기 했는지 db에 저장
@application.route("/near/place/bookmark", methods=['POST'])
def bookmark_near():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        content_id_receive = request.form['content_id_give']
        action_receive = request.form['action_give']
        title_receive = request.form['title_give']
        address_receive = request.form['address_give']
        file_receive = request.form['file_give']

        doc = {
            'content_id': content_id_receive,
            'username': user_info['username'],
            'title': title_receive,
            'address': address_receive,
            'file': file_receive
        }

        if action_receive == "uncheck":
            db.bookmark.delete_one(doc)
        else:
            db.bookmark.insert_one(doc)

        return jsonify({"result": "success"})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


# 즐겨찾기한 게시글은 나갔다 들어와도 즐겨찾기로 표시
@application.route('/near/place/bookmark/<content_id>', methods=['GET'])
def get_bookmark(content_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        bookmark_status = bool(db.bookmark.find_one({"content_id": content_id, "username": user_info["username"]}))

        return jsonify({"bookmark_status": str(bookmark_status)})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


# 즐겨찾기 페이지에서 모아보기
@application.route('/bookmark', methods=['GET'])
def show_bookmarks():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        return render_template('bookmarks.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# 즐겨찾기 된 아이디 전송
@application.route('/near/bookmark', methods=['POST'])
def give_bookmarks_id():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        all_bookmarks = list(db.bookmark.find({"username": user_info["username"]}, {"_id": False}))

        return jsonify({"all_bookmarks": all_bookmarks})
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="login_error."))


# 근처 여행지 날씨 불러오기
@application.route('/near/place/weather', methods=['POST'])
def get_weather():
    place_lat = request.form['place_lat']
    place_lng = request.form['place_lng']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }

    url = f'{WEATHER_URL}?lat={place_lat}&lon={place_lng}&appid={WEATHER_KEY}&units=metric'

    r = requests.get(url, headers=headers)

    weather_info = json.loads(r.text)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    return jsonify({'weather_info': weather_info})


# 리뷰 정렬
@application.route('/trips', methods=['GET'])
def show_trips():
    sort_type = request.args.get('sort')

    if sort_type == 'date':
        all_trips = list(db.trips.find({}).sort("date", -1))
    else:
        all_trips = list(db.trips.find({}).sort("like", -1))

    for trips in all_trips:
        trips['date'] = trips['date'].strftime('%Y.%m.%d')
        trips['_id'] = str(trips['_id'])

    return jsonify({'all_trips': all_trips})


# tripsList.html 렌더링
@application.route('/trips/list', methods=['GET'])
def get_trips_list():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('tripsList.html', user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# tripsDetail.html 렌더링
@application.route('/trips/place/<trip_id>', methods=['GET'])
def get_trips_detail(trip_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        trip = db.trips.find_one({"_id": ObjectId(trip_id)})

        status = (trip["username"] == payload["id"])
        return render_template('tripsDetail.html', user_info=user_info, status=status)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your_login_time_has_expired."))
    except jwt.exceptions.DecodeError:
        return render_template('tripsDetail.html')


@application.route('/trips/place/render', methods=['POST'])
def trips_detail():
    trip_id_receive = request.form['trip_id_give']

    trip = db.trips.find_one({'_id': ObjectId(trip_id_receive)}, {'_id': False})
    comment_count = db.comments.count_documents({'trip_id': ObjectId(trip_id_receive)})

    trip['date'] = trip['date'].strftime('%Y.%m.%d')

    return jsonify({'trip': trip, 'comment_count': comment_count})


# 상황에 따라 write.html(작성폼), update.html(수정폼) 렌더링
@application.route('/trips/form', methods=['GET'])
def write():
    token_receive = request.cookies.get('mytoken')
    trip_id = request.args.get('id')

    if trip_id is not None:
        try:
            payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
            user_info = db.users.find_one({"username": payload["id"]})
            return render_template('tripsUpdate.html', user_info=user_info)
        except jwt.ExpiredSignatureError:
            return redirect(url_for("login", msg="Your_login_time_has_expired."))
        except jwt.exceptions.DecodeError:
            return redirect(url_for("login", msg="login_error."))
    else:
        try:
            payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
            user_info = db.users.find_one({"username": payload["id"]})
            return render_template('write.html', user_info=user_info)
        except jwt.ExpiredSignatureError:
            return redirect(url_for("login", msg="Your_login_time_has_expired."))
        except jwt.exceptions.DecodeError:
            return redirect(url_for("login", msg="login_error."))


# 클라이언트에서 세션 스토리지에 저장하기 위함
@application.route('/trips/session', methods=['POST'])
def update():
    trip_id_receive = request.form['trip_id_give']

    trip = db.trips.find_one({'_id': ObjectId(trip_id_receive)})

    title = trip['title']
    place = trip['place']
    review = trip['review']
    file = trip['file']

    return jsonify({'title': title, 'place': place, 'review': review, 'file': file})


# 리뷰 db에 저장
@application.route('/trips/place', methods=['POST'])
def write_trip():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        trip_title_receive = request.form['title_give']
        trip_place_receive = request.form['place_give']
        trip_review_receive = request.form['review_give']
        trip_file_receive = request.files["file_give"]

        today = datetime.now()
        time = today.strftime('%Y-%m-%d-%H-%M-%S')

        filename = f'file-{time}'
        extension = trip_file_receive.filename.split('.')[-1]

        full_file_name = f'{filename}.{extension}'

        # boto3(aws s3에 올리기)
        s3 = boto3.client('s3',
                          aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                          )
        s3.put_object(
            ACL="public-read",
            Bucket=BUCKET_NAME,
            Body=trip_file_receive,
            Key='trips/' + full_file_name,  # 버킷 내 trips 폴더에 저장
            ContentType=trip_file_receive.content_type
        )

        doc = {
            # 'id': db.trips.count() + 1,
            'title': trip_title_receive,
            'place': trip_place_receive,
            'review': trip_review_receive,
            'file': full_file_name,
            'date': today,
            'username': user_info['username'],
            'nickname': user_info['nickname'],
            'profile_img': user_info['profile_img'],
            'like': 0
        }

        db.trips.insert_one(doc)
        return jsonify({'msg': '작성 완료!'})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


# 리뷰 수정
@application.route('/trips/place/<trip_id>', methods=['PUT'])
def update_trip(trip_id):
    trip_title_receive = request.form['title_give']
    trip_place_receive = request.form['place_give']
    trip_review_receive = request.form['review_give']

    new_doc = {
        'title': trip_title_receive,
        'place': trip_place_receive,
        'review': trip_review_receive
    }

    if 'file_give' in request.files:
        trip_file_receive = request.files['file_give']

        today = datetime.now()
        time = today.strftime('%Y-%m-%d-%H-%M-%S')

        filename = f'file-{time}'
        extension = trip_file_receive.filename.split('.')[-1]

        full_file_name = f'{filename}.{extension}'

        # boto3(aws s3에 올리기)
        s3 = boto3.client('s3',
                          aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                          )
        s3.put_object(
            ACL="public-read",
            Bucket=BUCKET_NAME,
            Body=trip_file_receive,
            Key='trips/' + full_file_name,  # 버킷 내 trips 폴더에 저장
            ContentType=trip_file_receive.content_type
        )

        new_doc['file'] = full_file_name

    db.trips.update_one({'_id': ObjectId(trip_id)}, {'$set': new_doc})

    return jsonify({'msg': '수정 완료!'})


# 리뷰 삭제
@application.route('/trips/place/<trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    trip_file = db.trips.find_one({'_id': ObjectId(trip_id)})['file']

    # s3에서 삭제
    s3 = boto3.resource('s3')
    s3.Object(BUCKET_NAME, f'trips/{trip_file}').delete()

    # db에서 삭제
    db.trips.delete_one({'_id': ObjectId(trip_id)})
    db.like.delete_many({'trip_id': ObjectId(trip_id)})
    db.comments.delete_many({'trip_id': ObjectId(trip_id)})
    return jsonify({'msg': '삭제 완료!'})


# 리뷰 좋아요 - 누가 어떤 리뷰를 좋아요 했는지 db에 저장
@application.route('/trips/place/like', methods=['POST'])
def like_place():
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        trip_id_receive = request.form['trip_id_give']
        action_receive = request.form['action_give']

        doc = {
            'trip_id': ObjectId(trip_id_receive),
            'username': user_info['username'],
        }

        total_like = db.trips.find_one({'_id': ObjectId(trip_id_receive)})['like']

        if action_receive == "uncheck":
            db.like.delete_one(doc)
            db.trips.update_one({'_id': ObjectId(trip_id_receive)}, {'$set': {'like': total_like - 1}})

        else:
            db.like.insert_one(doc)
            db.trips.update_one({'_id': ObjectId(trip_id_receive)}, {'$set': {'like': total_like + 1}})

        return jsonify({"result": "success"})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


# 좋아요한 게시글은 나갔다 들어와도 좋아요로 표시
@application.route('/trips/place/like/<trip_id>', methods=['GET'])
def get_like(trip_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        like_status = bool(db.like.find_one({"trip_id": ObjectId(trip_id), "username": user_info["username"]}))

        return jsonify({"like_status": str(like_status)})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


@application.route('/profile', methods=['POST'])
def save_profile():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})

        nickname_receive = request.form['nickname_give']

        new_doc = {
            'nickname': nickname_receive
        }

        if 'img_give' in request.files:
            img_receive = request.files['img_give']

            today = datetime.now()
            time = today.strftime('%Y-%m-%d-%H-%M-%S')

            filename = f"{user_info['username']}-{time}"
            extension = img_receive.filename.split('.')[-1]

            full_file_name = f'{filename}.{extension}'

            # boto3(aws s3에 올리기)
            s3 = boto3.client('s3',
                              aws_access_key_id=AWS_ACCESS_KEY_ID,
                              aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                              )
            s3.put_object(
                ACL="public-read",
                Bucket=BUCKET_NAME,
                Body=img_receive,
                Key='profile/' + full_file_name,  # 버킷 내 profile 폴더에 저장
                ContentType=img_receive.content_type
            )

            new_doc['profile_img'] = full_file_name

        # 프로필 사진 바꾸면 프로필 사진이 필요한 db 업데이트
        db.users.update_one({'username': user_info['username']}, {'$set': new_doc})
        db.trips.update_one({'username': user_info['username']}, {'$set': new_doc})
        db.comments.update_one({'username': user_info['username']}, {'$set': new_doc})
        return jsonify({'msg': '작성 완료!'})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


@application.route('/trips/place/comment/<trip_id>', methods=['POST'])
def comment(trip_id):
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        trip_id_receive = trip_id
        comment_receive = request.form['comment_give']
        date_receive = request.form['date_give']

        nickname = db.users.find_one({'username': user_info['username']})['nickname']
        profile_img = db.users.find_one({'username': user_info['username']})['profile_img']

        doc = {
            'trip_id': ObjectId(trip_id_receive),
            'username': user_info['username'],
            'nickname': nickname,
            'profile_img': profile_img,
            'comment': comment_receive,
            'date': date_receive
        }

        db.comments.insert_one(doc)
        return jsonify({'result': 'success'})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


@application.route('/trips/place/comment/<trip_id>', methods=['GET'])
def show_comments(trip_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        trip_id_receive = trip_id

        all_comments = list(db.comments.find({'trip_id': ObjectId(trip_id_receive)}, {'trip_id': False}).sort('date', -1))

        for comments in all_comments:
            comments['_id'] = str(comments['_id'])

        return jsonify({'all_comments': all_comments, 'now_user': payload['id']})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


@application.route('/trips/place/comment/<trip_id>', methods=['DELETE'])
def delete_comment(trip_id):
    token_receive = request.cookies.get('mytoken')

    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        trip_id_receive = trip_id
        comment_id_receive = ObjectId(request.form['comment_id'])

        db.comments.delete_one({'trip_id': ObjectId(trip_id_receive), '_id': comment_id_receive, 'username': payload['id']})

        return jsonify({'result': 'success'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("login"))


if __name__ == '__main__':
    application.debug = True
    application.run()
