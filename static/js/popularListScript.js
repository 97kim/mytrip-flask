//popularList 에서 테마여행지 입력 받기
function get_popular_trips2(type) {

}

// 추천여행지 출력
function geoInfoPopularList(content_quantity) {
    $('#popular_card').empty();
    // 기본으로 보여주는 콘텐츠 15개
    if (content_quantity == null) {
        content_quantity = 15;
    }

    let cat1 = sessionStorage.getItem('cat1').replaceAll('"', '');
    let cat2 = sessionStorage.getItem('cat2').replaceAll('"', '');
    let cat3 = sessionStorage.getItem('cat3').replaceAll('"', '');
    let contenttypeid = sessionStorage.getItem('contenttypeid');
    alert(contenttypeid)
    $.ajax({
            type: "POST",
            url: "/popular/list",
            data: {content_quantity: content_quantity, cat1: cat1, cat2: cat2, cat3: cat3, contenttypeid: contenttypeid},
            success: function (response) {
                $('.before-render').hide();
                $('#popular_card').empty();
                let popular_list = response['popular_list'];

                for (let i = 0; i < popular_list.length; i++) {
                    let title = popular_list[i]['title'];
                    let content_id = popular_list[i]['contentid'];
                    let file = popular_list[i]['firstimage'];
                    let areacode = parseInt(popular_list[i]['areacode']);
                    let address = check_address(areacode)
                    if (!file) {
                        file = "../../static/img/noImage.png"
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
                                                    <p class="card__description">추가 예정</p>
                                                </div>
                                            </a>
                                        </li>`;
                    $('#popular_card').append(temp_html);
                }
                // sessionStorage.setItem('popular_object', JSON.stringify(obj));
            }
        }
    )
}

function check_address(code) {
    if (code === 1) {
        code = '서울특별시'
    } else if (code === 21) {
        code = '부산광역시'
    } else if (code === 22) {
        code = '대구광역시'
    } else if (code === 23) {
        code = '인천광역시'
    } else if (code === 24) {
        code = '광주광역시'
    } else if (code === 25) {
        code = '대전광역시'
    } else if (code === 26) {
        code = '울산광역시'
    } else if (code === 29) {
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
        code = '전라북도'
    } else if (code === 36) {
        code = '전라남도'
    } else if (code === 37) {
        code = '경상북도'
    } else if (code === 38) {
        code = '경상남도'
    } else if (code === 39) {
        code = '제주도'
    } else if (code === 2) {
        code = '인천'
    } else if (code === 4) {
        code = '대구'
    } else if (code === 6) {
        code = '부산'
    }
    return code
}