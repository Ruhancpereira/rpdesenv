import React from "react";
import { Toaster } from "sonner";

export default function Layout({ children }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            border: "1px solid #1f2937",
            color: "#f9fafb",
          },
        }}
      />
      {children}
    </>
  );
}