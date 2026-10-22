// 로그인 뒤 돌아갈 경로(next). 다른 사이트로 보내지 않도록 같은 사이트의 상대 경로만 받고, 아니면 "/".
// "//example.com"과 "/\example.com"은 브라우저가 다른 사이트 주소로 읽으므로 막는다.
export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
