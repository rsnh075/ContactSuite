class Utils {
    static Guid =
        () => {
            var s4 = () => {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
        }
    static Combine =
        (obj1, obj2) => {
            for (var key in obj2) {
                if (!obj1[key]) {
                    obj1[key] = obj2[key];
                } 
            }
        }
}

export { Utils };