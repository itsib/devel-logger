import { padStart } from './pad-string';

export function humanizeFormat(date: Date): string {
  let formatted = date.toLocaleDateString('ru-RU') + ' ';
  formatted += date.toLocaleTimeString('ru-RU') + '.';
  formatted += padStart(date.getMilliseconds().toString(), 3, '0');

  return formatted;
}

export function relativeFormat(date: Date, from: number) {
  let diff = date.getTime() - from;
  const milliseconds = (diff % 1000);
  diff = Math.floor(diff / 1000);
  const seconds = (diff % 60);
  diff = Math.floor(diff / 60);
  const minutes = (diff % 60);
  const hours = Math.floor(diff / 60);

  let formatted = padStart(hours.toString(), 3, '0');
  formatted += `:${padStart(minutes.toString(), 2, '0')}`;
  formatted += `:${padStart(seconds.toString(), 2, '0')}`;
  formatted += `.${padStart(milliseconds.toString(), 3, '0')}`;

  return formatted;
}