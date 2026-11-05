// 証明書ID：URLに含める推測できないランダム値。画面には表示しない（decisions/0010）
// 案：128ビットをbase64url（URLで使える英数字と - _）で表した22文字。正式な形式はGoと決める。

const ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;

export function isValidId(id: string): boolean {
  return ID_PATTERN.test(id);
}
