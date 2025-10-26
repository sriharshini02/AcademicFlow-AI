import * as React from "react";

export function Card({ children, className = "" }) {
  return <div className={`rounded-xl border shadow p-4 ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="mb-2 font-semibold text-lg">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
