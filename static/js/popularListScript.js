//popularList 에서 content 수량 입력 받기
function PopularPlaceQuantity(quantity) {
//    타임어택 4차 테스트 답안 참고 예정
}

// 추천여행지 출력
function PopularList() {
    $('#popular_card').empty();

    let cat1 = 'C01';
    let cat2 = 'C0112';
    let cat3 = 'C01120001';
    let contenttypeid = 25;

    $.ajax({
            type: "POST",
            url: "/popular/list",
            data: {cat1: cat1, cat2: cat2, cat3: cat3, contenttypeid: contenttypeid},
            success: function (response) {
                $('.before-render').hide();
                $('#popular_card').empty();
                let popular_list = response['popular_list'];
                console.log(popular_list);

                // popularListScript 정보 전달용
                let cat1 = response['cat1']
                let cat2 = response['cat2']
                let cat3 = response['cat3']
                let contentTypeId = response['contentTypeId']

                sessionStorage.setItem('cat1', cat1);
                sessionStorage.setItem('cat2', cat2);
                sessionStorage.setItem('cat3', cat3);
                sessionStorage.setItem('contenttypeid', contentTypeId);

                //세션 스토리지 값에 객체 형태로 여러 개 넣기 위해 생성
                let obj = {};

                for (let i = 0; i < popular_list.length; i++) {
                    let content_id = popular_list[i]['contentid'];
                    let title = popular_list[i]['title'];
                    let file = popular_list[i]['firstimage'];
                    if (!file)
                        file = "https://dk9q1cr2zzfmc.cloudfront.net/img/noImage.png";
                    let areacode = parseInt(popular_list[i]['areacode']);
                    let address = check_address(areacode);
                    let mapx = popular_list[i]['mapx'];
                    let mapy = popular_list[i]['mapy'];
                    if (!mapx || !mapy) {
                        mapx = 0;
                        mapy = 0;
                    }
                    obj[content_id] = {
                        'title': title,
                        'address': address,
                        'file': file,
                        'place_lat': mapy,
                        'place_lng': mapx
                    }

                    let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                 <a href="/popular/place/${content_id}" class="card">
                                    <img src="${file}" class="card__image" alt="내 위치 근처 여행지 사진"/>
                                    <div class="card__overlay">
                                        <div class="card__header">
                                            <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                <path/>
                                            </svg>
                                            <img class="card__thumb" src="${file}" alt="썸네일"/>
                                            <div class="card__header-text">
                                                <h3 class="card__title">${title}</h3>
                                                <span class="card__status">${address}</span>
                                            </div>
                                        </div>
                                        <p class="card__description" ></p>
                                    </div>
                                </a>
                            </li>`;
                    $('#popular_card').append(temp_html);
                }
                sessionStorage.setItem('popular_object', JSON.stringify(obj));
            }
        }
    )
}


function check_address(code) {
    if (code === 1) {
        code = '서울'
    } else if (code === 2) {
        code = '인천'
    } else if (code === 3) {
        code = '대전'
    } else if (code === 4) {
        code = '대구'
    } else if (code === 5) {
        code = '광주'
    } else if (code === 6) {
        code = '부산'
    } else if (code === 7) {
        code = '울산'
    } else if (code === 8) {
        code = '세종특별자치시'
    } else if (code === 31) {
        code = '경기도'
    } else if (code === 32) {
        code = '강원도'
    } else if (code === 33) {
        code = '충청북도'
    } else if (code === 34) {
        code = '충청남도'
    } else if (code === 35) {
        code = '경상북도'
    } else if (code === 36) {
        code = '경상남도'
    } else if (code === 37) {
        code = '전라북도'
    } else if (code === 38) {
        code = '전라남도'
    } else if (code === 39) {
        code = '제주도'
    }
    return code
}
