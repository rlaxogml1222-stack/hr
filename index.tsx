
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const render = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Failed to find the root element");
    return;
  }
  
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// DOM이 완전히 준비된 후 렌더링 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}
