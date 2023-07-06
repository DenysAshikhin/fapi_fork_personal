var helper = {
    roundTwoDecimal: function (number) {
        return Math.round((number + Number.EPSILON) * 100) / 100;
    }
}
export default helper;