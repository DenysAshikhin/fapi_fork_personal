import Decimal from 'break_infinity.js';
var helper = {
    createDecimal: function (number) {
        let deci = number.mantissa || number.mantissa === 0 ? new Decimal(`${number.mantissa}e${number.exponent}`) : new Decimal(number);

        return deci;
    },
    multiplyDecimal: function (a, b) {
        a = a.mantissa || a.mantissa === 0 ? a : this.createDecimal(a);
        return a.times(b);
    },
    divideDecimal: function (a, b) {
        a = a.mantissa || a.mantissa === 0 ? a : this.createDecimal(a);
        return a.dividedBy(b);
    },
    addDecimal: function (a, b) {
        a = a.mantissa || a.mantissa === 0 ? a : this.createDecimal(a);
        return a.plus(b);
    },
    subtractDecimal: function (a, b) {
        a = a.mantissa || a.mantissa === 0 ? a : this.createDecimal(a);
        return a.minus(b);
    },
    logDecimal: function (number, base) {
        number = number.mantissa || number.mantissa === 0 ? number : this.createDecimal(number);
        return this.createDecimal(number.log(base));
    },
    pow: function (number, exp) {
        number = number.mantissa || number.mantissa === 0 ? number : this.createDecimal(number);
        return number.pow(exp);
    }
}


export default helper;