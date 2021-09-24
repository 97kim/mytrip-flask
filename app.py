from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
import requests
import xmltodict
import json

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.myTrip


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

    key = 'tvZKl3gQbwlUbUigX5R%2FmUNfkrT%2FacEC89WdQBGT7XmcGdbuD6n24S98%2B0b4VE0o28TGoIQMjARPyGGpvzpYpw%3D%3D'

    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey={key}&contentTypeId=12&mapX={lng_receive}6&mapY={lat_receive}&radius=4000&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=A&numOfRows=12&pageNo=1'

    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    jsonDump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    jsonBody = json.loads(jsonDump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    nearList = jsonBody['response']['body']['items']['item']

    return jsonify({'nearList': nearList})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
