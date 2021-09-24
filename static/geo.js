function onGeoOK(position) { //위치 정보 공유 승인 시
    const lat = position.coords.latitude ; //위도
    const lng = position.coords.longitude ; //경도
    console.log(lat, lng);
}

function onGeoError() { //위치 정보 공유 거부 시
    alert('현재 위치를 찾을 수 없습니다.')
}

navigator.geolocation.getCurrentPosition(onGeoOK, onGeoError);