"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indentString = exports.formatList = exports.removeDuplicates = exports.choose = exports.shuffle = void 0;
function shuffle(array) {
    var result = array.slice();
    var temp, randomIndex;
    for (var i = result.length - 1; i >= 0; i--) {
        randomIndex = Math.floor(Math.random() * result.length);
        temp = result[i];
        result[i] = result[randomIndex];
        result[randomIndex] = temp;
    }
    return result;
}
exports.shuffle = shuffle;
function choose(array) {
    return array[Math.floor(Math.random() * array.length)];
}
exports.choose = choose;
function removeDuplicates(array) {
    return array.filter(function (e, i) { return array.indexOf(e) == i; });
}
exports.removeDuplicates = removeDuplicates;
function formatList(array) {
    if (array.length == 0)
        return "";
    else if (array.length == 1)
        return array[0] + "";
    else if (array.length == 2)
        return array[0] + " and " + array[1];
    else if (array.length == 3)
        return array[0] + ", " + array[1] + ", and " + array[2];
    else
        return array[0] + ", " + formatList(array.slice(1));
}
exports.formatList = formatList;
function indentString(string, indent) {
    return (string + "").split('\n').map(function (line) { return indent + line; }).join("\n");
}
exports.indentString = indentString;
