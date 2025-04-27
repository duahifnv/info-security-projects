import React from 'react';
import ReactDOM from 'react-dom/client';
import {CalibratingPage} from "./components/CalibratingPage";
import './body.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CalibratingPage />
  </React.StrictMode>
);