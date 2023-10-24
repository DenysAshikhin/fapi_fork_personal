import React, { useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { petNameArray, BonusMap, petNames } from "../itemMapping";
import { StaticPetItem } from './PetItem';
import ReactGA from "react-ga4";


const comboBonuses = {
    5001: 'Spawn More Potatoes',
    5002: 'Fewer Potatoes Per Wave',
    5003: 'Potatoes Spawn Speed',
    5004: 'Minimum Item Rarity',
    5005: 'Base Residue',
    5006: 'Drop Bonus Cap',
    5007: 'Expedition Reward',
    5008: 'Combo Pet Damage',
    5009: 'Breeding Timer',
    5010: 'Milk Timer',
    5011: 'Attack Speed',
    5012: 'Whack Buff Timer',
    5013: 'Breeding and Milk Timer',
    5014: 'Faster Charge Tick',
    5015: 'Plant Growth Rate +10%',
    5016: 'Grasshopper Damage +25%',
};

function PetComboDisplay({ petCombos, unlockedPets, petMap }) {
    const comboBonusLabel = comboBonuses[petCombos[0]?.BonusID] || "";
    const numCombos = petCombos.length;
    let numPossibleCombos = 0;
    let possibleCombosMap = {};

    for (let i = 0; i < petCombos.length; i++) {
        let cur = petCombos[i];
        let possible = true;

        if (!(cur.BonusID in possibleCombosMap)) {

            possibleCombosMap[cur.BonusID] = {};
        }
        //
        for (let j = 0; j < cur.PetID.length; j++) {
            if (cur.PetID[j] === -99) {
                continue;
            }
            if (!(cur.PetID[j] in unlockedPets)) {
                possible = false;
                break;
            }
        }


        //s
        if (possible) {
            numPossibleCombos++;
            possibleCombosMap[cur.BonusID][cur.ID] = true;
        }

        if (cur.PetID.length === 2) {
            cur.PetID.push(-99)
        }

    }

    let completeArray = Array(numCombos).fill(true);

    for (let i = 0; i < numCombos; i++) {
        if (i + 1 > numPossibleCombos) {
            completeArray[i] = false;
        }
    }

    //
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <div
                    style={{
                        display: 'flex',
                        flex: '1',
                        justifyContent: 'space-between'
                    }}
                >
                    <div>
                        {comboBonusLabel}
                    </div>
                    <div
                        style={{ marginLeft: '12px' }}
                    >
                        {completeArray.map((e, index) => {

                            if (e) {
                                return (
                                    <span className='greenDot'
                                        style={{
                                            margin: '0 1px 0 1px'
                                        }}
                                    >

                                    </span>
                                )
                            }
                            return (
                                <span className='redDot'
                                    style={{
                                        margin: '0 1px 0 1px'
                                    }}
                                >

                                </span>
                            )
                        })}
                    </div>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <div
                    style={{
                        display: 'flex', flexDirection: 'column', width: '270px',
                        position: 'relative'
                    }}
                    // className={`greenStripes`}
                    className={`grayStripes`}
                >
                    {petCombos && petCombos.map((petCombo, i) => {
                        const PetIDArray = petCombo.PetID;
                        let margin = ``;
                        if (i === 0) {
                            margin = '0'
                        }
                        else if (possibleCombosMap[petCombo.BonusID][petCombo.ID] === possibleCombosMap[petCombos[i - 1].BonusID][petCombos[i - 1].ID]) {
                            margin = '-5px 0 0 0'
                        }
                        else {
                            margin = '0 0 0 0'
                        }



                        return (
                            <div style={{
                                display: 'flex',
                                margin: margin,
                                border: `5px solid ${possibleCombosMap[petCombo.BonusID][petCombo.ID] ? 'green' : 'red'}`
                            }} key={i}>
                                {PetIDArray.map((petId, j) => {

                                    if (petId === -99) {
                                        let bigsad = -1;
                                    }

                                    let staticPetData = petNameArray.find(staticPetDatum => staticPetDatum.petId === petId)
                                    return (
                                        <div key={j}
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                width: '90px',
                                                height: '90px',
                                                opacity: petId in unlockedPets || petId === -99 ? `` : `0.6`
                                                // margin: j % 2 === 0 ? '1px 1px 1px 1px' : '1px 0 1px 0'
                                                // border: '1px solid black'
                                            }}
                                            // className={petId in unlockedPets ? `` : 'whiteBackground redBorder'}
                                            className={petId in unlockedPets || petId === -99 ? `whiteBackground` : ``}
                                        >
                                            {petId !== -99 && (
                                                <StaticPetItem petData={{ ...staticPetData, pet: petMap[petId] }} highlight={petId in unlockedPets} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                    {/* <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            top: '0',
                            left: '0',
                            // zIndex: '-2'
                        }}
                        className={`greenStripes`}
                    /> */}


                </div>
            </AccordionDetails>
        </Accordion >
    );
}

function populatePets(data, parameters) {
    let petList = {};
    let petBonusMap = {};

    let groundAllowed = parameters.ground;
    let airAllowed = parameters.air;
    let bannedPets = parameters.banned;


    for (let i = 0; i < data.PetsCollection.length; i++) {
        let pet = data.PetsCollection[i];
        if (pet.Locked === 0) {
            continue;
        }
        else if (!groundAllowed && pet.Type === 1) {
            continue;
        }
        else if (!airAllowed && pet.Type === 2) {
            continue;
        }
        else if (bannedPets[pet.ID]) {
            continue;
        }

        petList[pet.ID] = pet;
        pet.BonusList.forEach((e) => {
            if (!petBonusMap[e.ID]) {
                petBonusMap[e.ID] = {};
            }
            petBonusMap[e.ID][pet.ID] = pet;
        })
    }
    return { petList, petBonusMap };
}

function calcCurrentBonuses(groundPets, airPets) {
    let currentBonuses = {};
    for (let i = 0; i < groundPets.length; i++) {
        let pet = groundPets[i];
        pet.BonusList.forEach((e) => {
            if (!currentBonuses[e.ID]) {
                currentBonuses[e.ID] = { ...e, count: 0 };
            }
            currentBonuses[e.ID].count++;
        })
    }
    for (let i = 0; i < airPets.length; i++) {
        let pet = airPets[i];
        pet.BonusList.forEach((e) => {
            if (!currentBonuses[e.ID]) {
                currentBonuses[e.ID] = { ...e, count: 0 };
            }
            currentBonuses[e.ID].count++;
        })
    }
    return currentBonuses;
}

function findBestTeam(data, parameters) {

    let res;
    let petList = {};
    let petBonusMap = {};
    let currentBonuses = {};
    let bannedPets = {};

    let groundPets = [];
    const groundLimit = data.SlotGround;
    let airPets = [];
    const airLimit = data.SlotAir;

    res = populatePets(data, { ground: groundPets.length < groundLimit, air: airPets.length < airLimit, banned: bannedPets });
    petList = res.petList;
    petBonusMap = res.petBonusMap;
    currentBonuses = calcCurrentBonuses(groundPets, airPets);

    while ((groundPets.length < groundLimit || airPets.length < airLimit) && Object.values(petList).length > 0) {

        let pets = [];


        for (const [ID, value] of Object.entries(petList)) {
            let pet = { ...value, score: 0 };
            pet.BonusList.forEach((e) => {
                if (!currentBonuses[e.ID]) {
                    pet.score++;
                }
            });
            pets.push(pet);
        }
        pets.sort((a, b) => b.score - a.score);
        let bestPet = pets[0];
        bestPet.name = petNames[bestPet.ID].name;
        console.log(`adding: ${bestPet.name}`);
        if (bestPet.Type === 1) {
            groundPets.push(bestPet);
        }
        else {
            airPets.push(bestPet);
        }
        bannedPets[bestPet.ID] = bestPet;

        res = populatePets(data, { ground: groundPets.length < groundLimit, air: airPets.length < airLimit, banned: bannedPets });
        petList = res.petList;
        petBonusMap = res.petBonusMap;
        currentBonuses = calcCurrentBonuses(groundPets, airPets);
    }

    let bigsad = -1;


    let stringy = ``;
    for (let i = 0; i < groundPets.length; i++) {
        stringy += `${groundPets[i].name}, `
    }
    console.log(`ground pets: ${stringy}`)
    stringy = ``;
    for (let i = 0; i < airPets.length; i++) {
        stringy += `${airPets[i].name}, `
    }
    console.log(`air pets: ${stringy}`);

    let numBonuses = 0;
    for (const [key, value] of Object.entries(currentBonuses)) {
        numBonuses++;
        value.label = BonusMap[key].label;
    }

    console.log(`number of bonuses: ${numBonuses}`);
}


export default function PetComboList({ data }) {
    useEffect(() => {
        let timeout = setTimeout(() => {

            ReactGA.send({ hitType: "pageview", page: "/pet_combos", title: "Pet Combos Page" });
        }, 5000);
        return () => { clearTimeout(timeout) };
    }, [])

    findBestTeam(data, {});

    const comboList = data.PetsSpecial;
    const comboByBonusId = comboList.reduce((accum, combo, i) => {
        if (i === 0) return accum;
        accum[combo.BonusID] = accum[combo.BonusID] ? [...accum[combo.BonusID], combo] : [combo];
        return accum;
    }, {});

    let unlockedPetsMap = {};
    let petMap = {};

    const positiveRankedPets = data.PetsCollection.filter(
        (pet) => {
            // const isValidRank = !!pet.Rank;//Instead of relying on defaultRank always = 0, select valid ranks if they exist (not 0)
            petMap[pet.ID] = pet;
            const isValidLocked = !!pet.Locked;
            return isValidLocked;
        }
    )



    for (let i = 0; i < positiveRankedPets.length; i++) {
        let cur = positiveRankedPets[i];
        unlockedPetsMap[cur.ID] = cur;
    }



    return (
        <div
            style={{ display: 'flex' }}
        >
            <div>
                <h2>Pet Combo List</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {comboByBonusId && Object.values(comboByBonusId).map((comboArray, i) => {
                        return <PetComboDisplay
                            petMap={petMap}
                            petCombos={comboArray}
                            key={i}
                            unlockedPets={unlockedPetsMap}
                        />
                    })}
                </div>
            </div>
        </div >
    )
}