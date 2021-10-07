import os

from flask import Flask, render_template, jsonify, request, redirect, url_for
import jwt, hashlib
from pymongo import MongoClient
import requests
import xmltodict
import json
from datetime import datetime, timedelta
# python-dotenv 라이브러리 설치
from dotenv import load_dotenv

app = Flask(__name__)

# .env 파일 만들어서 외부 노출 방지
load_dotenv(verbose=True)
OPEN_API_KEY = os.getenv('OPEN_API_KEY')
DB_INFO = os.getenv('DB_INFO')
DB_PORT = os.getenv('DB_PORT')
REQUEST_URL = os.getenv('REQUEST_URL')

SECRET_KEY = 'SPARTA'

client = MongoClient(DB_INFO, int(DB_PORT))
db = client.myTrip


@app.route('/')
def login():
    msg = request.args.get("msg")
    return render_template('index.html', msg=msg)


@app.route('/user/<username>')
def user(username):
    # 각 사용자의 프로필과 글을 모아볼 수 있는 공간
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        status = (username == payload["id"])  # 내 프로필이면 True, 다른 사람 프로필 페이지면 False

        user_info = db.users.find_one({"username": username}, {"_id": False})
        return render_template('user.html', user_info=user_info, status=status)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@app.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']

    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'username': username_receive, 'password': pw_hash})

    if result is not None:
        payload = {
            'id': username_receive,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        # token 관련 오류 시 .decode('utf-8') 활성화
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')  # .decode('utf-8')

        return jsonify({'result': 'success', 'token': token})
    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


@app.route('/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "username": username_receive,  # 아이디
        "password": password_hash,  # 비밀번호
        "profile_name": username_receive,  # 프로필 이름 기본값은 아이디
        "profile_pic": "",  # 프로필 사진 파일 이름
        "profile_pic_real": "profile_pics/profile_placeholder.png",  # 프로필 사진 기본 이미지
        "profile_info": ""  # 프로필 한 마디
    }
    print(password_receive)
    print(password_hash)
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})


@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    username_receive = request.form['username_give']
    exists = bool(db.users.find_one({"username": username_receive}))
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/main', methods=['GET'])
def main():
    return render_template('main.html')


@app.route('/near', methods=['POST'])
def get_near_place():
    lat_receive = request.form['lat_give']
    lng_receive = request.form['lng_give']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36(KHTML, like Gecko) '
                      'Chrome/73.0.3683.86 Safari/537.36'
    }

    url = f'{REQUEST_URL}?ServiceKey={OPEN_API_KEY}&contentTypeId=12&mapX={lng_receive}&mapY={lat_receive}' \
          '&radius=4000&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=E&numOfRows=10&pageNo=1'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    near_list = json_body['response']['body']['items']['item']

    return jsonify({'near_list': near_list})


@app.route('/near/list', methods=['POST'])
def get_near_type():
    lat_receive = request.form['lat_give']
    lng_receive = request.form['lng_give']
    type_receive = request.form['type_give']

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
          '&radius=5000&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=E&numOfRows=40&pageNo=1'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    json_dump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    json_body = json.loads(json_dump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    near_list = json_body['response']['body']['items']['item']

    return jsonify({'near_list': near_list})


@app.route('/near/place', methods=['GET'])
def get_near_detail():
    return render_template('nearDetail.html')


@app.route('/near/list', methods=['GET'])
def get_near_list():
    return render_template('nearList.html')


@app.route('/trips/place', methods=['GET'])
def get_trips_detail():
    return render_template('tripsDetail.html')


@app.route('/trips/place', methods=['POST'])
def trips_detail():
    trip_id_receive = request.form['trip_id_give']

    trip = db.trips.find_one({'id': int(trip_id_receive)}, {'_id': False})

    trip['date'] = trip['date'].strftime('%Y.%m.%d')

    return jsonify({'title': trip['title'], 'place': trip['place'], 'review': trip['review'], 'file': trip['file'],
                    'date': trip['date'], 'like': trip['like']})


@app.route('/trips/list', methods=['GET'])
def get_trips_list():
    return render_template('tripsList.html')


@app.route('/trips/form', methods=['GET'])
def write():
    trip_id = request.args.get('id')
    if trip_id is not None:
        return render_template('update.html')

    return render_template('write.html')


@app.route('/trips/update', methods=['GET'])
def update():
    trip_id = request.args.get('id')
    trip = db.trips.find_one({'id': int(trip_id)}, {'_id': False})

    title = trip['title']
    place = trip['place']
    review = trip['review']
    file = trip['file']

    return jsonify({'title': title, 'place': place, 'review': review, 'file': file})


@app.route('/trips', methods=['POST'])
def write_trip():
    trip_title_receive = request.form['title_give']
    trip_place_receive = request.form['place_give']
    trip_review_receive = request.form['review_give']
    trip_file = request.files["file_give"]

    today = datetime.now()
    time = today.strftime('%Y-%m-%d-%H-%M-%S')

    filename = f'file-{time}'
    extension = trip_file.filename.split('.')[-1]

    save_to = f'static/img/{filename}.{extension}'
    trip_file.save(save_to)

    doc = {
        'id': db.trips.count() + 1,
        'title': trip_title_receive,
        'place': trip_place_receive,
        'review': trip_review_receive,
        'file': f'{filename}.{extension}',
        'date': today,
        'like': 0
    }

    db.trips.insert_one(doc)
    return jsonify({'msg': '작성 완료!'})


# 정렬
@app.route('/trips', methods=['GET'])
def show_trips():
    sort_type = request.args.get('sort')

    if sort_type == 'date':
        all_trips = list(db.trips.find({}, {'_id': False}).sort("date", -1))
    else:
        all_trips = list(db.trips.find({}, {'_id': False}).sort("like", -1))

    for trips in all_trips:
        trips['date'] = trips['date'].strftime('%Y.%m.%d')

    return jsonify({'all_trips': all_trips})


@app.route('/trips/like', methods=['POST'])
def like_place():
    trip_id_receive = request.form['trip_id_give']

    target_id = db.trips.find_one({'id': int(trip_id_receive)}, {'_id': False})

    current_like = target_id['like']
    new_like = current_like + 1

    db.trips.update_one({'id': int(trip_id_receive)}, {'$set': {'like': new_like}})

    return jsonify({'msg': '좋아요 완료!'})


@app.route('/trips/like', methods=['GET'])
def get_like():
    trip_id_receive = request.args.get('id')

    like = db.trips.find_one({'id': int(trip_id_receive)}, {'_id': False})

    return jsonify({'like': like['like']})


@app.route('/trips/<trip_id>', methods=['POST'])
def update_trip(trip_id):
    trip_title_receive = request.form['title_give']
    trip_place_receive = request.form['place_give']
    trip_review_receive = request.form['review_give']
    trip_file_receive = request.files['file_give']

    today = datetime.now()
    time = today.strftime('%Y-%m-%d-%H-%M-%S')

    filename = f'file-{time}'
    extension = trip_file_receive.filename.split('.')[-1]

    save_to = f'static/img/{filename}.{extension}'
    trip_file_receive.save(save_to)

    db.trips.update_one({'id': int(trip_id)}, {
        '$set': {
            'title': trip_title_receive, 'place': trip_place_receive, 'review': trip_review_receive,
            'file': f'{filename}.{extension}', 'date': today
        }
    })

    return jsonify({'msg': '수정 완료!'})


@app.route('/trips', methods=['DELETE'])
def delete_trip():
    trip_id_receive = request.form['trip_id_give']

    db.trips.delete_one({'id': int(trip_id_receive)})
    return jsonify({'msg': '삭제 완료!'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
