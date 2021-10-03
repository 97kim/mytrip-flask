import os

from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
import requests
import xmltodict
import json
from datetime import datetime
# python-dotenv 라이브러리 설치
from dotenv import load_dotenv

app = Flask(__name__)

# .env 파일 만들어서 외부 노출 방지
load_dotenv(verbose=True)
OPEN_API_KEY = os.getenv('OPEN_API_KEY')
DB_INFO = os.getenv('DB_INFO')
DB_PORT = os.getenv('DB_PORT')
REQUEST_URL = os.getenv('REQUEST_URL')

client = MongoClient(DB_INFO, int(DB_PORT))
db = client.myTrip


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


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


temp_dict = {}  # /near/place POST 요청에 받은 데이터를 담아 /near/place/<contentId> GET 요청에 보내주기 위한 용도


@app.route('/near/place', methods=['POST'])
def post_near_detail():
    title_receive = request.form['title_give']
    address_receive = request.form['address_give']
    file_receive = request.form['file_give']
    distance_receive = request.form['distance_give']
    place_lat_receive = request.form['place_lat_give']
    place_lng_receive = request.form['place_lng_give']
    content_id_receive = request.form['content_id_give']

    temp_dict[content_id_receive] = [title_receive, address_receive, file_receive, distance_receive,
                                     place_lat_receive, place_lng_receive]

    return jsonify({'result': 'success'})


@app.route('/near/place/<content_id>', methods=['GET'])
def get_near_detail(content_id):
    return render_template('nearDetail.html', temp_list=temp_dict[content_id])


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
    date = today.strftime('%Y.%m.%d')

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
        'date': date
    }

    db.trips.insert_one(doc)
    return jsonify({'msg': '작성 완료!'})


@app.route('/trips', methods=['GET'])
def show_trips():
    all_trips = list(db.trips.find({}, {'_id': False}))

    return jsonify({'all_trips': all_trips})


@app.route('/trips/<trip_id>', methods=['POST'])
def update_trip(trip_id):
    trip_title_receive = request.form['title_give']
    trip_place_receive = request.form['place_give']
    trip_review_receive = request.form['review_give']
    trip_file_receive = request.files['file_give']

    today = datetime.now()
    time = today.strftime('%Y-%m-%d-%H-%M-%S')
    date = today.strftime('%Y.%m.%d')

    filename = f'file-{time}'
    extension = trip_file_receive.filename.split('.')[-1]

    save_to = f'static/img/{filename}.{extension}'
    trip_file_receive.save(save_to)

    db.trips.update_one({'id': int(trip_id)}, {
        '$set': {
            'title': trip_title_receive, 'place': trip_place_receive, 'review': trip_review_receive,
            'file': f'{filename}.{extension}', 'date': date
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
