/**
 * Created by Alex on 17/11/2014.
 */
var BinaryNode = require('../BinaryNode');

"use strict";
function BVHGeometry(tree) {
    //create array of positions
    var aVertices = [];
    var i = 0;
    var numVertices = 0;
    var aIndices = [];
    var numFaces = 0;

    function makeVertex(x, y, z) {
        "use strict";
        aVertices.push(x);
        aVertices.push(y);
        aVertices.push(z);
        return numVertices++;
    }

    function makeQuad(a, b, c, d) {
        aIndices.push(a);
        aIndices.push(b);
        aIndices.push(c);
        //
        aIndices.push(a);
        aIndices.push(c);
        aIndices.push(d);
        numFaces += 2;
    }

    function makeCube(x0, y0, z0, x1, y1, z1) {
        //near
        var ntl = makeVertex(x0, y0, z0),
            nbl = makeVertex(x0, y1, z0),
            nbr = makeVertex(x1, y1, z0),
            ntr = makeVertex(x1, y0, z0),
        //far
            ftl = makeVertex(x0, y0, z1),
            fbl = makeVertex(x0, y1, z1),
            fbr = makeVertex(x1, y1, z1),
            ftr = makeVertex(x1, y0, z1);
        //make faces
        makeQuad(ntl, ntr, nbr, nbl); //near
        makeQuad(fbl, fbr, ftr, ftl); //far
        makeQuad(ftl, ftr, ntr, ntl); //top
        makeQuad(nbl, nbr, fbr, fbl); //bottom
        makeQuad(ftl, ntl, nbl, fbl); //left
        makeQuad(fbr, nbr, ntr, ftr); //right
    }

    function processNode(n) {
        "use strict";
        var x0 = n.x0;
        var y0 = n.y0;
        var z0 = n.z0;
        var x1 = n.x1;
        var y1 = n.y1;
        var z1 = n.z1;
        if (n instanceof BinaryNode) {
            if (n.a !== void 0) {
                processNode(n.a);
            }
            if (n.b !== void 0) {
                processNode(n.b);
            }
        } else {
            makeCube(x0, y0, z0, x1, y1, z1);
        }
    }

    var root = tree.root;
    processNode(root);
    //convert positions and indices to buffer geometry
    var positions = new Float32Array(numVertices * 3);
    var indices = new Uint32Array(numFaces * 3);
    //
    console.log("bvh faces: " + numFaces);

    //copy
    positions.set(aVertices, 0);
    indices.set(aIndices, 0);
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('index', new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    var box3 = geometry.boundingBox = new THREE.Box3(new THREE.Vector3(root.x0, root.y0, root.z0), new THREE.Vector3(root.x1, root.y1, root.z1));
    geometry.boundingSphere = new THREE.Sphere(box3.min.clone().add(box3.max).multiplyScalar(0.5), box3.max.clone().sub(box3.min).length());
    return geometry;
}

module.exports = BVHGeometry;
