/**
 *
 *
 *
 */

 const dynamicSort = (property:string) => {
  let sortOrder:Number = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return (a, b) => {
    if(isNaN(a[property]) || typeof a[property] === "boolean" || a[property] == null || a[property] == '') {
      let _a = String(a[property]),
          _b = String(b[property]);
      let result = (_a.toLowerCase() < _b.toLowerCase()) ? -1 : (_a.toLowerCase() > _b.toLowerCase())  ? 1 : 0;
      return result * sortOrder;
    } else {
      let _a = parseInt(a[property]),
          _b = parseInt(b[property]);
      let result = (_a < _b) ? -1 : (_a > _b)  ? 1 : 0;
      return result * sortOrder;
    }
  }
}

//refactor identical
const dynamicSortMultiple = (...theArgs) => {
  let props = theArgs;
  return (obj1, obj2) => {
    let i = 0,
    result = 0,
    numberOfProperties = props.length;
    while (result === 0 && i < numberOfProperties) {
      result = dynamicSort(props[i])(obj1, obj2);
      i++;
    }
    return result;
  };
};
//identical
const dynamicSortMultipleProps = (...theArgs) => {
  let props = theArgs;
  return (obj1, obj2) => {
    let i = 0,
    result = 0,
    numberOfProperties = props.length;
    while (result === 0 && i < numberOfProperties) {
      result = dynamicSort(props[i])(obj1, obj2);
      i++;
    }
    return result;
  }
}

export {
  dynamicSort,
  dynamicSortMultiple,
  dynamicSortMultipleProps
}