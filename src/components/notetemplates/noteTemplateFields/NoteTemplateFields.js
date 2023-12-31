export const NOTEFIELDS = [ //add new field initialy starts with:
  {
    "fieldtype"            : "TextField",
    "fieldtypename_nl"     : "Korte Tekst",
    "fieldtypename_en"     : "Short text",
    "fieldwidth"           : "Single",
    "fieldheight"          : 1,
    "hasfieldheighticon"   : false,
    "fieldlabel"           : {"nl" : "", "en" : ""},
    "fieldproperty"        : "",
    "fieldrequired"        : false,
    "metadatafield"        : false,
    "fieldissubject"       : false,
    "fieldicon"            : "&#xF9A8;"
  },{
    "fieldtype"            : "SelectField",
    "fieldtypename_nl"     : "Dropdown",
    "fieldtypename_en"     : "Dropdown",
    "fieldwidth"           : "Single",
    "fieldheight"          : 1,
    "hasfieldheighticon"   : false,
    "fieldlabel"           : {"nl" : "", "en" : ""},
    "fieldproperty"        : "",
    "fieldlistoptions"     : [],
    "fieldrequired"        : false,
    "metadatafield"        : false,
    "fieldissubject"       : false,
    "fieldicon"            : "&#xF9D5;"
  },{
    "fieldtype"            : "RadioListField",
    "fieldtypename_nl"     : "Meerkeuze",
    "fieldtypename_en"     : "Multiple choice",
    "fieldwidth"           : "Single",
    "fieldheight"          : 1,
    "hasfieldheighticon"   : false,
    "fieldlabel"           : {"nl" : "", "en" : ""},
    "fieldproperty"        : "",
    "fieldlistradio"       : [],
    "fieldrequired"        : false,
    "metadatafield"        : false,
    "fieldissubject"       : false,
    "fieldicon"            : "&#xF43E;"
  },{
    "fieldtype"            : "TextAreaField",
    "fieldtypename_nl"     : "Lange tekst",
    "fieldtypename_en"     : "Long text",
    "fieldwidth"           : "Double",
    "fieldheight"          : 2,
    "hasfieldheighticon"   : true,
    "fieldlabel"           : {"nl" : "", "en" : ""},
    "fieldprefilledtext"   : "",
    "fieldproperty"        : "",
    "fieldrequired"        : false,
    "metadatafield"        : false,
    "fieldissubject"       : false,
    "fieldicon"            : "&#xF9A9;"
  },{
    "fieldtype"            : "ReferredToField",
    "fieldtype"            : "ReferredToField",
    "fieldtypename_nl"     : "Doorverbonden naar",
    "fieldtypename_en"     : "Referred to",
    "fieldwidth"           : "Single",
    "fieldheight"          : 1,
    "hasfieldheighticon"   : false,
    "fieldlabel"           : {"nl" : "Doorverbonden met", "en" : "Referred to"},
    "fieldproperty"        : "ServiceAgentNumber",
    "metadatafield"        : true,
    "fieldissubject"       : false,
    "fieldicon"            : "&#xF3F4;"
  },{
    "fieldtype"            : "WhiteSpaceField",
    "fieldtypename_nl"     : "Witruimte",
    "fieldtypename_en"     : "Spacer",
    "fieldwidth"           : "Single",
    "hasfieldheighticon"   : true,
    "fieldheight"          : 1,
    "fieldlabel"           : {"nl" : "Witruimte", "en" : "Spacer"},
    "metadatafield"        : true,
    "fieldissubject"       : false,
    "fieldicon"            : "&#xF489;"
  }
];