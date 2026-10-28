// 완료 메모 입력 규칙. DB(clean_note, daily_entries_note_check)와 같은 규칙을 화면에서 먼저 지킨다.

// 글자 수 상한. DB 제약·함수와 같은 값이다
export const NOTE_MAX_LENGTH = 200;

// 줄바꿈은 받지 않는다. 붙여 넣은 글의 줄바꿈(\r\n, \r, \n)은 공백 하나로 바꾼다
export function stripLineBreaks(value: string) {
  return value.replace(/\r\n|\r|\n/g, " ");
}

// 글자 수는 DB의 char_length(유니코드 문자 단위)와 같게 센다. value.length는 이모지를 2자로 세어 어긋난다.
// DB는 앞뒤 공백을 지우고 연달은 공백을 하나로 줄인 뒤에 세므로, 화면이 보여주는 수가 DB보다 작아지지는 않는다
export function countNoteChars(value: string) {
  return [...value].length;
}
