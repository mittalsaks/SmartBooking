import { useEffect, useState } from 'react';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      // Handle both "2026-05-24" and "2026-05-24T00:00:00" formats
      let end: Date;
      if (targetDate.includes('T')) {
        end = new Date(targetDate);
      } else {
        end = new Date(`${targetDate}T23:59:59`);
      }

      if (isNaN(end.getTime())) {
        setTimeLeft('Invalid date');
        return;
      }

      const difference = end.getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days    = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded ${
      timeLeft === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
    }`}>
      ⏳ {timeLeft}
    </span>
  );
}