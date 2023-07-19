export let EXIT_LABELS = {};

/**
 * Add in Scriptmanager.vue the alternate id in the alternateModules property
 */

const EXIT_LABELS_EN = {
  ExitSuccess       : {name : 'On succes',  label : 'Place a module for success',               icon : '&#xF5E1', color: '#3AAA35', size: '1.2em'},
  Exit0             : {name : 'Keypress 0', label : 'Place a module for when the 0 is pressed', icon : '&#x0030', color: '#213A8F', size: '1.2em'},
  Exit1             : {name : 'Keypress 1', label : 'Place a module for when the 1 is pressed', icon : '&#x0031', color: '#213A8F', size: '1.2em'},
  Exit2             : {name : 'Keypress 2', label : 'Place a module for when the 2 is pressed', icon : '&#x0032', color: '#213A8F', size: '1.2em'},
  Exit3             : {name : 'Keypress 3', label : 'Place a module for when the 3 is pressed', icon : '&#x0033', color: '#213A8F', size: '1.2em'},
  Exit4             : {name : 'Keypress 4', label : 'Place a module for when the 4 is pressed', icon : '&#x0034', color: '#213A8F', size: '1.2em'},
  Exit5             : {name : 'Keypress 5', label : 'Place a module for when the 5 is pressed', icon : '&#x0035', color: '#213A8F', size: '1.2em'},
  Exit6             : {name : 'Keypress 6', label : 'Place a module for when the 6 is pressed', icon : '&#x0036', color: '#213A8F', size: '1.2em'},
  Exit7             : {name : 'Keypress 7', label : 'Place a module for when the 7 is pressed', icon : '&#x0037', color: '#213A8F', size: '1.2em'},
  Exit8             : {name : 'Keypress 8', label : 'Place a module for when the 8 is pressed', icon : '&#x0038', color: '#213A8F', size: '1.2em'},
  Exit9             : {name : 'Keypress 9', label : 'Place a module for when the 9 is pressed', icon : '&#x0039', color: '#213A8F', size: '1.2em'},
  ExitPound         : {name : 'Keypress #', label : 'Place a module for when the # is pressed', icon : '&#xF423', color: '#213A8F', size: '0.9em'},
  ExitStar          : {name : 'Keypress *', label : 'Place a module for when the * is pressed', icon : '&#xF4CE', color: '#213A8F', size: '0.9em'},
  ExitTimeout       : {name : 'On timeout', label : 'Place a module when there is a timeout',   icon : '&#xF953', color: '#4BAAF0', size: '1em'},
  ExitGorilla       : {name : 'On gorilla', label : 'Place a module for a API',                 icon : '&#x0047', color: '#662483', size: '1.2em'},
  ExitError         : {name : 'On error',   label : 'Place a module for error handling',        icon : '&#xF15A', color: '#E6332A', size: '1.2em'},

  Exit0_110         : {name : 'Exit 0',   label : 'Place a module on Exit 0',          icon : '&#xFC7A', color: '#B37700', size: '1.2em'},
  Exit1_110         : {name : 'Exit 1',   label : 'Place a module on Exit 1',          icon : '&#xFC7C', color: '#B37700', size: '1.2em'},
  Exit2_110         : {name : 'Exit 2',   label : 'Place a module on Exit 2',          icon : '&#xFC7E', color: '#B37700', size: '1.2em'},
  Exit3_110         : {name : 'Exit 3',   label : 'Place a module on Exit 3',          icon : '&#xFC80', color: '#B37700', size: '1.2em'},
  Exit4_110         : {name : 'Exit 4',   label : 'Place a module on Exit 4',          icon : '&#xFC82', color: '#B37700', size: '1.2em'},
  Exit5_110         : {name : 'Exit 5',   label : 'Place a module on Exit 5',          icon : '&#xFC84', color: '#B37700', size: '1.2em'},
  Exit6_110         : {name : 'Exit 6',   label : 'Place a module on Exit 6',          icon : '&#xFC86', color: '#B37700', size: '1.2em'},
  Exit7_110         : {name : 'Exit 7',   label : 'Place a module on Exit 7',          icon : '&#xFC88', color: '#B37700', size: '1.2em'},
  Exit8_110         : {name : 'Exit 8',   label : 'Place a module on Exit 8',          icon : '&#xFC8A', color: '#B37700', size: '1.2em'},
  Exit9_110         : {name : 'Exit 9',   label : 'Place a module on Exit 9',          icon : '&#xFC8C', color: '#B37700', size: '1.2em'},
  ExitError_110     : {name : 'On error', label : 'Place a module for error handling', icon : '&#xF15A', color: '#E6332A', size: '1.2em'},

  ExitSuccess_170   : {name : 'On connection',        label : 'Place a module for connection succes',   icon : '&#xF5E1', color: '#3AAA35', size: '1.2em'},
  Exit1_170         : {name : 'Group full',           label : 'Place a module for group full',          icon : '&#xF848', color: '#E37403', size: '0.9em'},
  Exit2_170         : {name : 'Queue handling',       label : 'Place a module for queue handling',      icon : '&#xF571', color: '#E37403', size: '1.1em'},
  Exit3_170         : {name : 'No agents available',  label : 'Place a module for no agents available', icon : '&#xF012', color: '#E37403', size: '1em'},
  Exit6_170         : {name : 'Q timeout',            label : 'Place a module for a Q timeout',         icon : '&#xF51B', color: '#E37403', size: '1em'},
  ExitError_170     : {name : 'On error',             label : 'Place a module for error handling',      icon : '&#xF15A', color: '#E6332A', size: '1.2em'},
};

const EXIT_LABELS_NL = {
  ExitSuccess       : {name : 'Bij succes',   label : 'Plaats een module als het succesvol is',             icon : '&#xF5E1', color: '#3AAA35', size: '1.2em'},
  Exit0             : {name : 'Toets 0',      label : 'Plaats een module als de 0 is ingetoetst',           icon : '&#x0030', color: '#213A8F', size: '1.2em'},
  Exit1             : {name : 'Toets 1',      label : 'Plaats een module als de 1 is ingetoetst',           icon : '&#x0031', color: '#213A8F', size: '1.2em'},
  Exit2             : {name : 'Toets 2',      label : 'Plaats een module als de 2 is ingetoetst',           icon : '&#x0032', color: '#213A8F', size: '1.2em'},
  Exit3             : {name : 'Toets 3',      label : 'Plaats een module als de 3 is ingetoetst',           icon : '&#x0033', color: '#213A8F', size: '1.2em'},
  Exit4             : {name : 'Toets 4',      label : 'Plaats een module als de 4 is ingetoetst',           icon : '&#x0034', color: '#213A8F', size: '1.2em'},
  Exit5             : {name : 'Toets 5',      label : 'Plaats een module als de 5 is ingetoetst',           icon : '&#x0035', color: '#213A8F', size: '1.2em'},
  Exit6             : {name : 'Toets 6',      label : 'Plaats een module als de 6 is ingetoetst',           icon : '&#x0036', color: '#213A8F', size: '1.2em'},
  Exit7             : {name : 'Toets 7',      label : 'Plaats een module als de 7 is ingetoetst',           icon : '&#x0037', color: '#213A8F', size: '1.2em'},
  Exit8             : {name : 'Toets 8',      label : 'Plaats een module als de 8 is ingetoetst',           icon : '&#x0038', color: '#213A8F', size: '1.2em'},
  Exit9             : {name : 'Toets 9',      label : 'Plaats een module als de 9 is ingetoetst',           icon : '&#x0039', color: '#213A8F', size: '1.2em'},
  ExitPound         : {name : 'Toets #',      label : 'Plaats een module als de # is ingetoetst',           icon : '&#xF423', color: '#213A8F', size: '0.9em'},
  ExitStar          : {name : 'Toets *',      label : 'Plaats een module als de * is ingetoetst',           icon : '&#xF4CE', color: '#213A8F', size: '0.9em'},
  ExitTimeout       : {name : 'Bij timeout',  label : 'Plaats een module als er een timeout is opgetreden', icon : '&#xF953', color: '#4BAAF0', size: '1em'},
  ExitGorilla       : {name : 'Bij Gorrilla', label : 'Plaats een module voor een API',                     icon : '&#x0047', color: '#662483', size: '1.2em'},
  ExitError         : {name : 'Bij een fout', label : 'Plaats een module voor de foutafhandeling',          icon : '&#xF15A', color: '#E6332A', size: '1.2em'},

  Exit0_110         : {name : 'Exit 0',       label : 'Plaats een module op Exit 0',               icon : '&#xFC7A', color: '#B37700', size: '1.2em'},
  Exit1_110         : {name : 'Exit 1',       label : 'Plaats een module op Exit 1',               icon : '&#xFC7C', color: '#B37700', size: '1.2em'},
  Exit2_110         : {name : 'Exit 2',       label : 'Plaats een module op Exit 2',               icon : '&#xFC7E', color: '#B37700', size: '1.2em'},
  Exit3_110         : {name : 'Exit 3',       label : 'Plaats een module op Exit 3',               icon : '&#xFC80', color: '#B37700', size: '1.2em'},
  Exit4_110         : {name : 'Exit 4',       label : 'Plaats een module op Exit 4',               icon : '&#xFC82', color: '#B37700', size: '1.2em'},
  Exit5_110         : {name : 'Exit 5',       label : 'Plaats een module op Exit 5',               icon : '&#xFC84', color: '#B37700', size: '1.2em'},
  Exit6_110         : {name : 'Exit 6',       label : 'Plaats een module op Exit 6',               icon : '&#xFC86', color: '#B37700', size: '1.2em'},
  Exit7_110         : {name : 'Exit 7',       label : 'Plaats een module op Exit 7',               icon : '&#xFC88', color: '#B37700', size: '1.2em'},
  Exit8_110         : {name : 'Exit 8',       label : 'Plaats een module op Exit 8',               icon : '&#xFC8A', color: '#B37700', size: '1.2em'},
  Exit9_110         : {name : 'Exit 9',       label : 'Plaats een module op Exit 9',               icon : '&#xFC8C', color: '#B37700', size: '1.2em'},
  ExitError_110     : {name : 'Bij een fout', label : 'Plaats een module voor de foutafhandeling', icon : '&#xF15A', color: '#E6332A', size: '1.2em'},

  ExitSuccess_170   : {name : 'Bij connectie',            label : 'Plaats een module voor succesvol verbinden',      icon : '&#xF5E1', color: '#3AAA35', size: '1.2em'},
  Exit1_170         : {name : 'Groep vol',                label : 'Plaats een module voor groep vol',                icon : '&#xF848', color: '#E37403', size: '0.9em'},
  Exit2_170         : {name : 'Wachtrij',                 label : 'Plaats een module voor wachtrij afhandeling',     icon : '&#xF571', color: '#E37403', size: '1.1em'},
  Exit3_170         : {name : 'Geen agenten beschikbaar', label : 'Plaats een module voor geen agenten beschikbaar', icon : '&#xF012', color: '#E37403', size: '1em'},
  Exit6_170         : {name : 'Q timeout',                label : 'Plaats een module als de Q een timeout heeft',    icon : '&#xF51B', color: '#E37403', size: '1em'},
  ExitError_170     : {name : 'Bij een fout',             label : 'Plaats een module voor de foutafhandeling',       icon : '&#xF15A', color: '#E6332A', size: '1.2em'},

};

EXIT_LABELS = {
  'en' : Object.assign({}, EXIT_LABELS_EN),
  'nl' : Object.assign({}, EXIT_LABELS_NL)
}