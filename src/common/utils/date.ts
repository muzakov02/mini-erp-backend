export const BUSINESS_TIME_ZONE = 'Asia/Tashkent';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayInBusinessZone(): string {
  return formatter.format(new Date());
}

export function toDbDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}
