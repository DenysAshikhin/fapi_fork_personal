import React, { useEffect } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { petNameArray } from "../itemMapping";
import { StaticPetItem } from './PetItem';
import ReactGA from "react-ga4";


const comboBonuses = {
    5001: 'SPAWNMOREPOTATOES',
    5002: 'FEWERPOTATOES',
    5003: 'POTATOESSPAWNSPEED',
    5004: 'MINIMUMRARITY',
    5005: 'BASERESIDUE',
    5006: 'DROPBONUSESCAP',
    5007: 'EXPEREWARD',
    5008: 'COMBOPETDAMAGE',
    5009: 'BREEDINGTIMER',
    5010: 'MILKTIMER',
    5011: 'ATKSPEED',
    5012: 'WHACKBUFFTIMER',
    5013: 'BREEDINGANDMILKTIMER',
    5014: 'FASTERCHARGETICK',
    5015: 'Plant Growth Rate +10%',
    5016: 'Grasshopper Damage +25%',
};

function PetComboDisplay({ petCombos }) {
    const comboBonusLabel = comboBonuses[petCombos[0]?.BonusID] || "";
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div>{comboBonusLabel}</div>
            </AccordionSummary>
            <AccordionDetails>
                {petCombos && petCombos.map((petCombo, i) => {
                    const PetIDArray = petCombo.PetID;
                    return (
                        <div style={{ display: 'flex' }} key={i}>
                            {PetIDArray.map((petId, j) => {
                                let staticPetData = petNameArray.find(staticPetDatum => staticPetDatum.petId === petId)
                                return (
                                    <div key={j} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: '90px', height: '90px' }} className='' >
                                        <StaticPetItem petData={staticPetData} />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </AccordionDetails>
        </Accordion>
    );
}
export default function PetComboList({ data }) {

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: "/pet_combos", title: "Pet Combos Page" });
    }, [])


    const comboList = data.PetsSpecial;
    const comboByBonusId = comboList.reduce((accum, combo, i) => {
        if (i === 0) return accum;
        accum[combo.BonusID] = accum[combo.BonusID] ? [...accum[combo.BonusID], combo] : [combo];
        return accum;
    }, {});


    return (
        <div>
            <h2>Pet Combo List</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {comboByBonusId && Object.values(comboByBonusId).map((comboArray, i) => {
                    return <PetComboDisplay petCombos={comboArray} key={i} />
                })}
            </div>
        </div>
    )
}