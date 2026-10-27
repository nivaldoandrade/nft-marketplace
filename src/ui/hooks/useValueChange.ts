import { useEffect, useRef } from 'react';

// calls onChange when a value differs from the one seen on the previous render
export function useValueChange<T>(
  value: T | undefined,
  onChange: (previous: T, current: T) => void,
) {
  const previousRef = useRef(value);

  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = value;

    if (previous !== undefined && value !== undefined && previous !== value) {
      onChange(previous, value);
    }
  });
}
