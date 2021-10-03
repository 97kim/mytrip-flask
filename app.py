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
REQUEST_URL = os.getenv('REQUEST_URL')

client = MongoClient('localhost', 27017)
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
    review_id = request.args.get('review_id')
    if review_id is not None:
        return render_template('update.html')

    return render_template('write.html')


@app.route('/trips/update', methods=['GET'])
def update():
    review_id = request.args.get('review_id')
    review_list = list(db.trips.find({'review_id': int(review_id)}, {'_id': False}))

    review_title = review_list[0]['review_title']
    review_place = review_list[0]['review_place']
    review_review = review_list[0]['review_content']
    review_file = review_list[0]['review_file']

    return jsonify({'review_title': review_title, 'review_place': review_place, 'review_content': review_review,
                    'review_file': review_file})


@app.route('/trips', methods=['POST'])
def write_trip():
    review_title_receive = request.form['review_title_give']
    review_place_receive = request.form['review_place_give']
    review_content_receive = request.form['review_content_give']
    review_file = request.files["review_file_give"]

    today = datetime.now()
    time = today.strftime('%Y-%m-%d-%H-%M-%S')
    date = today.strftime('%Y.%m.%d')

    filename = f'file-{time}'
    extension = review_file.filename.split('.')[-1]

    save_to = f'static/img/{filename}.{extension}'
    review_file.save(save_to)

    doc = {
        'review_id': db.trips.count() + 1,
        'review_title': review_title_receive,
        'review_place': review_place_receive,
        'review_content': review_content_receive,
        'review_file': f'{filename}.{extension}',
        'review_date': date
    }

    db.trips.insert_one(doc)
    return jsonify({'msg': '작성 완료!'})


@app.route('/trips', methods=['GET'])
def show_trips():
    all_trips = list(db.trips.find({}, {'_id': False}))

    return jsonify({'all_trips': all_trips})


@app.route('/trips/<review_id>', methods=['POST'])
def update_trip(review_id):
    review_title_receive = request.form['review_title_give']
    review_place_receive = request.form['review_place_give']
    review_content_receive = request.form['review_content_give']
    review_file_receive = request.files['review_file_give']

    today = datetime.now()
    time = today.strftime('%Y-%m-%d-%H-%M-%S')
    date = today.strftime('%Y.%m.%d')

    filename = f'file-{time}'
    extension = review_file_receive.filename.split('.')[-1]

    save_to = f'static/img/{filename}.{extension}'
    review_file_receive.save(save_to)

    db.trips.update_one({'review_id': int(review_id)}, {
        '$set': {
            'review_title': review_title_receive, 'review_place': review_place_receive,
            'review_content': review_content_receive, 'review_file': f'{filename}.{extension}',
            'review_date': date
        }
    })

    return jsonify({'msg': '수정 완료!'})


@app.route('/trips', methods=['DELETE'])
def delete_trip():
    review_id_receive = request.form['review_id_give']

    db.trips.delete_one({'review_id': int(review_id_receive)})
    return jsonify({'msg': '삭제 완료!'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
