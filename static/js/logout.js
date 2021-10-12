function logout() {
    $.removeCookie('mytoken', {path: '/'});
    alert('로그아웃을 완료했습니다.')
    window.location.href = `/`;
}