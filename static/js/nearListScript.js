// 현재 위치 불러와 근처 여행지, 음식점, 숙박, 축제공연행사 조회 (5km, 항목당 최대 40개)
function geoInfoList(type) {
    $('#near_card').empty();

    function onGeoOK(position) { //위치 정보 공유 승인 시
        const lat = position.coords.latitude; //위도
        const lng = position.coords.longitude; //경도

        $.ajax({
                type: "POST",
                url: "/near/list",
                data: {lat_give: lat, lng_give: lng, type_give: type},
                success: function (response) {
                    $('.before-render').hide();
                    $('#near_card').empty();
                    let near_list = response['near_list'];

                    //세션 스토리지 값에 객체 형태로 여러 개 넣기 위해 생성
                    let obj = {};

                    for (let i = 0; i < near_list.length; i++) {
                        let title = near_list[i]['title'];
                        let address = near_list[i]['addr1'];
                        let file = near_list[i]['firstimage'];
                        let distance = near_list[i]['dist'];
                        let place_lat = near_list[i]['mapy'];
                        let place_lng = near_list[i]['mapx'];
                        let content_id = near_list[i]['contentid'];
                        let content_type_id = near_list[i]['contenttypeid']


                        if (!file) {

                            obj[content_id] = {
                                'title': title,
                                'address': address,
                                'file': "https://dk9q1cr2zzfmc.cloudfront.net/img/noImage.png",
                                'distance': distance,
                                'place_lat': place_lat,
                                'place_lng': place_lng,
                                'content_type_id': content_type_id
                            }

                            let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                             <a href="/near/place/${content_id}" class="card">
                                                <img src="https://dk9q1cr2zzfmc.cloudfront.net/img/noImage.png" class="card__image" alt="이미지 없음"/>
                                                <div class="card__overlay">
                                                    <div class="card__header">
                                                        <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                            <path/>
                                                        </svg>
                                                        <img class="card__thumb" src="https://dk9q1cr2zzfmc.cloudfront.net/img/noImage.png" alt="썸네일 이미지 없음"/>
                                                        <div class="card__header-text">
                                                            <h3 class="card__title">${title}</h3>
                                                            <span class="card__status">${distance}m</span>
                                                        </div>
                                                    </div>
                                                    <p class="card__description">${address}</p>
                                                </div>
                                            </a>
                                        </li>`;
                            $('#near_card').append(temp_html);
                        } else {

                            obj[content_id] = {
                                'title': title,
                                'address': address,
                                'file': file,
                                'distance': distance,
                                'place_lat': place_lat,
                                'place_lng': place_lng,
                                'content_type_id': content_type_id
                            }

                            let temp_html = `<li style="margin: 0 10px; height: 300px;">
                                             <a href="/near/place/${content_id}" class="card">
                                                <img src="${file}" class="card__image" alt="내 위치 근처 여행지 사진"/>
                                                <div class="card__overlay">
                                                    <div class="card__header">
                                                        <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                                                            <path/>
                                                        </svg>
                                                        <img class="card__thumb" src="${file}" alt="썸네일"/>
                                                        <div class="card__header-text">
                                                            <h3 class="card__title">${title}</h3>
                                                            <span class="card__status">${distance}m</span>
                                                        </div>
                                                    </div>
                                                    <p class="card__description">${address}</p>
                                                </div>
                                            </a>
                                        </li>`;
                            $('#near_card').append(temp_html);
                        }
                    }
                    sessionStorage.setItem('near_object', JSON.stringify(obj));
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