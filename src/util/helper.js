var helper = {
    roundTwoDecimal: function (number) {
        return Math.round((number + Number.EPSILON) * 100) / 100;
    },
    roundThreeDecimal: function (number) {
        return Math.round((number + Number.EPSILON) * 1000) / 1000;
    },
    roundInt: function (num) {
        return Math.round((num + Number.EPSILON) * 1) / 1;
    },
    calculateLogarithm: function (base, x) {
        var a = Math.log(x);
        var b = Math.log(base);
        return a / b;
    },
    calcPOW: function (val) {
        return val.mantissa * Math.pow(10, val.exponent);
    },
    secondsToStringWithS: function (seconds) {
        let string = ``;
        let numHours = 0;
        let numMinutes = 0;
        let numSeconds = 0;

        numHours = Math.floor(seconds / 3600);
        numMinutes = Math.floor((seconds % 3600) / 60);
        numSeconds = this.roundInt((seconds % 3600) % 60);
        if (numHours > 0) {
            string = string + `${numHours < 10 ? `0` + numHours : numHours}h:`
        }
        if (numMinutes > 0) {
            string = string + `${numMinutes < 10 ? `0` + numMinutes : numMinutes}m:`
        }
        if (numSeconds > 0) {
            string = string + `${numSeconds < 10 ? `0` + numSeconds : numSeconds}s`
        }
        else {
            string = string + '0s';
        }

        return string;
    },
    secondsToString: function (seconds) {
        let string = ``;
        let numHours = 0;
        let numMinutes = 0;

        numHours = Math.floor(seconds / 3600);
        numMinutes = this.roundInt((seconds % 3600) / 60);

        if (numHours > 0) {
            string = string + `${numHours < 10 ? `0` + numHours : numHours}h:`
        }
        if (numMinutes > 0) {
            string = string + `${numMinutes < 10 ? `0` + numMinutes : numMinutes}m`
        }
        else {
            string = string + `0s`;
        }

        return string;
    },
    bonusColorMap: {
        1001: { color: 'maroon' },
        1002: { color: 'orange' },
        1003: { color: 'purple' },
        1009: { color: 'cyan' },
        1012: { color: 'yellow' },
        1013: { color: 'red' },
        1014: { color: 'blue' },
        1015: { color: 'gray' },
        1016: { color: 'green' }
    }
}


export default helper;