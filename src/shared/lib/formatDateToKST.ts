export const formatDateToKST = (dateStr: string) => {
  if (!dateStr) return '-';

  // 이미 ISO 형식이거나(T 포함) 종료 문자가 Z 혹은 타임존(+09:00 등)인 경우 그대로 파싱
  // 그렇지 않은 경우(YYYY-MM-DD HH:mm:ss)에만 처리하여 UTC로 인식하게 함
  const needsNormalization =
    !dateStr.includes('T') && !dateStr.endsWith('Z') && !/\+\d{2}:\d{2}$/.test(dateStr);

  const formattedStr = needsNormalization ? dateStr.replace(' ', 'T') + 'Z' : dateStr;

  const date = new Date(formattedStr);

  if (isNaN(date.getTime())) return '표기 오류';

  return date
    .toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(/\. /g, '-')
    .replace(/\./g, '');
};
