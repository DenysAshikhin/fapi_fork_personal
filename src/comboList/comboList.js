import React, { useEffect } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { petNameArray } from "../itemMapping";
import { StaticPetItem } from '../PetItem';
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
                        <Grid2 container rowSpacing={10} key={i}>
                            {PetIDArray.map((petId, j) => {
                                let staticPetData = petNameArray.find(staticPetDatum => staticPetDatum.petId === petId)
                                return (
                                    <Grid2 key={j} xs={1} display="flex" justifyContent="center" alignItems="center">
                                        <StaticPetItem petData={staticPetData}/>
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