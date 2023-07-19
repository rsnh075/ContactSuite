window.OPTIONAL_EXIT    = Math.pow(10, 8) * 2;
window.MANDATORY_EXIT   = Math.pow(10, 8);
window.REDIRECT_EXIT    = Math.pow(10, 8) * -1;

export let MODULE_LABELS = {};

const MODULE_LABELS_EN = {
  15               : { moduleTitle: 'Set variable',           moduleBaseName: 'Set variable',                moduleIcon: '&#xF16B'},
  20               : { moduleTitle: 'Hangup',                 moduleBaseName: 'Hangup',                      moduleIcon: '&#xFDCB'},
  45               : { moduleTitle: 'E-mail',                 moduleBaseName: 'E-mail',                      moduleIcon: '&#xF1EE'},
  58               : { moduleTitle: 'Voicemail',              moduleBaseName: 'Voicemail',                   moduleIcon: '&#xF57D'},
  105              : { moduleTitle: 'Play',                   moduleBaseName: 'Play',                        moduleIcon: '&#xF40B'},
  109              : { moduleTitle: 'Destinations',           moduleBaseName: 'Call',                        moduleIcon: '&#xF61C'},
  168              : { moduleTitle: 'Openinghours',           moduleBaseName: 'OpeningHours_2',              moduleIcon: '&#xFDFA'},
  170              : { moduleTitle: 'Destinations',           moduleBaseName: 'CallOut',                     moduleIcon: '&#xF61C'},
  110              : { moduleTitle: 'Waitstate',              moduleBaseName: 'Wait State',                  moduleIcon: '&#xF51F'},
  125              : { moduleTitle: 'Setvars',                moduleBaseName: 'Set variables',               moduleIcon: '&#xF51F'},
};

MODULE_LABELS_EN[REDIRECT_EXIT] = { moduleTitle: 'Redirect to',          moduleBaseName: 'Redirect',       moduleIcon: '&#xF1D0'};

const MODULE_LABELS_NL = {
  15               : { moduleTitle: 'Stel variabele in',      moduleBaseName: 'Set variable',                moduleIcon: '&#xF16B'},
  20               : { moduleTitle: 'Ophangen',               moduleBaseName: 'Hangup',                      moduleIcon: '&#xFDCB'},
  45               : { moduleTitle: 'E-mail',                 moduleBaseName: 'E-mail',                      moduleIcon: '&#xF1EE'},
  58               : { moduleTitle: 'Voicemail',              moduleBaseName: 'Voicemail',                   moduleIcon: '&#xF57D'},
  105              : { moduleTitle: 'Melding',                moduleBaseName: 'Play',                        moduleIcon: '&#xF40B'},
  109              : { moduleTitle: 'Bestemmingen',           moduleBaseName: 'Call',                        moduleIcon: '&#xF61C'},
  168              : { moduleTitle: 'Openingstijden',         moduleBaseName: 'OpeningHours_2',              moduleIcon: '&#xFDFA'},
  170              : { moduleTitle: 'Bestemmingen',           moduleBaseName: 'CallOut',                     moduleIcon: '&#xF61C'},
  110              : { moduleTitle: 'Waitstate',              moduleBaseName: 'Wait State',                  moduleIcon: '&#xF51F'},
  125              : { moduleTitle: 'Setvars',                moduleBaseName: 'Set variables',               moduleIcon: '&#xF51F'},
};

MODULE_LABELS_NL[REDIRECT_EXIT] = { moduleTitle: 'Omleiden naar',          moduleBaseName: 'Omleiden',     moduleIcon: '&#xF1D0'};

MODULE_LABELS = {
  'en' : Object.assign({}, MODULE_LABELS_EN),
  'nl' : Object.assign({}, MODULE_LABELS_NL)
}