import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { assetUrl } from './utils/assetUrl';
import './styles/reset.css';
import './styles/main.css';
import './styles/boot.css';
import './styles/pdf-viewer.css';
import './styles/image-viewer.css';
import './styles/error-dialog.css';
import './styles/notes-app.css';
import './styles/email-app.css';
import './styles/system-blue-screen.css';
import './styles/credits-window.css';
import './styles/ratrace-window.css';
import './styles/listen-window.css';
import './styles/shop-windows.css';
import './styles/order-copy-window.css';

document.documentElement.style.setProperty(
  '--desktop-bg-url',
  `url(${assetUrl('/RESOURCES/desktop_bg.png')})`,
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
