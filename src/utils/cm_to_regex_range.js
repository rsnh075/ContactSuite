/**
 * 
 * 
 * 
 */


export const regex_range = (from, to) => {
    if(from < 0 || to < 0) {
        //throw new Exception("Negative values not supported"); 
        return null;
    }
    if(from > to) {
        //throw new Exception("Invalid range from..to, from > to"); 
        return null;
    }

    let ranges = [];
    ranges.push(from);
    let increment = 1;
    let next = from;
    let higher = true;

    while(true){
        next += increment;
        if(next + increment > to) {
            if(next <= to) {
                ranges.push(next);
            }
            increment /= 10;
            higher = false;
        }else{ 
            if(next % (increment*10) == 0) {
                ranges.push(next);
                increment = higher ? increment*10 : increment/10;
            }
        }

        if(!higher && increment < 10) {
            break;
        }
    }

    ranges.push(to + 1);
    let regex = '^(?:';

    for(let i = 0; i < ranges.length - 1; i++) {
        let str_from = ranges[i];
        str_from = str_from.toString();
        let str_to = ranges[i + 1] - 1;
        str_to = str_to.toString();
        for(var j = 0; j < str_from.length; j++) {
            if(str_from[j] == str_to[j]) {
                regex += str_from[j];
            }
            else {
                regex += "[" + str_from[j] + "-" + str_to[j] + "]";
            }
        }
        regex += "|";
    }

    return regex.substr(0, regex.length - 1 ) + ')$';
}

