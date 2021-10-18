function checkTheme(type, quantity) {
    type = parseInt(type)
    let cat1 = "C01";
    let cat2 = "";
    let cat3 = "";
    let content_type_id = "25";

    if (type === 1) {
        cat2 = 'C0112'
        cat3 = 'C01120001'
    } else if (type === 2) {
        cat2 = 'C0113'
        cat3 = 'C01130001'
    } else if (type === 3) {
        cat2 = 'C0114'
        cat3 = 'C01140001'
    } else if (type === 4) {
        cat2 = "C0115";
        cat3 = "C01150001";
    } else if (type === 5) {
        cat2 = "C0116";
        cat3 = "C01160001";
    } else if (type === 6) {
        cat2 = "C0117";
        cat3 = "C01170001";
    }
    // 정보 덮어쓰기
    sessionStorage.setItem('cat1', cat1);
    sessionStorage.setItem('cat2', cat2);
    sessionStorage.setItem('cat3', cat3);
    sessionStorage.setItem('content_type_id', content_type_id);
    popularList(quantity)
}

// 추천여행지 출력, 추천여행지 선택한 결과 출력
function popularList(quantity) {
    $('#popular_card').empty();
    // main.html 에서 가져온 정보들, main 의 정보를 그대로 list 창에서 보여주기 위함
    let cat1 = sessionStorage.getItem('cat1')
    let cat2 = sessionStorage.getItem('cat2')
    let cat3 = sessionStorage.getItem('cat3')
    let content_type_id = sessionStorage.getItem('content_type_id')

    $.ajax({
            type: "POST",
            url: "/popular/list",
            data: {quantity: quantity, cat1: cat1, cat2: cat2, cat3: cat3, content_type_id: content_type_id},
            success: function (response) {
                $('.before-render').hide();
                $('#popular_card').empty();
                let popular_list = response['popular_list'];

                let cat1 = response['cat1'];
                let cat2 = response['cat2'];
                let cat3 = response['cat3'];
                let content_type_id = response['content_type_id']

                sessionStorage.setItem('cat1', cat1);
                sessionStorage.setItem('cat2', cat2);
                sessionStorage.setItem('cat3', cat3);
                sessionStorage.setItem('content_type_id', content_type_id);

                // 중복 코드 제거 예정
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