import React, { useState, useEffect } from 'react';

import gearIcon from '../assets/images/gear_lightgray.svg';


const PageCard = ({ page, setTab }) => {

    let imgString = '';
    let nameString = '';
    let imgSrc;
    let tabNum = 0;

    switch (page) {
        case 'upload':
            imgString = `file_upload`;
            nameString = `Upload`;
            break;
        case 'expedition':
            imgString = `signpost`;
            nameString = `Expedition`;
            tabNum = 1;
            break;
        case 'pets':
            imgString = `paw_plus`;
            nameString = `Pets (Combos)`;
            tabNum = 2;
            break;
        case 'farm':
            imgString = `farming`;
            nameString = `Farm`;
            tabNum = 3;
            break;
        case 'cards':
            imgString = `badge`;
            nameString = `Cards`;
            tabNum = 4;
            break;
        case 'protein':
            // imgString = `badge`;
            imgSrc = gearIcon;
            nameString = `Protein`;
            tabNum = 7;
            break;

        default:
            imgString = `file_upload`;

            nameString = `Upload`;
            break;
    }
    ///asd
    let disabled = tabNum === 111;
    return (
        <div
            className={disabled ? '' : 'hover'}
            style={{
                height: '148px', width: '150px', marginRight: '48px', borderRadius: '6px',
                pointerEvents: disabled ? 'none' : '',
                opacity: disabled ? '0.3' : '',
            }}
            onClick={(e) => setTab(tabNum)}
        >
            <div
                style={{
                    height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255, 0.05)', borderTopRightRadius: '12px', borderTopLeftRadius: '12px',
                    padding: '6px 6px 6px 6px',
                    borderTop: '2px solid rgba(255,255,255,0.8)',
                    borderLeft: '2px solid rgba(255,255,255,0.8)',
                    borderRight: '2px solid rgba(255,255,255,0.8)',
                }}
            >
                <img style={{ maxHeight: '100%' }} src={imgSrc ? imgSrc : `/fapi_fork_personal/${imgString}.svg`} />
            </div>



            {true && (
                <div
                    style={{
                        height: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255, 0.12)', borderBottomRightRadius: '12px', borderBottomLeftRadius: '12px',
                        borderBottom: '2px solid rgba(255,255,255,0.8)',
                        borderLeft: '2px solid rgba(255,255,255,0.8)',
                        borderRight: '2px solid rgba(255,255,255,0.8)',
                    }}
                >
                    <div
                        className="importantText"
                        style={{
                            // marginTop: '6px',
                            fontSize: '20px'
                        }}
                    >
                        {nameString}
                    </div>
                </div>
            )}


        </div >
    );
};

export default PageCard;








