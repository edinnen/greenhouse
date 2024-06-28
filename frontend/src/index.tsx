import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from 'containers/Dashboard';
import Zone from 'containers/Zone';
import Login from 'containers/Login';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { CommandControlClient } from 'proto/CommandControlServiceClientPb';
import { GreenhouseClient } from 'proto/GreenhouseServiceClientPb';
import { IrrigationClient } from 'proto/IrrigationServiceClientPb';
import { CoopClient } from 'proto/CoopServiceClientPb';
import theme from './theme';
import './index.css';

const BASE_URL = "https://greenhouse.dinnen.engineering";
const greenhouseClient = new GreenhouseClient(BASE_URL);
const commandControlClient = new CommandControlClient(BASE_URL);
const irrigationClient = new IrrigationClient(BASE_URL);
const coopClient = new CoopClient(BASE_URL);

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Dashboard commandControlClient={commandControlClient} />} />
        <Route path="/login" element={<Login commandControlClient={commandControlClient} />} />
        {/* <Route path="/zone/:id" element={<Greenhouse greenhouseClient={greenhouseClient} commandControlClient={commandControlClient} />} /> */}
        <Route path="/zone/:id" element={<Zone commandControlClient={commandControlClient} greenhouseClient={greenhouseClient} irrigationClient={irrigationClient} coopClient={coopClient} />} />
      </Routes>
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
