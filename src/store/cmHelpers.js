
export const browserLanguage = () => {
  let _browserLanguage    = window.navigator.language,
      browserLanguage     = String(_browserLanguage.split("-")[0]).toLowerCase();
      if(browserLanguage !== 'nl' && browserLanguage !== 'en') browserLanguage = 'en';

  return browserLanguage;
}

export const checkMenuPermissions = (menu, arr) => {
  let _menu = menu.filter(item => {

    let _prop = item.hasOwnProperty('appMenu') ? 'appMenu' : 'subMenu';

    if(item[_prop].length == 0 && arr.indexOf(item.Code) != -1) {
      return item;
    }
    if(item[_prop].length > 0 && arr.indexOf(item.Code) != -1) {
      let _subMenu = checkMenuPermissions(item[_prop], arr);
      if(_subMenu.length != 0) { //wel subMenu items maar geen actieve
        item[_prop] = [..._subMenu];
        return item;
      }
    }
  });
  return _menu;
}

export const collectPropValues = (list, propNames) => {
  let _values = list.reduce((urls, item) => {
    let _prop = propNames.find(prop => item.hasOwnProperty(prop));
    if(item[_prop].length === 0) {
      urls = [...urls, item.url];
    }
    if(item[_prop].length > 0) {
      let _children = collectPropValues(item[_prop], propNames);
      urls = [...urls, ..._children];
    }
    return urls;
  }, []);

  return _values;
};

export const randProperty = (obj) => {
  var objLength = Object.keys(obj).length;
  return Math.floor(Math.random() * objLength);
}
