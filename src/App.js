import React, { useState } from 'react';
import './App.css';
import FileUpload from './FileUpload';
import PageSelection from './page_selection/PageSelection.jsx';
import JSONDisplay from './pets/JSONDisplay';
import CardComponent from './cards/card';
import { DefaultWeightMap, petNameArray, BonusMap } from './itemMapping';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Weights from "./weights/weights";
import PetComboList from "./pets/comboList";
import helper from './util/helper.js';
import petHelper from './util/petHelper.js';

import FarmingLanding from './farming/FarmingLanding.jsx';
import Header from './header.jsx';
import useLocalStorage from "use-local-storage";

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5'
        }
    },
    typography: {
        fontFamily: 'Roboto',
    },
});

const defaultPetSelection = petNameArray.map(petData => petData.petId);


let groupCache = {};
function setGroupCache(newCache) {
    groupCache = newCache;
}

function App() {
    const [data, setData] = useState(null);
    const [groups, setGroups] = useState([]);
    // const [defaultRank, setDefaultRank] = useState(1);
    const [defaultRank, setDefaultRank] = useLocalStorage("defaultRank", 1);
    const [includeLocked, setIncludeLocked] = useState(false);
    const [selectedItems, setSelectedItems] = useState(defaultPetSelection);
    const [tabSwitch, setTabSwitch] = useState(0);
    const [weightMap, setWeightMap] = useState(DefaultWeightMap);
    const [refreshGroups, setRefreshGroups] = useState(false);
    // const [groupRankCritera, setGroupRankCriteria] = useState(1);//1 = overall damage + modifiers, 2 = token/hr + (damage and modifiers), 3 = advanced/custom
    const [groupRankCritera, setGroupRankCriteria] = useLocalStorage("groupRankCriteria", 1);//1 = overall damage + modifiers, 2 = token/hr + (damage and modifiers), 3 = advanced/custom
    // const [comboSelector, setComboSelector] = useState(1);
    const [comboSelector, setComboSelector] = useLocalStorage("comboSelector", 1);
    // const [numTeams, setNumTeams] = useState(-1);
    const [numTeams, setNumTeams] = useLocalStorage("numTeams", -1);
    const [tokenDamageBias, setTokenDamageBias] = useState(15);
    const [availableCustomBonuses, setAvailableCustomBonuses] = useState(
        [
            // { id: 1001, label: "POTATO GAIN" },
            // { id: 1002, label: "CLASS EXP GAIN" },
            // { id: 1003, label: "SKULL GAIN" },
            { id: 1009, label: "Residue Gain" },
            { id: 1010, label: "Card Power Gain" },
            { id: 1011, label: "Expedition Reward" },
            { id: 1012, label: "Expedition Time Gain" },
            { id: 1013, label: "Expedition Damage" },
            { id: 1014, label: "Card EXP" },
            { id: 1015, label: "Reinc Pts Gain" },
            { id: 1016, label: "Token Gain" },
        ]
    );
    // const [activeCustomBonuses, setActiveCustomBonuses] = useState([]);
    const [activeCustomBonuses, setActiveCustomBonuses] = useLocalStorage("activeCustomBonuses", []);
    const [selectedPets, setSelectedPets] = useState([]);
    const [failedFilters, setFailedFilters] = useState([]);
    const [originalPets, setOriginalPets] = useState([]);
    // const [petWhiteList, setPetWhiteList] = useState([]);
    const [petWhiteList, setPetWhiteList] = useLocalStorage("petWhiteList", []);

    const handleItemSelected = (items) => {
        setSelectedItems(items);

        const petData = data?.PetsCollection || [];
        let localPets = [];
        for (let i = 0; i < items.length; i++) {
            localPets.push(petData[items[i]])
        }

        setSelectedPets(localPets);

        if (items) handleGroups(data, items);
    };

    const setWeights = (newWeightMap) => {
        setWeightMap({ ...newWeightMap });
    }


    const selectComponent = () => {
        switch (tabSwitch) {
            case 6:
                return <PageSelection setTab={(num) => setTabSwitch(num)} />
            case 3:
                return <FarmingLanding data={data} />;
            case 5:
                return <Weights weightMap={weightMap} setWeightsProp={setWeights} />;
            case 4:
                return <CardComponent data={data} weightMap={weightMap} />;
            case 2:
                return <PetComboList data={data} weightMap={weightMap} />;
            // case 3:
            //     return <ExpeditionCardComponent data={data} weightMap={weightMap} defaultRank={defaultRank} />;
            case 1:
                return <JSONDisplay
                    petWhiteList={petWhiteList}
                    setPetWhiteList={setPetWhiteList}
                    setRefreshGroups={setRefreshGroups}
                    originalPets={originalPets}
                    weightMap={weightMap}
                    data={data}
                    groups={groups}
                    selectedItems={selectedItems}
                    handleItemSelected={handleItemSelected}
                    setDefaultRank={
                        (val) => {
                            if (refreshGroups) {
                                return;
                            }
                            //Setting default rank to the value (0 for old functionality, otherwise groups are calcualted with all pets at specified rank)
                            setDefaultRank(val);
                            setRefreshGroups(true);//Forcing all the groups to be recalculated
                        }
                    }
                    defaultRank={defaultRank}
                    comboSelector={comboSelector}
                    setComboSelector={(val) => {
                        if (refreshGroups) {
                            return;
                        }
                        setComboSelector(val);
                        setRefreshGroups(true);
                    }}
                    groupRankCritera={groupRankCritera}
                    setGroupRankCriteria={(val) => {
                        if (refreshGroups) {
                            return;
                        }
                        setGroupRankCriteria(val);
                        setRefreshGroups(true);
                    }}
                    refreshGroups={refreshGroups}
                    numTeams={numTeams}
                    setNumTeams={
                        (val) => {
                            setNumTeams(Number(val));
                            setRefreshGroups(true);
                        }
                    }
                    tokenDamageBias={tokenDamageBias}
                    setTokenDamageBias={
                        (val) => {
                            setTokenDamageBias(val);
                            setRefreshGroups(true);
                        }
                    }
                    availableCustomBonuses={availableCustomBonuses}
                    setAvailableCustomBonuses={(e) => {

                        setActiveCustomBonuses((curr) => {
                            let newBonusList = [...curr];

                            newBonusList.push({
                                ...BonusMap[e],
                                amount: 1,
                                equation: 'min',
                                placement: 'top',
                                runningTotal: 0,
                                totalMax: 24,
                                relThresh: 20
                            });
                            return newBonusList;
                        })
                        setAvailableCustomBonuses((curr) => {
                            let newBonusList = [...curr];
                            newBonusList = newBonusList.filter((a) => a.id !== Number(e));
                            return newBonusList;
                        });
                        setRefreshGroups(true);
                    }}

                    activeCustomBonuses={activeCustomBonuses}
                    setActiveCustomBonuses={(val) => {
                        setActiveCustomBonuses(val);
                        setRefreshGroups(true);
                    }}

                    deleteActiveCustomBonuses={
                        (e) => {

                            setActiveCustomBonuses((curr) => {
                                let newBonusList = [...curr];
                                newBonusList = newBonusList.filter((a) => a.id !== e.id);
                                return newBonusList;
                            })
                            setAvailableCustomBonuses((curr) => {
                                let newBonusList = [...curr];
                                newBonusList.push(BonusMap[e.id]);
                                return newBonusList;
                            });
                            setRefreshGroups(true);
                        }
                    }
                    selectedPets={selectedPets}
                    failedFilters={failedFilters}
                />;
            case 0:
                return <FileUpload onData={handleData} />;
            default:
                return <FileUpload onData={handleData} />;
        }
    };

    const handleData = (uploadedData) => {

        console.log(uploadedData)
        uploadedData.PetDamageBonuses = helper.calcPOW(uploadedData.PetDamageBonusesBD);
        // uploadedData.PetDamageBonuses = 1;

        setData(uploadedData);

        let specialPetCombo = 1;
        for (let i = 0; i < uploadedData.PetsSpecial.length; i++) {
            let t = uploadedData.PetsSpecial[i];
            if (t.BonusID === 5007 && t.Active === 1) {
                specialPetCombo += t.BonusPower / 100;
            }
        }
        specialPetCombo = helper.roundTwoDecimal(specialPetCombo);

        setComboSelector(specialPetCombo);

        setNumTeams(uploadedData.ExpeditionLimit);


        setGroupCache({});

        uploadedData.PetsCollection.sort((a, b) => a.ID - b.ID);

        let tempPets = [];
        const positiveRankedPets = uploadedData.PetsCollection.filter(
            (pet) => {
                // const isValidRank = !!pet.Rank;//Instead of relying on defaultRank always = 0, select valid ranks if they exist (not 0)
                const isValidLocked = includeLocked ? true : !!pet.Locked;
                if (isValidLocked) {
                    tempPets.push(pet);
                }
                return isValidLocked;
                // return isValidRank && isValidLocked;
            }
        ).map((pet) => pet.ID);
        setSelectedItems(positiveRankedPets);
        setOriginalPets(tempPets);
        setSelectedPets(tempPets);

        handleGroups(uploadedData, positiveRankedPets);
        if (tabSwitch === 0) setTabSwitch(6);  // move upload to expedition when done
    };

    //Recalculate used to force the groups to be...recalculated
    const handleGroups = (data, selectedItems, recalculate) => {
        console.log(`handle groups called`)
        const petData = data?.PetsCollection || [];
        const selectedItemsById = petData.reduce((accum, item) => {
            accum[parseInt(item.ID, 10)] = item;
            return accum;
        }, {})

        const localPets = selectedItems.map(petId => selectedItemsById[petId])
        const keyString = selectedItems.sort().join(',');
        let groups = groupCache[keyString];
        if (groups && !recalculate) {
            setGroups(groups);
        } else {
            groups = petHelper.findBestGroups(
                localPets,
                defaultRank,
                groupRankCritera,
                numTeams === -1 ? data.ExpeditionLimit : numTeams,
                {
                    tokenDamageBias: tokenDamageBias,
                    activeBonuses: activeCustomBonuses,
                    setFailedFilters: setFailedFilters,
                    petWhiteList: petWhiteList
                }
            );
            setGroupCache({ ...groupCache, [keyString]: groups })
            setGroups(groups);
        }
    }
    //Fires only when we need to refresh the best pet groups (like the rank being reset)
    if (refreshGroups) {
        setRefreshGroups(false);
        handleGroups(data, selectedItems, true);
    }



    return (
        <ThemeProvider theme={theme}>

            <div style={{
                marginLeft: '0px', marginRight: '0px', maxWidth: '100000px !important',
                // width: 'calc(100vw - 126px)',
                width: '100vw',
                // maxHeight: `calc(100vh - 56px)`,
                height: `100vh`,
                padding: '0px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgb(243 240 245)',
            }}>
                {/* header */}
                <div
                    className={`headerBase$${!!data ? ' hover' : ''}`}
                    style={{
                        width: '100vw'
                    }}
                    onClick={(e) => {
                        if (!!data)
                            setTabSwitch(6)
                    }}
                >
                    <Header />
                </div>

                <div
                    style={{ display: 'flex', flex: '1' }}
                >
                    {/* navigation bar */}
                    <div style={{
                        width: '53px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        // backgroundColor: '#fbfafc',
                        backgroundColor: '#1F1B24',
                        // boxShadow: `0 0 0 1px #ecf0f5`,
                        // boxShadow: `0 0 0 1px #4a5058`,
                        // margin: '0 6px 0 0'
                    }}>

                        <div className="navItem" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', pointerEvents: !!data ? '' : 'none', opacity: !!data ? '' : '0.4' }}
                            onClick={() => setTabSwitch(0)}
                        >
                            <img style={{ width: '38px' }} src={`/fapi_fork_personal/file_upload.svg`} />
                            {/* <div className='importantText' style={{ textAlign: 'center' }}>Upload</div> */}
                        </div>
                        {/* {!!data && ( */}
                        <div className="navItem" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', pointerEvents: !!data ? '' : 'none', opacity: !!data ? '' : '0.4' }}
                            onClick={() => setTabSwitch(1)}
                        >
                            <img style={{ width: '38px' }} src={`/fapi_fork_personal/signpost.svg`} />
                            {/* <div className='importantText' style={{ textAlign: 'center' }}>Exped.</div> */}
                        </div>
                        {/* )} */}
                        {/* {!!data && ( */}
                        <div className="navItem" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', pointerEvents: !!data ? '' : 'none', opacity: !!data ? '' : '0.4' }}
                            onClick={() => setTabSwitch(2)}
                        >
                            <img style={{ width: '38px' }} src={`/fapi_fork_personal/paw_plus.svg`} />
                            {/* <div className='importantText' style={{ textAlign: 'center' }}>Pet Combo</div> */}
                        </div>
                        {/* )} */}
                        {/* {!!data && ( */}
                        <div className="navItem" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', pointerEvents: !!data ? '' : 'none', opacity: !!data ? '' : '0.4' }}
                            onClick={() => setTabSwitch(3)}
                        >
                            <img style={{ width: '38px' }} src={`/fapi_fork_personal/farming.svg`} />
                            {/* <div className='importantText' style={{ textAlign: 'center' }}>Farm</div> */}
                        </div>
                        {/* )} */}
                        {/* {!!data && ( */}
                        <div className="navItem" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', pointerEvents: !!data ? '' : 'none', opacity: !!data ? '' : '0.4' }}
                            onClick={() => setTabSwitch(4)}
                        >
                            <img style={{ width: '38px' }} src={`/fapi_fork_personal/badge.svg`} />
                            {/* <div className='importantText' style={{ textAlign: 'center' }}>Cards</div> */}
                        </div>
                        {/* )} */}
                        {/* {!!data && (
                        <div className="navItem" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}
                            onClick={() => setTabSwitch(5)}
                        >
                            <img style={{ width: '38px' }} src={`/fapi_fork_personal/scale.svg`} />
                            <div style={{ textAlign: 'center' }}>Weight</div>
                        </div>
                    )} */}
                    </div>
                    {/* actual page content */}
                    <div style={{ overflow: 'auto', width: '100%', display: 'flex', flex: 1 }}>
                        {selectComponent()}
                    </div>
                </div>

            </div>
        </ThemeProvider>
    );
}

export default App;
