import { browserLanguage }    from './../store/cmHelpers';
import { IPCCCUserSettings }  from "./../ipccc/js/usersettings.js"
import { IPCCCCommand }             from './../ipccc/js/command';

export enum LanguageCode {
    Nederlands = 1,
    Engels = 2,
    Frans = 3,
    Duits = 4,
    Zweeds = 5,
    Fins = 6,
    Noors = 7,
    Deens = 8,
    Hongaars = 9,
    Spaans = 10,
    Italiaans = 11,
    Pools = 12,
    Vlaams = 13,
};

const APP_ID: string             = 'LanguageSetting',
      PREFERREDLANGUAGE: string  = 'PreferredLanguage';

export const getLangSettings = ():Promise<string> => {
  return new Promise<string>((resolve: Function, reject: Function):void => {
    IPCCCUserSettings.Get(APP_ID).then((result: Array<any>):void => {
      if(result.length > 0 && result[0].Name == PREFERREDLANGUAGE) {
        resolve(JSON.parse(result[0].Data).preferredlanguage);
      } else {
        console.log('No saved app settings or preferred language, browser language is returned');
        resolve(browserLanguage());
      }
    }).catch((error:string):void => {
      reject(error);
    });
  });
};

export const saveLangSettings = (langCode:string):Promise<string> => {
  return new Promise<string>((resolve: Function, reject: Function) => {
    let _langObj = { preferredlanguage : langCode };
    IPCCCUserSettings.Save(APP_ID, PREFERREDLANGUAGE, JSON.stringify(_langObj)).then(result => {
      resolve('Okay');
    })
    .catch((err) => reject(err));
  })
};

export const switchTheLang = (langCode: string, languageObject: object) => {
    // IPCCCCommand.Request("setlanguage", langCode == 'en' ? LanguageCode.Engels : LanguageCode.Nederlands)
    // .catch((error) => {
    //     console.error(error);
    // });
    saveLangSettings(langCode).then((): void => {
        //
    }).catch((error:string) => {
        console.error(error);
    });
    return languageObject['language'][langCode];
};