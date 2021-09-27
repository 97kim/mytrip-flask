from flask import jsonify, Flask, render_template, request

import xmltodict, json, requests

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')


# @app.route('/data/api', methods=['GET'])
# def near_placea():
#     return jsonify({'nearList': 1})

@app.route('/data/api', methods=['POST'])
def near_place():
    x_data = request.form['x_give']
    y_data = request.form['y_give']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
    }

    key = '%2Ff3ZAfTuS%2FwfiJHp5nACc%2BipZ4OUTBiabrXkrlJceuDp5m7KO71rvOfO%2FOdCD39RbT349UP2P6CmcBDkxcR0LQ%3D%3D'

    url = f'http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey={key}&contentTypeId=&mapX=127.058143&mapY=37.289993&radius=2000&listYN=Y&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&arrange=E&numOfRows=12&pageNo=2'
    r = requests.get(url, headers=headers)

    dictionary = xmltodict.parse(r.text)  # xml을 파이썬 객체(딕셔너리)로 변환
    jsonDump = json.dumps(dictionary)  # 파이썬 객체(딕셔너리)를 json 문자열로 변환
    jsonBody = json.loads(jsonDump)  # json 문자열을 파이썬 객체(딕셔너리)로 변환

    nearList = jsonBody['response']['body']['items']['item']
    return jsonify({'nearList': nearList})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
