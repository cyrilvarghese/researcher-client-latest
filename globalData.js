let customCompIndex = 0;
let currentCustomPartIndex = 0;

export function getGlobalData() {
    return { customCompIndex, currentCustomPartIndex };
}

export function setGlobalData(compIndex, partIndex) {
    customCompIndex = compIndex;
    currentCustomPartIndex = partIndex;
}

export function incrementPartIndex() {
    currentCustomPartIndex++;
}