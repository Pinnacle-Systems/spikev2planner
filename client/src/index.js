import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'semantic-ui-css/semantic.min.css';

// 1. Import Provider and your Redux store
import { Provider } from 'react-redux';
import store from './CapacityPlanner/redux/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // 2. Wrap App inside Provider
  <Provider store={store}>
    <App />
    <ToastContainer closeButton position='top-center' />
  </Provider>
);
