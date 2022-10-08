import React from 'react';
import ReactDOM from 'react-dom/client';
import MainCanvas from './components/MainCanvas';

// import style!
import './styles/style.css';

/* if (module.hot) {
    module.hot.accept();
} */

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <MainCanvas />
);
