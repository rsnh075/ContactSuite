/**
 *
 * @project CM form validation
 *
 * @version 1.0
 * @author Wim Jurriaans
 * @copyright 2018
 * @license MIT
 *
 * @date 12-03-2018
 * @modified 03-04-2018
 *

 */

const validators = {
  isNotEmpty                  : /^(\w+|\W+|\s)+$/,
  isNotEmptyNr                : /^\d+$/,
  isNotEmptyNoWhiteSpaces     : /^\S+$/,
  isEmail                     : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,}\.?$/i,
  isEmptyStringOrEmail        : /^(?![\s\S])|^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,}\.?$/i,
  //isPhone                     : /^(((0)[1-9]{2}[0-9][-]?[1-9][0-9]{3,5})|((\+31|0|0031)[1-9][0-9][-]?[1-9][0-9]{4,6}))$/,
  //isPhone                     : /((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9])((\s|\s?-\s?)?[0-9])((\s|\s?-\s?)?[0-9])\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]$/,
  isPhone                     : /([^\d]*\d){8}|^[-+]3114|^[-+]3118/,
  isNumberOrPlusOrAa          : /(^[0-9+Aa]+$)/,
  isMobileNL                  : /^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$/,
  isMobileBE                  : /^(\+?32|0)4\d{8}$/,
  isPaid                      : /^(\+319|09|00319|)/,
  isZip                       : /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/,
  isNumber                    : /^[0-9]\d*$/,
  isNotZero                   : /^[-+]?[1-9]\d*$/,
  isNotNegative               : /^[0-9]*$/,
  isUserName                  : /^(.){1,50}$/,
  //isCustomerCode              : /^(?!-)([a-zA-Z0-9-]{1,20})(?<!-)$/, //DOESN'T WORK IN FF
  isCustomerCode              : /^(?!-)([a-zA-Z0-9-]{1,20})$/,
  isAll                       : /^.*/,
  isRoleName                  : /^.{3,30}$/,
  isRoleDescription           : /^(.|\n|\r){10,256}$/,
  isAcoundcode                : /^[0-9]{4}\d*$/,
  isMacAddress                : /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  isNotNull                   : /^((?!null).)*$/,
  isNotMinusOne               : /^((?!-1).)*$/,
  isAtLeastTwoChar            : /^.{2,}/,
  isAtLeastOne                : /^([1-9]|\d{2,})$/,
  isZeroOrFiveToNinety        : /^[0]$|^([5-9]|[1-8][0-9]|90)$/,
  isbetweenOneToNN            : /^[1-9]$|^[1-9][0-9]$/,
  isbetweenZeroToNNNN         : /^[0-9]$|^[1-9][0-9]$|^[1-9][0-9][0-9]$|^[1-9][0-9][0-9][0-9]$/,
  isNotOverAHundred           : /\b(0*(?:[1-9][0-9]?|100))\b/
}

const validateValue = (val, patern) => {
  let _patern = validators[patern] ? validators[patern] : new RegExp(patern);
  return _patern.test(val);
};

export {
  validateValue,
};
