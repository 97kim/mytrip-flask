from flask import Flask, render_template, jsonify, request

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.myTrip

from datetime import datetime

import requests
import xmltodict
import json

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/near', methods=['POST'])
def near_place():
    lat_receive = request.form['lat_give']
    lng_receive = request.form['lng_give']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
    }

    key = 'yCqnJOVAESt5GI4cFvYqIuJ562aLN9%2BveH4QHFaOK2s%2Bs5yOmc6eAkAcPcOb5eZPp9VdX1Wct%2ByF78ZlquNDlQ%3D%3D'

    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey={key}&contentTypeId=12&mapX={lng_receive}&mapY={lat_receive}&radius=4000&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=12&pageNo=1'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    jsonDump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    jsonBody = json.loads(jsonDump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    nearList = jsonBody['response']['body']['items']['item']

    print(nearList)

    return jsonify({'nearList': nearList})

@app.route('/diary', methods=['GET'])
def show_diary():
    diaries = list(db.diary.find({}, {'_id': False}))
    return jsonify({'all_diary': diaries})

@app.route('/diary', methods=['POST'])
def save_diary():
    title_receive = request.form['title_give']
    content_receive = request.form['content_give']

    file = request.files["file_give"]

    extension = file.filename.split('.')[-1] # -1은 "가장 마지막 .을 선택"의 의미

    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d-%H-%M-%S')

    filename = f'file={mytime}'

    save_to = f'static/{filename}.{extension}'
    file.save(save_to)

    doc = {
        'title': title_receive,
        'content': content_receive,
        'file': f'{filename}.{extension}'
    }

    db.diary.insert_one(doc)

    return jsonify({'msg': '추천 완료!'})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)