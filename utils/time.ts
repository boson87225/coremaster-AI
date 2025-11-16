
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
};