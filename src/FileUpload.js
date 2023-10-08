import React, { useState, useEffect } from 'react';
import pako from 'pako';
import saveFileImg from './assets/images/fapi_save_file.png'
import ReactGA from "react-ga4";

const FileUpload = ({ onData }) => {

    useEffect(()=>{
        ReactGA.send({ hitType: "pageview", page: "/file_upload", title: "Landing Page (Upload)" });
    }, [])

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        const fileReader = new FileReader();

        fileReader.onload = (event) => {
            const compressedData = new Uint8Array(event.target.result);
            const decompressedData = pako.inflate(compressedData);
            const textDecoder = new TextDecoder('utf-8');
            const decodedString = textDecoder.decode(decompressedData);

            const startPosition = decodedString.indexOf('{');
            const endPosition = decodedString.lastIndexOf('}') + 1;
            const jsonString = decodedString.slice(startPosition, endPosition);

            try {
                const parsedJson = JSON.parse(jsonString);
                onData(parsedJson);
            } catch (error) {
                console.error('Invalid JSON:', error);
            }
        };

        fileReader.readAsArrayBuffer(file);
    };

    return (
        <div className="FileUpload">
            <h1>SPOILERS AWAIT</h1>
            <h2>Upload your save file helpful tools for: Expeditions, Pet Combos, Farming, Cards</h2>
            <h3>Your save file can be found at:</h3>
            <div>PC: %APPDATA%\..\LocalLow\Oni Gaming\Farmer Against Potatoes Idle\fapi-save.txt</div>
            <div>Mobile:/storage/emulated/0/Android/data/com.oninou.FAPI/files/fapi-save.txt </div>
            <div style={{marginTop:'24px'}}>
                <input type="file" onChange={handleFileUpload} />
            </div>
        </div>
    );
};

export default FileUpload;
