/**
 * Created by Alex on 16/11/2014.
 */
var ListNode = function (value) {
    this.value = value;
    this.next = void 0;
    this.prev = void 0;
};
ListNode.prototype.remove = function () {
    this.prev.next = this.next;
    this.next.prev = this.prev;
};
var List = function (elements) {
    var self = this;
    this.first = void 0;
    this.last = void 0;
    this.length = 0;
    if (elements !== void 0 && typeof(elements) === "array") {
        elements.forEach(this.add, self);
    }
};
List.prototype.traverse = function (visitor) {
    var n = this.first;
    var count = 0;
    while (n !== void 0) {
        var stopFlag = visitor(n.value, count);
        if (stopFlag) {
            return;
        }
        count++;
        n = n.next;
    }
};
List.prototype.add = function (value) {
    var node = new ListNode(value);
    if (this.first === void 0) {
        this.first = node;
    } else {
        this.last.next = node;
    }
    node.prev = this.last;
    this.last = node;
};
List.prototype.remove = function (index) {
    var n = this.first;
    while (n !== void 0) {
        if (index-- <= 0) {
            n.remove();
            this.length--;
            return n.value;
        }
        n = n.next;
    }
};
var ListIterator = function (list) {
    if (list !== void 0) {
        this.bind(list);
    } else {
        this._list = void 0;
        this._current = void 0;
        this._next = void 0;
        this.index = 0;
    }
};
ListIterator.prototype.bind = function (list) {
    this._list = list;
    this._current = null;
    this._next = list.first;
    this.index = 0;
};
ListIterator.prototype.next = function () {
    var result = this._current = this._next;
    if (result !== void 0) {
        this.index++;
        this._next = result.next;
    }
    return result;
};
ListIterator.prototype.remove = function () {
    this._current.remove();
    this.index--;
    this._list.length--;
};