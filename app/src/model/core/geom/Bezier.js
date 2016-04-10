var Vector3 = require("Vector3");
var Bezier = function () {

};
Bezier.computeQuadratic = (function () {
    var a = new Vector3();

    function computeQuadratic(p0, p1, p2, t, result) {
        var minus = 1 - t;
        var minus2 = minus * minus;

        result.copy(p0).multiplyScalar(minus2);

        a.copy(p1).multiplyScalar(minus * 2 * t);
        result.add(a);

        a.copy(p2).multiplyScalar(t * t);
        result.add(a);

    }

    return computeQuadratic;
})();
module.exports = Bezier;