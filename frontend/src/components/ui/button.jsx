import * as React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition ${className}`}
    >
      {children}
    </button>
  );
}

