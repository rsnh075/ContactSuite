/**
 *
 *
 *
 */

const formatPhoneNumber = (val:String, ready:Function) => {
  let _niceNumber:string[]     = [],
      _numberPattern:RegExp = /[0-9]/;

  if(val.charAt(0) === '+') {
    val = '00' + val.substring(1);
  }

  for(const c of val) {
    if(_numberPattern.test(c)) {
      _niceNumber.push(c);
    }
  };

  if(typeof ready === 'function')
    ready(_niceNumber.join(''));
};

export {
  formatPhoneNumber
}