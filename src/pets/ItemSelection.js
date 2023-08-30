import React from 'react';
import './ItemSelection.css';
import { petNameArray } from '../itemMapping';
import PetItem from './PetItem';

const ItemSelection = ({ selectedItems, onItemSelected, data, weightMap, defaultRank }) => {
    const isSelected = (petId) => {
        return selectedItems.includes(petId);
    };

    const handleItemClick = (petId) => {
        if (isSelected(petId)) {
            onItemSelected(selectedItems.filter((id) => id !== petId));
        } else {
            onItemSelected([...selectedItems, petId]);
        }
    };

    const renderPet = (petData) => {
        const { petId } = petData;
        const isItemSelected = isSelected(petId);

        return (
            <PetItem
                key={petId}
                petData={petData}
                data={data}
                isSelected={isItemSelected}
                onClick={() => handleItemClick(petId)}
                weightMap={weightMap}
                defaultRank={defaultRank}
            />
        );
    };

    let newPetArray = [...petNameArray];
    let lastID = newPetArray[newPetArray.length - 1].petId;

    for (let i = lastID - 1; i < data.PetsCollection.length; i++) {
        if (data.PetsCollection[i].ID > lastID) {
            let temp = {
                img: '/fapi_fork_personal/pets/missing.png',
                location: '??-??',
                name: 'Unknown',
                petId: data.PetsCollection[i].ID
            }
            newPetArray.push(temp)
        }
    }


    return (
        <div className="item-selection">
            {newPetArray.map(renderPet)}
        </div>
    );
};

export default ItemSelection;
