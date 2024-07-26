import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';


disableReactDevTools();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

