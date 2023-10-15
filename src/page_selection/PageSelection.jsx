import React, { useState, useEffect } from 'react';
import pako from 'pako';
import saveFileImg from '../assets/images/fapi_save_file.png'
import ReactGA from "react-ga4";
import MouseOverPopover from "../tooltip";
import PageCard from './page_card.jsx';


const PageSelection = ({ onData, setTab }) => {

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: "/page_selection", title: "Page Selection" });
    }, [])


    return (
        <div
            style={{
                display: 'flex',
                flex: '1',
                backgroundColor: 'black',
                position: 'relative',
            }}
        >
            <div style={{
                paddingLeft: '6px',
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                // alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255, 0.08)',
                paddingLeft: '60px'
            }}>
                <div
                    style={{ display: 'flex' }}
                >

                    <PageCard page='upload' setTab={setTab} />
                    <PageCard page='expedition' setTab={setTab} />
                    <PageCard page='pets' setTab={setTab} />
                </div>
                <div
                    style={{ display: 'flex', marginTop: '36px' }}
                >
                    <PageCard page='farm' setTab={setTab} />
                    <PageCard page='cards' setTab={setTab} />

                </div>
            </div>
        </div>
    );
};

export default PageSelection;








