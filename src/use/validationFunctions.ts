/**
 * 
 * 
 * 
 */

 const isNumber = (val:string):Boolean => {
  let regex = /^[0-9]\d*$/;
  return regex.test(val);       
};

export {
  isNumber
}