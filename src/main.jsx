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

document.documentElement.style.setProperty(
  '--desktop-bg-url',
  `url(${assetUrl('/RESOURCES/desktop_bg.png')})`,
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
