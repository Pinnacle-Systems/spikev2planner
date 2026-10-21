export function convertToImportFormat(importedData, headerNames) {

    const transformedData = importedData.map((row) => {
        let newRow = {};
        const keys = Object.keys(row)
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            newRow[convertSpaceToUnderScore(key)] = row[key] ? row[key] : undefined;
        }
        const obj = {};
        headerNames.forEach((header) => {
            obj[convertSpaceToUnderScore(header)] = newRow[header] ? new String(newRow[header]).trim() : undefined;
        });
        return obj;
    });
    return transformedData
}

export function convertSpaceToUnderScore(str) {
    return str.toLowerCase().trim().split(' ').join('_');
}