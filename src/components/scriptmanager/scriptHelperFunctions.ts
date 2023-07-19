const copyOf = (item) => {
    return JSON.parse(JSON.stringify(item));
};

const expandArray = (id, ModuleParameters) => {
    // remember copy of last row
    const elements = copyOf(ModuleParameters.filter(item => item.ArrayId === id && item.RowId === 0));
    const rowCount = Math.max(...elements.filter(item => item.CurrentValue !== '').map(item => item.CurrentValue.split(';').length));
    if (rowCount === 0) return;

    const elementValues = [];
    const firstIx = ModuleParameters.findIndex(item => item.ArrayId === id); // first element
    for (let i = 0; i < elements.length; i++) {
        elementValues.push(ModuleParameters[firstIx + i].CurrentValue.split(';'));
    }

    for (let row = 0; row < rowCount; row++) {
        if (row > 0) { // add empty row
            for (let i = 0; i < elements.length; i++) {
                elements[i].CurrentValue = '';
                elements[i].RowId = row;
                ModuleParameters.splice(firstIx + (row * elements.length) + i, 0, copyOf(elements[i]));
            }
        }
        for (let i = 0; i < elements.length; i++) {
            const ix = firstIx + (row * elements.length) + i;
            ModuleParameters[ix].CurrentValue = elementValues[i][row];
        }
    }
};

const handleArrayItems = (arrayId, ModuleParameters) => {
    if (arrayId === null) return;
    const arrayItems = ModuleParameters.filter(item => item.ArrayId === arrayId);
    const uniqueRowNrs = [...new Set(arrayItems.map(item => item.RowId))];
    let emptyRowCount = 0;
    for (let i = 0; i < uniqueRowNrs.length; i++) {
        const rowItems = arrayItems.filter(item => item.RowId === uniqueRowNrs[i]);
        if (rowItems.every(item => !item.CurrentValue || item.CurrentValue?.trim() === '')) {
            emptyRowCount++;
        }
    }

    if (emptyRowCount === 0) {
        const lastIx = ModuleParameters.findLastIndex(item => item.ArrayId === arrayId);
        const elements = copyOf(ModuleParameters.filter(item => item.ArrayId === arrayId && item.RowId === 0));
        elements.forEach(item => {
            item.RowId = ModuleParameters[lastIx].RowId + 1;
            item.CurrentValue = '';
        });
        ModuleParameters.splice(lastIx + 1, 0, ...(elements));
    } else if (emptyRowCount > 1) {
        const emptyIxs = [];
        for (let i = 0; i < ModuleParameters.length; i++) {
            if (ModuleParameters[i].ArrayId === arrayId &&
                (!ModuleParameters[i].CurrentValue || ModuleParameters[i].CurrentValue?.trim() === '')) {
                emptyIxs.push(i);
            }
        }
        emptyIxs.pop(); // don't remove last empty item;
        emptyIxs.reverse();
        for (let i = 0; i < emptyIxs.length; i++) {
            ModuleParameters.splice(emptyIxs[i], 1);
    }
    }
};

const getUniqueId = () => '_' + Math.random().toString(32).substring(2, 11);

const prepareArrays = (ModuleParameters) => {
    const arrayElements = ModuleParameters.filter(item => item.ArrayId !== null);
    if (arrayElements.length === 0) return;

    const uniqueArrayIds = [...new Set(arrayElements.map(item => item.ArrayId))];
    uniqueArrayIds.forEach(id => {
        expandArray(id, ModuleParameters);
    });
};

export {
    prepareArrays,
    handleArrayItems,
    getUniqueId
}
