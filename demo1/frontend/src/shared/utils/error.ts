// catch到的错误不一定是Error对象,统一转成字符串
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
