import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './FileUpload';
import JSONDisplay from './JSONDisplay';
import RepoLink from './RepoLink';
import CardComponent, { ExpeditionCardComponent } from './cards/card';
import { DefaultWeightMap, petNameArray, standardBonusesWeightList, BonusMap } from './itemMapping';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import InfoIcon from '@mui/icons-material/Info';
import ScaleIcon from '@mui/icons-material/Scale';
import { Container, Box } from '@mui/material';
import Weights from "./weights/weights";
import WeightedPetList from "./weightedPetList/WeightedPetList";
import PetComboList from "./comboList/comboList";
import helper from './util/helper.js';

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

export const EXP_DMG_MOD = .1;
export const EXP_TIME_MOD = .05;
export const SYNERGY_MOD_STEP = .25;
export const EXP_TOKEN_MOD = 0.05;
export const SOUL_CLOVER_STEP = 0.25;

export function calculateBestHours(group, hours, clover, combo) {

    if (!hours) {
        hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
    if (!clover) {
        clover = 0;
    }
    if (!combo) {
        combo = 1.0
    }
    const overall = calculateGroupScore(group);
    const tokenHR = overall.tokenMult * (Math.pow(1 + SOUL_CLOVER_STEP, clover)) * combo;
    let best = { hours: -1, totalTokens: -1, floored: -1, effeciency: -1 };
    let bestArr = [];

    for (let i = 0; i < hours.length; i++) {
        let h = hours[i];
        let totalTokens = tokenHR * h;
        let floored = Math.floor(totalTokens);
        let effeciency = floored / totalTokens;
        let wasted = totalTokens - floored;
        let temp = { tokenHR: tokenHR, wasted: wasted, hours: h, totalTokens: totalTokens, floored: floored, effeciency: effeciency };
        bestArr.push(temp);

        // if (effeciency > best.effeciency) {
        //     bestArr = [];
        //     best = { hours: h, totalTokens: totalTokens, floored: floored, effeciency: effeciency };
        //     bestArr.push(best);
        // }
        // else if (effeciency === best.effeciency) {
        //     best = { hours: h, totalTokens: totalTokens, floored: floored, effeciency: effeciency };
        //     bestArr.push(best);
        // }
    }

    bestArr.sort((a, b) => { return a.wasted - b.wasted })

    return bestArr;
}

export function calculatePetBaseDamage(pet, defaultRank) {
    const rankCount = defaultRank ? defaultRank : pet?.Rank;
    const result = pet?.BaseDungeonDamage * (1.0 + rankCount * 0.05);
    return Number(result);
}

export const calculateGroupScore = (group, defaultRank) => {
    let groupScore = 0;
    let dmgCount = 0;
    let timeCount = 0;
    let synergyBonus = 0;
    let baseGroupScore = 0;
    let cardPowerCount = 0;
    let expRewardCount = 0;
    let rpRewardCount = 0;
    let cardXpCount = 0;
    let tokenRewardCount = 0;
    let tokenMult = 0;
    let tokenModif = 0;
    const typeCounts = {};

    group.forEach((pet) => {
        groupScore += calculatePetBaseDamage(pet, defaultRank);
        if (pet.BonusList.some((bonus) => bonus.ID === 1013)) {
            dmgCount++;
        }
        if (pet.BonusList.some((bonus) => bonus.ID === 1010)) {
            cardPowerCount++;
        }
        if (pet.BonusList.some((bonus) => bonus.ID === 1011)) {
            expRewardCount++;
        }
        if (pet.BonusList.some((bonus) => bonus.ID === 1014)) {
            cardXpCount++;
        }
        if (pet.BonusList.some((bonus) => bonus.ID === 1012)) {
            timeCount++;
        }
        if (pet.BonusList.some((bonus) => bonus.ID === 1015)) {
            rpRewardCount++;
        }
        if (pet.BonusList.some((bonus) => bonus.ID === 1016)) {
            tokenRewardCount++;
        }

        // Count pet types
        if (typeCounts[pet.Type]) {
            typeCounts[pet.Type]++;
        } else {
            typeCounts[pet.Type] = 1;
        }
        if (pet.ID) synergyBonus += SYNERGY_MOD_STEP;
    });
    baseGroupScore = groupScore;
    const [earthType, airType] = Object.values(typeCounts);
    if (earthType > 0 && airType > 0) synergyBonus += SYNERGY_MOD_STEP;
    if (earthType > 1 && airType > 1) synergyBonus += SYNERGY_MOD_STEP;

    groupScore *= (1 + dmgCount * EXP_DMG_MOD);
    groupScore *= (1 + timeCount * EXP_TIME_MOD);
    groupScore *= synergyBonus;

    tokenModif = tokenRewardCount * EXP_TOKEN_MOD;
    tokenMult = synergyBonus + synergyBonus * tokenModif;
    return {
        groupScore,
        baseGroupScore,
        dmgCount,
        timeCount,
        synergyBonus,
        cardPowerCount,
        expRewardCount,
        cardXpCount,
        rpRewardCount,
        tokenRewardCount,
        tokenModif,
        tokenMult
    };
};

function getCombinations(array, k) {

    let temp = [];

    const f = (start, prevCombination) => {

        if (prevCombination.length > 0) {
            let id = '';
            for (let i = 0; i < prevCombination.length; i++) {
                id = id + prevCombination[i].ID;
                if (i + 1 !== prevCombination.length) {
                    id = id + ','
                }
            }
            temp.push({ ID: id, team: prevCombination });
        }

        if (prevCombination.length === k) {
            return;
        }
        for (let i = start; i < array.length; i++) {
            f(i + 1, [...prevCombination, array[i]]);
        }
    };
    f(0, []);

    return temp;
}

const calcBestDamageGroupOLD = (petsCollection, defaultRank, numGroups) => {
    const k = 4; // Size of each group
    numGroups = numGroups ? numGroups : 6;
    const memo = {};

    const memoizedGroupScore = (group) => {
        const key = group.ID;
        if (!memo[key] || memo[key]) {
            let res = calculateGroupScore(group.team, defaultRank);
            let sum = res.tokenMult;
            memo[key] = { token: sum, damage: res.groupScore, other: res };
        }
        return memo[key];
    };

    const getCombinationsInner = (array, k) => {

        // let temp = [];
        let best = -1;

        const f = (start, prevCombination) => {

            if (prevCombination.length > 0) {
                let id = '';
                for (let i = 0; i < prevCombination.length; i++) {
                    id = id + prevCombination[i].ID;
                    if (i + 1 !== prevCombination.length) {
                        id = id + ','
                    }
                }
                let x = { ID: id, team: prevCombination };
                // temp.push(x);
                if (best === -1) {
                    best = { ID: id, team: prevCombination, score: memoizedGroupScore(x) };
                }
                else {
                    let cur = memoizedGroupScore(x);

                    if (cur.damage === best.score.damage) {
                        if (cur.token > best.score.token) {
                            best = { ID: id, team: prevCombination, score: cur };
                        }
                    }
                    else if (cur.damage > best.score.damage) {
                        best = { ID: id, team: prevCombination, score: cur };
                    }
                }
            }

            if (prevCombination.length === k) {
                return;
            }
            for (let i = start; i < array.length; i++) {
                f(i + 1, [...prevCombination, array[i]]);
            }
        };
        f(0, []);

        return best;
    }

    let time1 = new Date();
    let time2 = new Date();
    let time3 = new Date();
    let time4 = new Date();

    let bestGroups = [];
    for (let g = 0; g < numGroups; g++) {
        time1 = new Date();
        const combinations = getCombinationsInner(petsCollection, Math.min(k, petsCollection.length));
        time2 = new Date();
        console.log(`time to get combinations ${combinations.length}: ${(time2 - time1) / 1000} seconds`)


        if (combinations === -1) {
            break;
        }
        else {
            bestGroups.push(combinations.team);
            petsCollection = petsCollection.filter((pet) => !combinations.team.includes(pet));

        }
    }
    time4 = new Date();
    console.log(`time to get best combo: ${(time4 - time3) / 1000} seconds`)
    return bestGroups;
}

const getBestDamagePets = (petsCollection, defaultRank, other) => {
    let finalCollection = {};
    let bestDamagePets = JSON.parse(JSON.stringify(petsCollection));

    //As required + miscellenaous pets are added, keep track of top 4 strongest -> to prevent adding non-special weak pets
    let strongestGnd = [];
    let strongestAir = [];

    const updateStrongest = (pet) => {
        //Ground
        if (pet.Type === 1) {
            //No pets yet, just add it
            if (strongestGnd.length === 0) {
                strongestGnd.push(pet);
            }
            //If there is 1, check if new is stronger than initial (if yes, make #1 -> #2, then add new to #1), else add it #2
            else if (strongestGnd.length === 1) {
                if (calculatePetBaseDamage(strongestGnd[0], defaultRank) < calculatePetBaseDamage(pet, defaultRank)) {
                    strongestGnd[1] = strongestGnd[0];
                    strongestGnd[0] = pet;
                }
                else {
                    strongestGnd[1] = pet;
                }
            }
            //Check if it is stronger than strongest
            else if (calculatePetBaseDamage(strongestGnd[0], defaultRank) < calculatePetBaseDamage(pet, defaultRank)) {
                strongestGnd[1] = strongestGnd[0];
                strongestGnd[0] = pet;
            }
            //Check if it is stronger than weakest
            else if (calculatePetBaseDamage(strongestGnd[1], defaultRank) < calculatePetBaseDamage(pet, defaultRank)) {
                strongestGnd[1] = pet;
            }
        }
        //Air
        else if (pet.Type === 2) {
            //No pets yet, just add it
            if (strongestAir.length === 0) {
                strongestAir.push(pet);
            }
            //If there is 1, check if new is stronger than initial (if yes, make #1 -> #2, then add new to #1), else add it #2
            else if (strongestAir.length === 1) {
                if (calculatePetBaseDamage(strongestAir[0], defaultRank) < calculatePetBaseDamage(pet, defaultRank)) {
                    strongestAir[1] = strongestAir[0];
                    strongestAir[0] = pet;
                }
                else {
                    strongestAir[1] = pet;
                }
            }
            //Check if it is stronger than strongest
            else if (calculatePetBaseDamage(strongestAir[0], defaultRank) < calculatePetBaseDamage(pet, defaultRank)) {
                strongestAir[1] = strongestAir[0];
                strongestAir[0] = pet;
            }
            //Check if it is stronger than weakest
            else if (calculatePetBaseDamage(strongestAir[1], defaultRank) < calculatePetBaseDamage(pet, defaultRank)) {
                strongestAir[1] = pet;
            }
        }
    }

    let dmgOnlyPets = [];
    let requiredPets = {};
    if (other)
        if (other.requiredPets) {
            for (let i = 0; i < other.requiredPets.length; i++) {
                requiredPets[other.requiredPets[i].ID] = other.requiredPets[i];
            }
        }
    for (let i = 0; i < bestDamagePets.length; i++) {

        let cur = bestDamagePets[i];
        let added = false;
        for (let j = 0; j < cur.BonusList.length; j++) {
            let bonus = cur.BonusList[j];

            //Add any required pets to the list
            if (cur.ID in requiredPets) {
                finalCollection[cur.ID] = cur;
                added = true;
            }
            //Dng dmg bonus
            else if (bonus.ID === 1013) {
                if (!finalCollection[cur.ID]) {
                    finalCollection[cur.ID] = cur;
                    added = true;
                }
            }
            //Dng time bonus
            if (bonus.ID === 1012) {
                if (!finalCollection[cur.ID]) {
                    finalCollection[cur.ID] = cur;
                    added = true;
                }
            }
        }
        if (!added) {
            dmgOnlyPets.push(cur);
        }
        //Since it was added, update strongest list
        else {
            updateStrongest(cur);
        }
    }

    dmgOnlyPets.sort((a, b) => calculatePetBaseDamage(b, defaultRank) - calculatePetBaseDamage(a, defaultRank));


    let airTotal = 0;
    let groundTotal = 0;
    dmgOnlyPets.map((curr) => {
        if (curr.Type === 1) groundTotal++;
        if (curr.Type === 2) airTotal++;
    })



    let ground = 0;//type 1
    let air = 0; //type 2
    let counter = 0;

    if (groundTotal < 2) {
        let ground = [];
        groundTotal = 0;
        dmgOnlyPets.map((cur) => {
            if (cur.Type === 1) {
                ground.push(cur);
                finalCollection[cur.ID] = cur;
                dmgOnlyPets = dmgOnlyPets.filter((current) => {
                    return current.ID !== cur.ID
                })
            }
        });
    }
    if (airTotal < 2) {
        let air = [];
        airTotal = 0;
        dmgOnlyPets.map((cur) => {
            if (cur.Type === 2) {
                air.push(cur);
                finalCollection[cur.ID] = cur;
                dmgOnlyPets = dmgOnlyPets.filter((current) => {
                    return current.ID !== cur.ID
                })
            }
        });
    }


    for (let i = 0; i < dmgOnlyPets.length; i++) {
        let cur = dmgOnlyPets[i];

        if (ground < 2 && cur.Type === 1 || airTotal <= 0) {


            //Check if we need to add current pet, or the strongestGnd are strong enough
            if (strongestGnd.length > 0) {
                let j = 0;
                while (strongestGnd.length > 0 && j <= strongestGnd.length) {
                    let stng = strongestGnd[j];
                    if (stng) {

                        if (calculatePetBaseDamage(stng, defaultRank) >= calculatePetBaseDamage(cur, defaultRank)) {
                            strongestGnd.splice(j, 1);
                            finalCollection[cur.ID] = cur;
                            ground++;
                            counter++;
                            j--;
                        }
                    }
                    j++;
                }
            }

            //Potentially 2 strongest are better than current, so don't add it if we added the other 2, or if there are no air and counter less than 3
            if (ground < 2 || (counter < 4 && airTotal <= 0)) {

                finalCollection[cur.ID] = cur;
                ground++;
                counter++;
                groundTotal--;
            }
        }

        else if (air < 2 && cur.Type === 2 || groundTotal <= 0) {

            //Check if we need to add current pet, or the strongestGnd are strong enough
            if (strongestAir.length > 0) {
                let j = 0;
                while (strongestAir.length > 0 && j <= strongestAir.length) {
                    let stng = strongestAir[j];
                    if (stng) {

                        if (calculatePetBaseDamage(stng, defaultRank) >= calculatePetBaseDamage(cur, defaultRank)) {
                            strongestAir.splice(j, 1);
                            finalCollection[cur.ID] = cur;
                            air++;
                            counter++;
                            j--;
                        }
                    }
                    j++;
                }
            }

            //Potentially 2 strongest are better than current, so don't add it if we added the other 2, or if there are no air and counter less than 3
            if (air < 2 || (counter < 4 && groundTotal <= 0)) {

                finalCollection[cur.ID] = cur;
                air++;
                counter++
                airTotal--;
            }
        }
        if (counter > 3) break;
    }

    let finalPetsCollection = Object.values(finalCollection);
    finalPetsCollection.sort((a, b) => b.ID - a.ID);
    return finalPetsCollection;
}

const calcBestDamageGroup = (petsCollection, defaultRank, numGroups, other) => {
    const k = 4; // Size of each group
    numGroups = numGroups ? numGroups : 6;
    const memo = {};

    let activeBonuses = other?.activeBonuses;
    if (!activeBonuses) activeBonuses = [];

    const memoizedGroupScore = (group) => {
        const key = group.ID;
        if (!memo[key] || memo[key]) {
            let res = calculateGroupScore(group.team, defaultRank);
            let sum = res.tokenMult;
            memo[key] = { token: sum, damage: res.groupScore, other: res };
        }
        return memo[key];
    };

    const getCombinationsInner = (array, k, bonusList) => {

        // let temp = [];
        let best = -1;

        const f = (start, prevCombination) => {

            if (prevCombination.length > 0) {

                let validTeam = true;

                //First confirm the the combination satisfies all bonuses
                for (let i = 0; i < bonusList.length; i++) {
                    let bonus = bonusList[i];

                    //Meaning there are required pets that have to be in the comp
                    if (bonus.requiredNumber > 0) {
                        let currCount = 0;

                        for (let j = 0; j < prevCombination.length; j++) {
                            let pet = prevCombination[j];

                            if (pet.BonusList.find((a) => a.ID === bonus.bonus.id)) {
                                currCount++;
                            }
                        }

                        if (currCount >= bonus.requiredNumber) {
                            // console.log(`we good`);
                        }
                        else {
                            // console.log(`we not good`);
                            validTeam = false;
                            break;
                        }
                    }
                    else if (bonus.exactNumber > -1) {
                        let currCount = 0;

                        for (let j = 0; j < prevCombination.length; j++) {
                            let pet = prevCombination[j];

                            if (pet.BonusList.find((a) => a.ID === bonus.bonus.id)) {
                                currCount++;
                            }
                        }

                        if (currCount === bonus.exactNumber) {
                            // console.log(`we good`);
                        }
                        else {
                            // console.log(`we not good`);
                            validTeam = false;
                            break;
                        }
                    }
                    //Meaning there is a `rel` filter active
                    else if (bonus.bonus.placement === 'rel') {
                        let currCount = 0;
                        let maxCounter = 0;

                        for (let j = 0; j < prevCombination.length; j++) {
                            let pet = prevCombination[j];
                            if (pet.BonusList.find((a) => a.ID === bonus.bonus.id)) maxCounter++;
                            // if (bonus.tempRequired > 0)
                            //     if (bonus.tempRequiredPets.find((a) => a.ID === pet.ID)) {
                            //         currCount++;
                            //     }
                        }

                        if (maxCounter <= bonus.bonus.amount)
                            //Check that we have some of the required pets, but not exceeding the max amount
                            if (bonus.tempRequired > 0) {
                                if (

                                    (bonus.bonus.amount < bonus.tempRequired && maxCounter === bonus.bonus.amount) ||//max is < required (i.e. we could fit 4 but max is set to 2) -> ensure # pets === max
                                    (maxCounter >= bonus.tempRequired) //Max is >= required, ensure #pet >= required
                                ) {
                                    // console.log(`we good`);
                                }
                                else {
                                    // console.log(`we not good`);
                                    validTeam = false;
                                    break;
                                }
                            }
                            else {

                            }
                        //otherwise, ensure we don't exceed the maximum
                        else {
                            validTeam = false;
                            break;
                        }
                    }
                    //`eq` or `min` isn't active, but needs to reserve certain pets
                    else if (bonus.tempMax || bonus.tempMax === 0) {
                        let currCount = 0;

                        for (let j = 0; j < prevCombination.length; j++) {
                            let pet = prevCombination[j];

                            if (pet.BonusList.find((a) => a.ID === bonus.bonus.id)) {
                                currCount++;
                            }
                        }

                        if (currCount <= bonus.tempMax) {
                            // console.log(`we good`);
                        }
                        else {
                            // console.log(`we not good`);
                            validTeam = false;
                            break;
                        }
                    }
                    if (!validTeam) break;

                }

                if (validTeam) {

                    let id = '';
                    for (let i = 0; i < prevCombination.length; i++) {
                        id = id + prevCombination[i].ID;
                        if (i + 1 !== prevCombination.length) {
                            id = id + ','
                        }
                    }
                    let x = { ID: id, team: prevCombination };
                    // temp.push(x);
                    if (best === -1) {
                        best = { ID: id, team: prevCombination, score: memoizedGroupScore(x) };
                    }
                    else {
                        let cur = memoizedGroupScore(x);

                        if (cur.damage === best.score.damage) {
                            if (cur.token > best.score.token) {
                                best = { ID: id, team: prevCombination, score: cur };
                            }
                        }
                        else if (cur.damage > best.score.damage) {
                            best = { ID: id, team: prevCombination, score: cur };
                        }
                    }
                }
            }

            if (prevCombination.length === k) {
                return;
            }
            for (let i = start; i < array.length; i++) {
                f(i + 1, [...prevCombination, array[i]]);
            }
        };
        f(0, []);

        if (best.team)
            best.team.sort((a, b) => {
                if (a.Type === b.Type) {
                    return a.ID - b.ID;
                }
                return a.Type - b.Type;
            })
        return best;
    }

    let time1 = new Date();
    let time2 = new Date();
    let time3 = new Date();
    let time4 = new Date();

    let bestGroups = [];
    for (let g = 0; g < numGroups; g++) {


        let remainingGroups = numGroups - g;
        let requiredPetsOverall = [];
        let requiredBonuses = {};

        let requiredPetBonusMap = {};
        let requiredPetsByBonus = [];

        if (activeBonuses.length > 0) {
            //NOTE later need to add logic to determine if a bonus met its criteria or not before adding!!
            for (let j = 0; j < activeBonuses.length; j++) {
                requiredBonuses[activeBonuses[j].id] = activeBonuses[j];
                requiredPetBonusMap[activeBonuses[j].id] = { bonus: activeBonuses[j], pets: [], active: true };
            }

            petsCollection.forEach((currPet) => {
                currPet.BonusList.forEach((currBonus) => {
                    if (currBonus.ID in requiredBonuses) {
                        if (requiredBonuses[currBonus.ID].placement === 'top') {
                            requiredPetsOverall.push(currPet);
                        }
                        requiredPetBonusMap[currBonus.ID].pets.push(currPet);
                    }
                })
            });


            //Check the bonuses placement, and if it needs to be added (top is always active)
            for (let j = 0; j < activeBonuses.length; j++) {
                let currBonus = requiredPetBonusMap[activeBonuses[j].id];

                if (currBonus.bonus.placement === 'bottom') {
                    //Need to check that it is time to place these or not
                    let numPets = currBonus.pets.length;
                    let requiredGroups = 0;
                    let remainder;
                    switch (currBonus.bonus.equation) {
                        case 'min':
                            //If there are not enough pets to meet the min, then set the min to # of pets
                            remainder = numPets % currBonus.bonus.amount;
                            numPets -= remainder;
                            requiredGroups = numPets >= 0 ? Math.ceil(numPets / currBonus.bonus.amount) : 0;
                            break;
                        case 'max':

                            break;
                        case 'eq':
                            remainder = numPets % currBonus.bonus.amount;
                            numPets -= remainder;
                            requiredGroups = currBonus.pets.length >= currBonus.bonus.amount ? Math.ceil(numPets / currBonus.bonus.amount) : 0;
                            break;
                        default:
                            break;
                    }

                    //Time to slot in the pets
                    if (remainingGroups <= requiredGroups) {

                        currBonus.pets.forEach((bonusPet) => {
                            requiredPetsOverall.push(bonusPet);
                        });
                    }
                    //If it's not time yet, check to see if we need to put a limit on a certain subset of pets from being slotted in
                    else {
                        requiredPetBonusMap[currBonus.bonus.id].active = false;//Only prevents enforcing the required pets pet team
                        requiredPetBonusMap[currBonus.bonus.id].tempMax = remainder;
                    }
                }
            }



            //Calculate how many pets are actually supposed to go into this team NOTE LATER also if they should even be added in the first place
            for (let j = 0; j < activeBonuses.length; j++) {
                let temp = requiredPetBonusMap[activeBonuses[j].id];
                if (!temp.active) continue;
                let requiredNumber = 0;
                let exactNumber = -1;

                switch (temp.bonus.equation) {
                    case 'min':
                        //If there are not enough pets to meet the min, then set the min to # of pets
                        // requiredNumber = temp.pets.length > temp.bonus.amount ? temp.bonus.amount : temp.pets.length
                        if (temp.bonus.amount > temp.pets.length) {
                            // FAILED filter
                            requiredNumber = 0;
                        }
                        else
                            requiredNumber = temp.bonus.amount;

                        break;
                    case 'max':

                        break;
                    case 'eq':
                        // exactNumber = temp.pets.length > temp.bonus.amount ? temp.bonus.amount : temp.pets.length
                        if (temp.bonus.amount > temp.pets.length) {
                            // FAILED filter
                            exactNumber = -1;
                        }
                        else
                            exactNumber = temp.bonus.amount;
                        break;
                    default:
                        break;
                }

                temp.requiredNumber = requiredNumber;
                temp.exactNumber = exactNumber;
            }
        }

        //Get a subset of pets: the required based on bonuses, any that have dmgBonus or timeBonus, up to 4 more for max raw dungeonDamage
        let finalPetsCollection = getBestDamagePets(petsCollection, defaultRank, { requiredPets: requiredPetsOverall });

        time1 = new Date();
        let combinations = getCombinationsInner(finalPetsCollection, Math.min(k, finalPetsCollection.length), Object.values(requiredPetBonusMap));
        time2 = new Date();
        console.log(`time to get combinations ${combinations.length}: ${(time2 - time1) / 1000} seconds`)

        if (combinations === -1) {
            break;
        }
        else {

            let bestCurrTeamScore = calculateGroupScore(combinations.team, defaultRank);
            let score = bestCurrTeamScore.groupScore;

            if (activeBonuses.length > 0) {
                let added = false;
                for (let j = 0; j < activeBonuses.length; j++) {
                    let curBonus = activeBonuses[j];
                    let mult = curBonus.relThresh / 100;
                    let cutOff = score * mult;

                    let counterBonus = 0;
                    let innerAdded = false;
                    let temp = requiredPetBonusMap[curBonus.id];

                    if (curBonus.placement === 'rel') {


                        let bonusPets = temp.pets;

                        bonusPets.forEach((bonusPet) => {
                            let dmg = calculatePetBaseDamage(bonusPet, defaultRank);
                            let tmLength = combinations.team.length;
                            let amountToAdd = 0;
                            bonusPet.BonusList.forEach((e) => {
                                let modifiedAddition = 0;
                                //Dng dmg
                                if (e.ID === 1013) {
                                    dmg *= (1 + EXP_DMG_MOD);
                                    if (tmLength > 1) {
                                        //Get avg base group score, then remove 1, apply mult (iplier), apply modifier, add it
                                        modifiedAddition += ((bestCurrTeamScore.baseGroupScore / tmLength) * (tmLength - 1) * mult * (1 + EXP_DMG_MOD));
                                    }
                                    else {
                                        modifiedAddition = bestCurrTeamScore.baseGroupScore * mult * (1 + EXP_DMG_MOD);
                                    }
                                    amountToAdd += modifiedAddition;
                                }
                                else if (e.ID === 1012) {
                                    dmg *= (1 + EXP_TIME_MOD);
                                    if (tmLength > 1) {
                                        //Get avg base group score, then remove 1, apply mult (iplier), apply modifier, add it
                                        modifiedAddition += ((bestCurrTeamScore.baseGroupScore / tmLength) * (tmLength - 1) * mult * (1 + EXP_TIME_MOD));
                                    }
                                    else {
                                        modifiedAddition = bestCurrTeamScore.baseGroupScore * mult * (1 + EXP_TIME_MOD);
                                    }
                                    amountToAdd += modifiedAddition;
                                }
                            })

                            dmg += amountToAdd;

                            if (dmg > cutOff) {
                                added = true;
                                innerAdded = true;
                                temp.active = true;
                                temp.tempMin = true;
                                temp.tempRequired = temp.tempRequired !== 0 && temp.tempRequired ? temp.tempRequired + 1 : 1;

                                if (!temp.tempRequiredPets) {
                                    temp.tempRequiredPets = [];
                                }

                                temp.tempRequiredPets.push(bonusPet);
                                let exists = finalPetsCollection.find((a) => a.ID === bonusPet.ID);

                                if (!exists) {
                                    finalPetsCollection.push(bonusPet);
                                    // exists = requiredPetsOverall.find((a) => a.ID === bonusPet.ID);
                                    // if (!exists) {
                                    //     requiredPetsOverall.push(bonusPet);
                                    // }
                                }
                            }
                        })
                        if (!innerAdded) {
                            temp.tempMin = null;
                            temp.tempRequired = 0;

                            temp.tempRequiredPets = [];
                            temp.active = false;
                        }
                    }
                }

                //At least 1 rel pet was added, recalc teams with it
                if (added) {
                    // finalPetsCollection = getBestDamagePets(petsCollection, defaultRank, { requiredPets: requiredPetsOverall });
                    time1 = new Date();
                    combinations = getCombinationsInner(finalPetsCollection, Math.min(k, finalPetsCollection.length), Object.values(requiredPetBonusMap));
                    console.log(`got new combinations after the rel calcs`)
                    if (combinations === -1)
                        break;
                }



            }







            bestGroups.push(combinations.team);
            petsCollection = petsCollection.filter((pet) => {

                let res = true;
                for (let i = 0; i < combinations.team.length; i++) {
                    if (combinations.team[i].ID === pet.ID) {
                        res = false;
                        break;
                    }
                }

                return res;
            }
            );
        }
    }
    time4 = new Date();
    console.log(`time to get best combo: ${(time4 - time3) / 1000} seconds`)
    return bestGroups;
}

const calcBestTokenGroupOLD = (petsCollection, defaultRank, numGroups) => {
    const k = 4; // Size of each group

    numGroups = numGroups ? numGroups : 6;

    const memo = {};

    const memoizedGroupScore = (innerGroup) => {
        const key = innerGroup.ID;

        if (!memo[key] || memo[key]) {
            let res = calculateGroupScore(innerGroup.team, defaultRank);
            let sum = res.tokenMult;
            memo[key] = { token: sum, damage: res.groupScore, other: res };
        }
        return memo[key];
    };
    const getCombinationsInner = (array, k) => {

        // let temp = [];
        let best = -1;

        const f = (start, prevCombination) => {

            if (prevCombination.length > 0) {
                let id = '';
                for (let i = 0; i < prevCombination.length; i++) {
                    id = id + prevCombination[i].ID;
                    if (i + 1 !== prevCombination.length) {
                        id = id + ','
                    }
                }
                let x = { ID: id, team: prevCombination };
                // temp.push(x);
                if (best === -1) {
                    best = { ID: id, team: prevCombination, score: memoizedGroupScore(x) };
                }
                else {
                    let cur = memoizedGroupScore(x);

                    if (cur.token === best.score.token) {
                        // if (cur.other.tokenRewardCount === 4) {
                        if (cur.other.tokenRewardCount > 0) {
                            if (cur.damage < best.score.damage) {
                                best = { ID: id, team: prevCombination, score: cur };
                            }
                        }
                        else {
                            if (cur.damage > best.score.damage) {
                                best = { ID: id, team: prevCombination, score: cur };
                            }
                        }

                    }
                    else if (cur.token > best.score.token) {
                        best = { ID: id, team: prevCombination, score: cur };
                    }
                }
            }

            if (prevCombination.length === k) {
                return;
            }
            for (let i = start; i < array.length; i++) {
                f(i + 1, [...prevCombination, array[i]]);
            }
        };
        f(0, []);

        return best;
    }

    let time3 = new Date();
    let time4 = new Date();

    let bestGroups = [];
    for (let g = 0; g < numGroups; g++) {
        const combinations = getCombinationsInner(petsCollection, Math.min(k, petsCollection.length));
        if (combinations === -1) {
            break;
        }
        else {
            let temp = memoizedGroupScore(combinations);
            bestGroups.push(combinations.team);
            petsCollection = petsCollection.filter((pet) => !combinations.team.includes(pet));
        }
    }
    time4 = new Date();
    console.log(`time to get best combo: ${(time4 - time3) / 1000} seconds`)
    return bestGroups;
}


const calcBestTokenGroup = (petsCollection, defaultRank, numGroups, other) => {
    const k = 4; // Size of each group

    numGroups = numGroups ? numGroups : 6;
    let damageMode = 1;//1 = max damage, 2 = min

    const memo = {};

    const memoizedGroupScore = (innerGroup) => {
        const key = innerGroup.ID;

        if (!memo[key] || memo[key]) {
            let res = calculateGroupScore(innerGroup.team, defaultRank);
            let sum = res.tokenMult;
            memo[key] = { token: sum, damage: res.groupScore, other: res };
        }
        return memo[key];
    };
    const getCombinationsInner = (array, k, requiredPetsObj) => {

        // let temp = [];
        let best = -1;


        const f = (start, prevCombination) => {

            let required = 0;
            let ignored = 0;
            let requiredPets = [];
            let ignoredPets = [];

            if (requiredPetsObj) {
                required = requiredPetsObj.min ? requiredPetsObj.min : 0;
                requiredPets = requiredPetsObj.pets ? requiredPetsObj.pets : [];
                ignoredPets = requiredPetsObj.ignoredPets ? requiredPetsObj.ignoredPets : [];
            }

            let requiredFound = 0;
            if (prevCombination.length > 0) {
                let id = '';
                for (let i = 0; i < prevCombination.length; i++) {
                    id = id + prevCombination[i].ID;
                    if (i + 1 !== prevCombination.length) {
                        id = id + ','
                    }

                    if (required > 0) {
                        for (let x = 0; x < requiredPets.length; x++) {
                            if (prevCombination[i].ID == requiredPets[x].ID) requiredFound++;
                        }
                    }
                    if (ignoredPets.length > 0) {
                        for (let x = 0; x < ignoredPets.length; x++) {
                            if (prevCombination[i].ID == ignoredPets[x].ID) {
                                ignored++;
                            }
                        }
                    }
                }
                if (requiredFound === required && ignored === 0) {
                    let x = { ID: id, team: prevCombination };
                    // temp.push(x);
                    if (best === -1) {
                        best = { ID: id, team: prevCombination, score: memoizedGroupScore(x) };
                    }
                    else {
                        let cur = memoizedGroupScore(x);

                        //Max damage
                        if (damageMode === 1) {
                            if (cur.damage > best.score.damage) {
                                best = { ID: id, team: prevCombination, score: cur };
                            }
                        }
                        else {
                            if (cur.token === best.score.token) {
                                // if (cur.other.tokenRewardCount === 4) {
                                if (cur.other.tokenRewardCount > 0) {
                                    if (cur.damage < best.score.damage) {
                                        best = { ID: id, team: prevCombination, score: cur };
                                    }
                                }
                                else {
                                    if (cur.damage > best.score.damage) {
                                        best = { ID: id, team: prevCombination, score: cur };
                                    }
                                }

                            }
                            else if (cur.token > best.score.token) {
                                best = { ID: id, team: prevCombination, score: cur };
                            }
                        }
                    }
                }
                else {
                    let temper = 3;
                }
            }

            if (prevCombination.length === k) {
                return;
            }
            for (let i = start; i < array.length; i++) {
                f(i + 1, [...prevCombination, array[i]]);
            }
        };
        f(0, []);

        if (best.team)
            best.team.sort((a, b) => {
                if (a.Type === b.Type) {
                    return a.ID - b.ID;
                }
                return a.Type - b.Type;
            })

        return best;
    }

    let time3 = new Date();
    let time4 = new Date();

    let bestGroups = [];
    for (let g = 0; g < numGroups; g++) {
        let combinations = -1;

        let newPetsCollection = JSON.parse(JSON.stringify(petsCollection));
        let numTokens = 0;
        let avgTokenPetDmg = 0;
        let tokenPets = [];
        let maxDmgPet;
        let avgdMaxDmg = 0;
        let tknAir = 0;
        let tknGnd = 0;

        newPetsCollection.forEach((pet) => {
            pet.BonusList.forEach((bonus) => {
                //token bonus
                if (bonus.ID === 1016) {
                    tokenPets.push(pet);
                    avgTokenPetDmg += calculatePetBaseDamage(pet, defaultRank);
                    numTokens++;
                    if (pet.Type === 1) {
                        tknGnd++;
                    }
                    else if (pet.Type === 2) {
                        tknAir++;
                    }
                }
            })
        });
        avgTokenPetDmg /= numTokens;

        newPetsCollection = getBestDamagePets(newPetsCollection, defaultRank, { requiredPets: tokenPets });

        newPetsCollection = newPetsCollection.sort((a, b) => calculatePetBaseDamage(b, defaultRank) - calculatePetBaseDamage(a, defaultRank));
        for (let i = 0; i < 2; i++) {
            avgdMaxDmg += calculatePetBaseDamage(newPetsCollection[i], defaultRank);
        }
        avgdMaxDmg /= 2;


        let bestDamageTeam = calcBestDamageGroup(newPetsCollection, defaultRank, 1)[0];

        avgdMaxDmg = bestDamageTeam ? calculateGroupScore(bestDamageTeam, defaultRank) : [];





        //Create a trash team first
        if (numTokens >= 4 && tknAir >= 2 && tknGnd >= 2) {
            //Only force 4 if there are enough for a full synergy
            damageMode = 2;//Set damage mode to min
            combinations = getCombinationsInner(newPetsCollection, Math.min(k, newPetsCollection.length), { pets: tokenPets, min: 4 });
            damageMode = 1;//Set damage back to max

        }
        //Only 1 token pet left,
        else if (numTokens === 1) {
            //If it's the last team, slot it in forcefully
            if (g === numGroups - 1) {
                combinations = getCombinationsInner(newPetsCollection, Math.min(k, newPetsCollection.length),
                    { pets: tokenPets, min: tokenPets.length });
            }
            //
            else {
                combinations = getCombinationsInner(newPetsCollection, Math.min(k, newPetsCollection.length));
            }
        }
        else if (numTokens > 1) {

            let percent = (100 - other.tokenDamageBias) / 100;
            let cutOff = percent * avgdMaxDmg.groupScore; //% of highest available pet's base damage          

            cutOff /= 5.75; // used for comparing with full team score


            let minPets = 2;
            if ((tknAir > 1 && tknGnd > 0) || (tknGnd > 1 && tknAir > 0)) {
                minPets = 3;
            }
            let numTokenGroups = Math.ceil(numTokens / minPets);

            //Maximise this team, this turn
            if (numTokenGroups >= (numGroups - g)) {
                //There are not enough groups for all token pets
                if ((numTokenGroups - (numGroups - g)) >= 0) {
                    damageMode = 1;
                }
                else
                    damageMode = 2;

                combinations = getCombinationsInner(
                    newPetsCollection,
                    Math.min(k, newPetsCollection.length),
                    { pets: tokenPets, min: minPets });
                damageMode = 1;
            }
            else if (avgTokenPetDmg > cutOff) {

                let remainingGroups = numGroups - g;
                //There are not enough groups for all token pets
                if ((remainingGroups - numTokenGroups) >= 0) {
                    damageMode = 1;
                }
                else
                    damageMode = 2;

                //Maximise this team
                combinations = getCombinationsInner(newPetsCollection, Math.min(
                    k,
                    newPetsCollection.length),
                    { pets: tokenPets, min: minPets });
                damageMode = 1;
            }
            //Minimise this team, at the end
            else {
                combinations = getCombinationsInner(
                    newPetsCollection,
                    Math.min(k, newPetsCollection.length),
                    {
                        pets: [],
                        min: 0,
                        ignoredPets: tokenPets
                    });
            }
        }
        //no token pets
        else {
            combinations = getCombinationsInner(newPetsCollection, Math.min(k, newPetsCollection.length));
        }


        if (combinations === -1) {
            break;
        }
        else {
            let temp = memoizedGroupScore(combinations);
            bestGroups.push(combinations.team);
            petsCollection = petsCollection.filter(
                (pet) => {

                    let res = true;
                    for (let i = 0; i < combinations.team.length; i++) {
                        if (combinations.team[i].ID === pet.ID) {
                            res = false;
                            break;
                        }
                    }
                    return res;
                }
            );
        }
    }
    time4 = new Date();
    console.log(`time to get best combo: ${(time4 - time3) / 1000} seconds`)
    // bestGroups.sort()
    return bestGroups;
}


export const findBestGroups = (petsCollection, defaultRank, groupRankCritera, numGroups, other) => {

    switch (groupRankCritera) {
        case 1: //damage focus
            return calcBestDamageGroup(petsCollection, defaultRank, numGroups, other);
        case 2: // token focus
            return calcBestTokenGroup(petsCollection, defaultRank, numGroups, other);
        case 3:
            return calcBestDamageGroup(petsCollection, defaultRank, numGroups, other);
    }
};

let groupCache = {};
function setGroupCache(newCache) {
    groupCache = newCache;
}

function App() {
    const [data, setData] = useState(null);
    const [groups, setGroups] = useState([]);
    const [defaultRank, setDefaultRank] = useState(0);
    const [includeLocked, setIncludeLocked] = useState(false);
    const [selectedItems, setSelectedItems] = useState(defaultPetSelection);
    const [tabSwitch, setTabSwitch] = useState(0);
    const [weightMap, setWeightMap] = useState(DefaultWeightMap);
    const [refreshGroups, setRefreshGroups] = useState(false);
    const [groupRankCritera, setGroupRankCriteria] = useState(1);//1 = overall damage + modifiers, 2 = token/hr + (damage and modifiers), 3 = advanced/custom
    const [comboSelector, setComboSelector] = useState(1);
    const [numTeams, setNumTeams] = useState(-1);
    const [tokenDamageBias, setTokenDamageBias] = useState(15);
    const [availableCustomBonuses, setAvailableCustomBonuses] = useState(
        [
            { id: 1001, label: "POTATO GAIN" },
            { id: 1002, label: "CLASS EXP GAIN" },
            { id: 1003, label: "SKULL GAIN" },
            { id: 1009, label: "RESIDUE GAIN" },
            { id: 1012, label: "DUNGEON TIME GAIN" },
            { id: 1013, label: "DUNGEON DMG" },
            { id: 1014, label: "CARD EXP" },
            { id: 1015, label: "REINC PTS GAIN" },
            { id: 1016, label: "EXPE TOKEN GAIN" },
        ]
    );
    const [activeCustomBonuses, setActiveCustomBonuses] = useState([]);
    const [selectedPets, setSelectedPets] = useState([]);


    const handleItemSelected = (items) => {
        setSelectedItems(items);

        const petData = data?.PetsCollection || [];
        const selectedItemsById = petData.reduce((accum, item) => {
            accum[parseInt(item.ID, 10)] = item;
            return accum;
        }, {})

        const localPets = selectedItems.map(petId => selectedItemsById[petId])
        setSelectedPets(localPets);

        if (items) handleGroups(data, items);
    };

    const setWeights = (newWeightMap) => {
        setWeightMap({ ...newWeightMap });
    }


    const selectComponent = () => {
        switch (tabSwitch) {
            case 4:
                return <Weights weightMap={weightMap} setWeightsProp={setWeights} />;
            case 3:
                return <PetComboList data={data} weightMap={weightMap} />;
            // case 3:
            //     return <ExpeditionCardComponent data={data} weightMap={weightMap} defaultRank={defaultRank} />;
            case 2:
                return <CardComponent data={data} weightMap={weightMap} />;
            case 1:
                return <JSONDisplay
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

                />;
            case 0:
                return <FileUpload onData={handleData} />;
            default:
                return <FileUpload onData={handleData} />;
        }
    };

    const handleData = (uploadedData) => {
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
        console.log(uploadedData)

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
        setSelectedPets(tempPets);

        handleGroups(uploadedData, positiveRankedPets);
        if (tabSwitch === 0) setTabSwitch(1);  // move upload to expedition when done
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
            groups = findBestGroups(localPets, defaultRank, groupRankCritera, numTeams === -1 ? data.ExpeditionLimit : numTeams, { tokenDamageBias: tokenDamageBias, activeBonuses: activeCustomBonuses });
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
            <RepoLink />
            <Container sx={{
                marginLeft: '0px', marginRight: '0px', maxWidth: '100000px !important',
                width: 'calc(100vw - 126px)',
                maxHeight: `calc(100vh - 56px)`,
                height: `calc(100vh - 56px)`,
            }}>
                <Box sx={{ width: '100%', height: '100%', overFlowX: 'hidden' }} className={"main-content"}>
                    {selectComponent()}
                </Box>
                {/* Add extra space at the bottom */}
                {/* <Box sx={{ height: '64px' }} />  */}
                <Box sx={{ width: '100%', position: 'fixed', bottom: 0 }}>
                    <BottomNavigation
                        showLabels
                        value={tabSwitch}
                        onChange={(event, newValue) => setTabSwitch(newValue)}
                    >
                        <BottomNavigationAction label="Upload" icon={<InfoIcon />} />
                        {!!data && <BottomNavigationAction label="Expedition" icon={<InfoIcon />} />}
                        {!!data && <BottomNavigationAction label="Charges" icon={<BadgeIcon />} />}
                        {/*{!!data && <BottomNavigationAction label="Exp. Rewards" icon={<BadgeIcon />} />}*/}
                        {!!data && <BottomNavigationAction label="Pet Combo List" icon={<BadgeIcon />} />}
                        {/*{!!data && <BottomNavigationAction label="Weighted Pets" icon={<ScaleIcon />} />}*/}
                        {<BottomNavigationAction label="Weights" icon={<ScaleIcon />} />}
                    </BottomNavigation>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default App;
