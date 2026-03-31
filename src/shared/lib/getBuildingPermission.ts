export function getBuildingPermission(value: string[]): string {
  if (!value || value.length === 0 || value.includes('all') || value.includes('ALL')) return '전체';
  if (value.length === 1) return `${value[0]}동`;
  return `${value[0]}동 외 ${value.length - 1}개`;
}
