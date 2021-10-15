//popularList 에서 content 수량 입력 받기
function PopularPlaceQuantity (quantity) {
//    타임어택 4차 테스트 답안 참고 예정
}

// 추천여행지 출력
function geoInfoPopularList() {
    $('#popular_card').empty();

    function onGeoOK(position) { //위치 정보 공유 승인 시
        const lat = position.coords.latitude; //위도
        const lng = position.coords.longitude; //경도

        let cat1 = sessionStorage.getItem('cat1').replaceAll('"', '');
        let cat2 = sessionStorage.getItem('cat2').replaceAll('"', '');
        let cat3 = sessionStorage.getItem('cat3').replaceAll('"', '');
        let contenttypeid = sessionStorage.getItem('contenttypeid');

        $.ajax({
                type: "POST",
                url: "/popular/list",
                data: {cat1: cat1, cat2: cat2, cat3: cat3, contenttypeid: contenttypeid},
                success: function (response) {
                    $('.before-render').hide();
                    $('#popular_card').empty();
                    let popular_list = response['popular_list'];

                    for (let i = 0; i < popular_list.length; i++) {
                        let title = popular_list[i]['title'];
                        let address = popular_list[i]['addr1'];
                        let distance = popular_list[i]['dist'];
                        let content_id = popular_list[i]['contentid'];
                        let file = popular_list[i]['firstimage'];
                        if (!file) {
                            file = popular_list[i]['firstimage2'];
                        }
                        if (!file) {
                            file = "../../static/img/noImage.png"
                        }
                        // obj[content_id] = {

                        // }
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
                                                            <span class="card__status">뭐넣지</span>
                                                        </div>
                                                    </div>
                                                    <p class="card__description">${address}</p>
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

    function onGeoError() { //위치 정보 공유 거부 시
        alert('현재 위치를 찾을 수 없습니다.')
    }

    // 1번째 파라미터: 위치 공유 승인 시, 2번째 파라미터: 위치 공유 거부 시 실행
    navigator.geolocation.getCurrentPosition(onGeoOK, onGeoError);
}