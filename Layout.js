import { Toaster } from "sonner";

export default function Layout({ children }) {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(4, 24, 51, 0.94)",
            border: "1px solid rgba(214, 230, 255, 0.18)",
            color: "white",
          },
        }}
      />
      {children}
    </>
  );
}
