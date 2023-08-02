import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


// import ReactGA from 'react-ga';
// ReactGA.initialize('G-QT1B9TZS0P', {
//   siteSpeedSampleRate: 100,
//   debug: true
// });
// ReactGA.pageview(window.location.pathname);


import ReactGA from "react-ga4";

ReactGA.initialize([{
  trackingId: "G-QT1B9TZS0P",
  // gaOptions: {...}, // optional
  gtagOptions: {
    send_page_view: false
  },
}]);



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
