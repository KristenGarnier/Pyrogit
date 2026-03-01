export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  let locked = false;

  return (...args: Parameters<T>) => {
    if (locked) return;

    locked = true;
    fn(...args);

    setTimeout(() => {
      locked = false;
    }, delay);
  };
}
