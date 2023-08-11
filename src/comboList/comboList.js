import React, { useState, useEffect } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {petNamesById} from "../itemMapping";
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

function PetComboDisplay({petCombos}) {
    const comboBonusLabel = comboBonuses[petCombos[0]?.BonusID] || "";
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{comboBonusLabel}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {petCombos && petCombos.map((petCombo, i) => {
                    const PetIDArray = petCombo.PetID;
                    return (
                        //test change
                        <Grid2 container key={i}>
                            {PetIDArray.map((petId, j) => {
                                return (
                                    <Grid2 xs={3}>
                                        <img src={petNamesById[petId].img} alt={petNamesById[petId]?.name} key={j} />
                                    </Grid2>
                                );
                            })}
                        </Grid2>
                    );
                })}
                </AccordionDetails>
        </Accordion>
    );
}
export default function PetComboList({data}) {

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
        <Grid2 container spacing={1}>
            <Grid2 xs={12}>
                <Typography variant={"h2"}>Pet Combo List</Typography>
            </Grid2>
            <Grid2 xs={12}>
            {comboByBonusId && Object.values(comboByBonusId).map((comboArray, i) => {
                return <PetComboDisplay petCombos={comboArray} key={i} />
            })}
            </Grid2>
        </Grid2>
    );
}