"use client";

import type { ChangeEvent, CSSProperties, InputHTMLAttributes } from "react";
import { formatGroupedInteger, parseDigitsToInt } from "../lib/formatters";

export interface GroupedIntegerInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "inputMode"> {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  /** true бол value === 0 үед хоосон харуулна (үнэ гэх мэт). */
  emptyWhenZero?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function GroupedIntegerInput({
  value,
  onChange,
  min,
  max,
  emptyWhenZero = false,
  className,
  style,
  ...rest
}: GroupedIntegerInputProps) {
  const display =
    emptyWhenZero && value === 0 ? "" : formatGroupedInteger(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let n = parseDigitsToInt(e.target.value);
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onChange(n);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={handleChange}
      className={className}
      style={style}
    />
  );
}
