// 一意な ID の生成
let counter = 0;

/** prefix 付きの一意 ID（時刻 + カウンタで衝突回避） */
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}`;
}
