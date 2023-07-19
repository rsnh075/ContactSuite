/**
 *
 *
 *
 */

const filterListOfObjects = (searchStr:string, list:object[], searchOnProps:string[]) => {

    const filterListOnString = (str:string, l:object[],  props:string[]) => {
        if(str != '' && props?.length !== 0) {
            return l.reduce((result:object[], item:object) => {
                props.every(p => {
                    if (
                        item[p] &&
                        typeof p === 'string' &&
                        String(item[p]).toLowerCase().indexOf(str) !== -1
                    ) {
                        result = result.concat(item);
                        return false;
                    } else {
                        return true;
                    }
                });
                return result;
            }, []);
        }
        else {
            return l;
        }
    };

    return filterListOnString(String(searchStr).toLowerCase(), list,  searchOnProps) as object[];
};

export {
    filterListOfObjects
}