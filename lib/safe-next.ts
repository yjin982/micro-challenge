// 로그인 뒤 돌아갈 경로(next). 다른 사이트로 보내지 않도록 같은 사이트의 경로만 받고, 아니면 "/".
// 문자열 모양으로 검사하지 않고 실제 주소로 해석해 본다. "//example.com", "/\example.com"뿐 아니라
// "/\t/example.com"처럼 탭·줄바꿈이 섞인 값도 브라우저와 new URL()은 그 문자를 지우고 다른 사이트로 읽기 때문이다.
// 해석한 결과(경로·쿼리·해시)를 돌려주므로 서버 리디렉션과 화면의 router.replace가 같은 값을 쓴다.
const BASE = "http://next.invalid";

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) return "/";
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return "/";
    // "/..//example.com"은 같은 사이트로 해석되지만 정리된 경로가 "//example.com"이 되어, 이 값을 다시 쓰면 다른 사이트가 된다
    if (url.pathname.startsWith("//")) return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}
