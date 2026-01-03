import React from 'react';
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        :root {
          --background: 0 0% 4%;
          --foreground: 0 0% 98%;
          --primary: 68 100% 50%;
          --primary-foreground: 0 0% 0%;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          background: #0a0a0a;
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #CCFF00;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #B8E600;
        }
        
        ::selection {
          background: rgba(204, 255, 0, 0.3);
          color: #000;
        }
      `}</style>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 15, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      
      {children}
    </>
  );
}