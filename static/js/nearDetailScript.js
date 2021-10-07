function getMap() {
    let get_link = window.location.search;
    let do_split = get_link.split('=');
    let content_id = do_split[1];

    let map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lat']),
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lng'])
        ),
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
            style: naver.maps.ZoomControlStyle.SMALL,
            position: naver.maps.Position.TOP_RIGHT
        }
    });

    let marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lat']),
            Number(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['place_lng'])
        ),
        map: map,
        icon: "../static/img/marker.png"
    });

    let infowindow = new naver.maps.InfoWindow({
        content: `<div style="width: 50px;height: 20px;text-align: center"><h5>here!</h5></div>`,
    });

    naver.maps.Event.addListener(marker, "click", function () {
        console.log(infowindow.getMap()); // 정보창이 열려있을 때는 연결된 지도를 반환하고 닫혀있을 때는 null을 반환
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.open(map, marker);
        }
    });
}

function getItem() {
    let get_link = window.location.search;
    let do_split = get_link.split('=');
    let content_id = do_split[1];

    $('#title').text(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['title']);
    $('#file').attr('src', JSON.parse(sessionStorage.getItem('near_object'))[content_id]['file'])
    $('#address').text(JSON.parse(sessionStorage.getItem('near_object'))[content_id]['address']);
    $('#distance').text(`여기에서 ${JSON.parse(sessionStorage.getItem('near_object'))[content_id]['distance']}m 거리`);
}