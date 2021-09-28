from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
import requests
import xmltodict
import json
from datetime import datetime

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.myTrip


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/near', methods=['POST'])
def near_place():
    lat_receive = request.form['lat_give']
    lng_receive = request.form['lng_give']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
    }

    key = 'tvZKl3gQbwlUbUigX5R%2FmUNfkrT%2FacEC89WdQBGT7XmcGdbuD6n24S98%2B0b4VE0o28TGoIQMjARPyGGpvzpYpw%3D%3D'

    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey={key}&contentTypeId=12&mapX={lng_receive}&mapY={lat_receive}&radius=4000&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=E&numOfRows=10&pageNo=1'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    jsonDump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    jsonBody = json.loads(jsonDump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    nearList = jsonBody['response']['body']['items']['item']

    return jsonify({'nearList': nearList})


temp_dict = {}  # /near/place POST 요청에 받은 데이터를 담아 /near/place/<contentId> GET 요청에 보내주기 위한 용도


@app.route('/near/place', methods=['POST'])
def near_detail():
    title_receive = request.form['title_give']
    address_receive = request.form['address_give']
    file_receive = request.form['file_give']
    distance_receive = request.form['distance_give']
    placeLat_receive = request.form['placeLat_give']
    placeLng_receive = request.form['placeLng_give']
    contentId_receive = request.form['contentId_give']

    temp_dict[contentId_receive] = [title_receive, address_receive, file_receive, distance_receive, placeLat_receive,
                                    placeLng_receive]

    return jsonify({'result': 'success'})


@app.route('/near/place/<contentId>', methods=['GET'])
def get_near_detail(contentId):
    return render_template('nearDetail.html', tempList=temp_dict[contentId])


@app.route('/trips/form', methods=['GET'])
def write():
    if request.args.get('id') is not None:
        return render_template('update.html')

    return render_template('write.html')


@app.route('/trips', methods=['POST'])
def write_trip():
    title_receive = request.form['title_give']
    place_receive = request.form['place_give']
    review_receive = request.form['review_give']
    file = request.files["file_give"]

    print(title_receive, place_receive, review_receive, file)

    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
    date = today.strftime('%Y.%m.%d')

    filename = f'file-{mytime}'
    extension = file.filename.split('.')[-1]

    save_to = f'static/img/{filename}.{extension}'
    file.save(save_to)

    doc = {
        'id': db.trips.count() + 1,
        'title': title_receive,
        'place': place_receive,
        'review': review_receive,
        'file': f'{filename}.{extension}',
        'date': date
    }

    db.trips.insert_one(doc)
    return jsonify({'msg': '작성 완료!'})


@app.route('/trips', methods=['GET'])
def show_trips():
    all_trips = list(db.trips.find({}, {'_id': False}))

    return jsonify({'all_trips': all_trips})


@app.route('/trips/<id>', methods=['POST'])
def update_trip(id):

    trip_title_receive = request.form['title_give']
    trip_place_receive = request.form['place_give']
    trip_review_receive = request.form['review_give']
    trip_file_receive = request.files['file_give']

    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
    date = today.strftime('%Y.%m.%d')

    filename = f'file-{mytime}'
    extension = trip_file_receive.filename.split('.')[-1]

    save_to = f'static/img/{filename}.{extension}'
    trip_file_receive.save(save_to)

    db.trips.update_one({'id': int(id)}, {'$set': {'title': trip_title_receive, 'place': trip_place_receive, 'review': trip_review_receive, 'file': f'{filename}.{extension}', 'date': date}})

    return jsonify({'msg': '수정 완료!'})


@app.route('/trips', methods=['DELETE'])
def delete_trip():
    trip_id_receive = request.form['trip_id_give']

    db.trips.delete_one({'id': int(trip_id_receive)})
    return jsonify({'msg': '삭제 완료!'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
