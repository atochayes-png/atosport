import { useState, useEffect } from 'react';

export interface CountdownState {
  hours: string;
  minutes: string;
  seconds: string;
  days: number;
  isLessThan24h: boolean;
  isPast: boolean;
  totalSecondsRemaining: number;
}

export function parseMatchTimestamp(dateStr: string, timeStr: string): number {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = (timeStr || '00:00').split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
  } catch {
    return Date.now();
  }
}

export function useMatchCountdown(dateStr: string, timeStr: string): CountdownState {
  const targetMs = parseMatchTimestamp(dateStr, timeStr);

  const calculateRemaining = (): CountdownState => {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      return {
        hours: '00',
        minutes: '00',
        seconds: '00',
        days: 0,
        isLessThan24h: false,
        isPast: true,
        totalSecondsRemaining: 0,
      };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    return {
      hours: pad(hours + (days * 24)),
      minutes: pad(minutes),
      seconds: pad(seconds),
      days,
      isLessThan24h: diff <= 24 * 60 * 60 * 1000,
      isPast: false,
      totalSecondsRemaining: totalSeconds,
    };
  };

  const [countdown, setCountdown] = useState<CountdownState>(calculateRemaining);

  useEffect(() => {
    setCountdown(calculateRemaining());
    const interval = setInterval(() => {
      setCountdown(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  return countdown;
}
