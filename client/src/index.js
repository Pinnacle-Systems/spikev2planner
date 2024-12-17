import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'semantic-ui-css/semantic.min.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <ToastContainer closeButton position='top-center' />
  </>
);


