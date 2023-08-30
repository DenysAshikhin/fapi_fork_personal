import React from 'react';
import './PetItem.css';
import helper from '../util/helper.js'

import { BonusMap } from "../itemMapping";

const filterBonuses = (bonuses, filterFn) => {
    return bonuses
        .filter(filterFn);
};

const PetItem = ({ petData, isSelected, onClick, data, weightMap, petScoreFn, defaultRank, borderActive, enabledBonusHighlight, fullPetData }) => {
    if (!!data === false) return <div></div>;
    const { petId, img, name } = petData;

    // Find the pet from the data.PetsCollection
    const pet = data.PetsCollection.find(p => p.ID === petId);

    if (!pet) return null; // In case the pet is not found in the collection

    const rank = defaultRank ? defaultRank : pet.Rank;
    const level = pet.Level;
    const totalScore = Number(
        Number(data?.PetDamageBonuses) * pet.BaseDungeonDamage * (1.0 + rank * 0.05) * 5
    ).toExponential(2);

    // const weightedBonuses = filterBonuses(pet.BonusList, (bonus) => {
    //     return bonus.ID < 1000;
    // }).reduce((accum, activePetBonus) => {
    //     const {ID, } = activePetBonus;
    //     const result = weightMap[ID]?.weight;
    //     if (result) accum += result;
    //     return accum;
    // }, 0);

    const weightedActiveScore = petScoreFn ? petScoreFn(pet) : 0;

    const section1Bonuses = (
        <ul>
            {filterBonuses(pet.BonusList, (bonus) => {
                return bonus.ID < 1000;
            }).map((activePetBonus, i) => {
                const bonusBase = Number(1.0 + activePetBonus.Gain);
                const bonusPower = Number(defaultRank ? defaultRank : pet.Level);
                const result = (Math.pow(bonusBase, bonusPower) - 1) * (1 + .02 * Number(rank));

                return (
                    <li key={i}>
                        {BonusMap[activePetBonus.ID]?.label}: {result.toExponential(2)}
                    </li>
                );
            })}
        </ul>
    );

    const section2Bonuses = (
        <ul>
            {filterBonuses(pet.BonusList, (bonus) => bonus.ID >= 1000 && bonus.ID < 5000)
                .map((activePetBonus, i) => {
                    return (
                        <li key={i}>
                            {BonusMap[activePetBonus.ID]?.label}: {Number(activePetBonus.Power).toExponential(2)}
                        </li>
                    );
                })}
        </ul>
    );


    let numHighlights = [];
    if (enabledBonusHighlight) {
        for (const [key, value] of Object.entries(enabledBonusHighlight)) {
            if (value) {
                let found = fullPetData.BonusList.find((a) => a.ID === Number(key));
                if (found) {
                    numHighlights.push(key)
                }
            }
        }
    }

    return (
        <div
            key={petId}
            onClick={onClick}
            className={`item-tile${pet.Type === 1 ? '-ground ' : '-air '} ${isSelected ? '' : 'unselected'}`}
        // className={`item-tile ${isSelected ? '' : 'unselected'}`}
        >
            <div
                className="item-image-container"
                style={{
                    border: borderActive ? 'black 1px solid' : '',
                    position: 'relative'
                }}>
                {numHighlights.map((item, index) => {
                    return (<div
                        style={{
                            background: helper.bonusColorMap[item].color,
                            position: 'absolute',
                            top: '0%',
                            left: `${(100 / numHighlights.length) * index}%`,
                            height: '100%',
                            width: `${100 / numHighlights.length}%`,
                            zIndex: -1
                        }}
                    >

                    </div>)
                })}
                <div className="tooltip">
                    <span className="tooltip-content">
                        <h3>
                            {name} (Level: {level}) (Rank: {rank}) ({totalScore})
                        </h3>
                        <span>
                            <h4>Active Bonuses</h4>
                            {section1Bonuses}
                        </span>
                        <span>
                            <h4>Expedition Bonuses:</h4>
                            {section2Bonuses}
                        </span>
                    </span>
                </div>
                {/* <div className="item-image"> */}
                <img src={img} alt={name} className='item-image' />
                {/* </div> */}
            </div>
        </div>
    );
};

const StaticPetItem = ({ petData }) => {
    const { petId, img, name } = petData;
    return (
        // <div key={petId} className={`static-item-tile`}>
        // <div
        //     className="item-image-container"
        //     style={{
        //         position: 'relative'
        //     }}>
        <img src={img} alt={name} className='item-image' />
        //  </div> 
        // </div>
    );
};

export { StaticPetItem };

export default PetItem;
