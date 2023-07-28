


const fs = require('fs');
const pako = require('pako');

fs.readFile('./fapi-save.txt', null, (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const decompressedData = pako.inflate(data);
    const textDecoder = new TextDecoder('utf-8');
    const decodedString = textDecoder.decode(decompressedData);

    const startPosition = decodedString.indexOf('{');
    const endPosition = decodedString.lastIndexOf('}') + 1;
    const jsonString = decodedString.slice(startPosition, endPosition);
    let parsedJson = JSON.parse(jsonString);
    for (let i = 1; i < parsedJson.PetsCollection.length; i++) {
        if (!parsedJson.PetsCollection[i].Locked) {
            console.log(`here`)
            parsedJson.PetsCollection[i].Locked = 1;
        }
    }

    let encodedStr = (new TextEncoder()).encode(JSON.stringify(parsedJson));
    let compressed = pako.deflate(encodedStr)
    fs.writeFileSync('./fapi_save_modified.txt', compressed)
});

