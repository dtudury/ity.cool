function assertChar (arr, regex) {
  if (!arr[arr.i].match(regex)) {
    throw new Error(`expected ${regex}. got ${arr[arr.i]} at i=${arr.i}`)
  }
  arr.i++;
}

function readValue (arr) {
  if (arr[arr.i].isValue) {
    return arr[arr.i++]
  }
}

function readEscaped (arr) {
  assertChar(arr, /&/);
  if (readIf(arr, 'amp;')) {
    return '&'
  } else if (readIf(arr, 'apos;')) {
    return '\''
  } else if (readIf(arr, 'gt;')) {
    return '>'
  } else if (readIf(arr, 'lt;')) {
    return '<'
  } else if (readIf(arr, 'quot;')) {
    return '"'
  } else {
    throw new Error('unhandled escape sequence')
  }
}

function readTo (arr, regex) {
  const ss = [];
  while (arr.i < arr.length) {
    const c = arr[arr.i];
    if (c.isValue || c.match(regex)) {
      return ss.join('')
    } else if (c === '&') {
      ss.push(readEscaped(arr));
    } else {
      ss.push(c);
      arr.i++;
    }
  }
  return ss.join('')
}

function skipWhiteSpace (arr) {
  readTo(arr, /\S/);
}

function readIf (arr, str) {
  if (!str.length) {
    str = [str];
  }
  const out = [];
  for (let i = 0; i < str.length; i++) {
    const char = arr[arr.i + i];
    if (!char || !char.match || !char.match(str[i])) {
      return false
    }
    out.push(char);
  }
  arr.i += str.length;
  return out.join('')
}

const _voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const END = Symbol('end');

function _readValueParts (arr, regex) {
  const out = [];
  let ss = [];
  while (arr.i < arr.length) {
    const c = arr[arr.i];
    if (c.isValue) {
      if (ss.length) {
        out.push({ type: 'part', value: ss.join('') });
        ss = [];
      }
      out.push(c.value);
      arr.i++;
    } else if (c.match(regex)) {
      if (ss.length) {
        out.push({ type: 'part', value: ss.join('') });
      }
      return out
    } else if (c === '&') {
      ss.push(readEscaped(arr));
    } else {
      ss.push(c);
      arr.i++;
    }
  }
}

function _decodeAttribute (arr) {
  skipWhiteSpace(arr);
  const c = arr[arr.i];
  if (c === '/' || c === '>') {
    return END
  }
  let name = readValue(arr);
  if (name && name.isValue) {
    return name.value
  }
  name = readTo(arr, /[\s=/>]/);
  if (!name) {
    throw new Error('attribute must have a name (dynamic attributes okay, dynamic names... sorry)')
  }
  skipWhiteSpace(arr);
  const equalSign = readIf(arr, '=');
  if (equalSign) {
    skipWhiteSpace(arr);
    let value = readValue(arr);
    if (value) {
      value = value.value;
    } else {
      const quote = readIf(arr, /['"]/);
      if (quote) {
        value = _readValueParts(arr, quote);
        assertChar(arr, quote);
      } else {
        value = readTo(arr, /[\s=/>]/);
      }
    }
    return { type: 'attribute', name, value }
  } else {
    return { type: 'attribute', name }
  }
}

function _decodeAttributes (arr) {
  const attributes = [];
  while (true) {
    const attribute = _decodeAttribute(arr);
    if (attribute !== END) {
      attributes.push(attribute);
    } else {
      return attributes
    }
  }
}

function _decodeTag (arr) {
  skipWhiteSpace(arr);
  const c = arr[arr.i];
  if (c.isValue) {
    arr.i++;
    return c.value
  }
  return readTo(arr, /[\s/>]/)
}

function _decodeElement (arr) {
  const c = arr[arr.i];
  if (c.isValue) {
    arr.i++;
    return c.value
  } else if (c === '<') {
    assertChar(arr, /</);
    const isClosing = readIf(arr, '/');
    const tag = _decodeTag(arr);
    const isVoid = _voidElements.has(tag);
    const attributes = _decodeAttributes(arr);
    const isEmpty = readIf(arr, '/') || isVoid;
    assertChar(arr, />/);
    const children = (isClosing || isEmpty) ? [] : _decodeElements(arr, tag);
    if (isVoid && isClosing) return null
    return { type: 'node', tag, attributes, children, isClosing }
  } else {
    return { type: 'textnode', value: readTo(arr, /</) }
  }
}

function _decodeElements (arr, closingTag) {
  const nodes = [];
  while (arr.i < arr.length) {
    const node = _decodeElement(arr);
    if (node != null) {
      if (node.isClosing) {
        if (closingTag != null) {
          return nodes
        }
      } else {
        delete node.isClosing;
        nodes.push(node);
      }
    }
  }
  return [].concat.apply([], nodes)
}

function h (strings, ...values) {
  const ss = [strings[0].split('')];
  for (let i = 0; i < values.length; i++) {
    ss.push({ value: values[i], isValue: true });
    ss.push(strings[i + 1].split(''));
  }
  const arr = [].concat.apply([], ss);
  arr.i = 0;
  return _decodeElements(arr, null)
}

/* global requestAnimationFrame */
const _proxySet = new Set();
const _keyMaps = new Map();
const _triggerable = new Set();
const _triggered = new Set();
const _stack = [];
const _afterTriggered = [];
const _OWN_KEYS = Symbol('ownKeys as attribute');
let _handlingTriggered = false;

function _reportKeyMutation (target, key) {
  if (_keyMaps.has(key)) {
    const keyMap = _keyMaps.get(key);
    if (keyMap.has(target)) {
      if (!_handlingTriggered) {
        _handlingTriggered = true;
        requestAnimationFrame(() => {
          _handlingTriggered = false;
          for (const callback of _triggered) {
            callback();
          }
          _triggered.clear();
          while (_afterTriggered.length) {
            _afterTriggered.shift()();
          }
        });
      }
      for (const callback of keyMap.get(target)) {
        _triggered.add(callback);
      }
      keyMap.delete(target);
      if (!keyMap.size) {
        _keyMaps.delete(key);
      }
    }
  }
}

function _reportKeyAccess (target, key) {
  if (_stack.length) {
    if (!_keyMaps.has(key)) {
      _keyMaps.set(key, new Map());
    }
    const keyMap = _keyMaps.get(key);
    if (!keyMap.has(target)) {
      keyMap.set(target, new Set());
    }
    keyMap.get(target).add(_stack[0]);
  }
}

function proxy (target = {}) {
  const isArray = Array.isArray(target);
  const isObject = target.constructor === Object;
  if ((isArray || isObject) && !_proxySet.has(target)) {
    const _self = new Proxy(isArray ? new Array(target.length) : {}, {
      has (target, key) {
        _reportKeyAccess(target, key);
        return key in target
      },
      get (target, key) {
        _reportKeyAccess(target, key);
        return target[key]
      },
      set (target, key, value) {
        value = proxy(value);
        if (target[key] !== value || key === 'length') { // array length is magical
          if (!(key in target)) {
            _reportKeyMutation(target, _OWN_KEYS);
          }
          _reportKeyMutation(target, key);
        }
        target[key] = value;
        return true
      },
      deleteProperty (target, key) {
        if (key in target) {
          _reportKeyMutation(target, _OWN_KEYS);
          _reportKeyMutation(target, key);
        }
        return Reflect.deleteProperty(target, key)
      },
      ownKeys (target) {
        _reportKeyAccess(target, _OWN_KEYS);
        return Reflect.ownKeys(target)
      }
    });
    Object.assign(_self, target);
    _proxySet.add(_self);
    target = _self;
  }
  return target
}

function watchFunction (f) {
  function wrapped () {
    if (_triggerable.has(f)) {
      _stack.unshift(wrapped);
      f();
      _stack.shift();
    }
  }
  if (!_triggerable.has(f)) {
    _triggerable.add(f);
    wrapped();
  }
}

function unwatchFunction (f) {
  _triggerable.delete(f);
}

function after (f) {
  _afterTriggered.push(f);
}

function _constructValue (parts, node) {
  if (parts == null) return null
  if (typeof parts === 'function') {
    parts = parts(node);
  }
  if (Array.isArray(parts)) {
    const mappedParts = parts.map(part => {
      if (typeof part === 'function') {
        part = part(node);
      }
      if (part == null) return ''
      if (part && part.type === 'part') {
        return part.value
      } else {
        return part
      }
    });
    if (mappedParts.length === 1) {
      return mappedParts[0]
    }
    return mappedParts.join('')
  }
  return parts
}

function _renderAttributes (attributes, node) {
  let obj = {};
  attributes.forEach(attribute => {
    if (typeof attribute === 'function') {
      attribute = attribute(node);
    }
    if (attribute == null) return
    if (attribute && attribute.type === 'attribute') {
      const name = attribute.name;
      if (Object.prototype.hasOwnProperty.call(obj, name)) return
      const value = _constructValue(attribute.value, node);
      if (value == null) {
        obj[name] = name;
      } else {
        obj[name] = value;
      }
    } else if (Array.isArray(attribute)) {
      obj = Object.assign(_renderAttributes(attribute, node), obj);
    } else if (typeof attribute === 'object') {
      Object.entries(attribute).forEach(([name, value]) => {
        if (Object.prototype.hasOwnProperty.call(obj, name)) return
        obj[name] = value;
      });
    } else {
      const name = attribute.toString();
      if (Object.prototype.hasOwnProperty.call(obj, name)) return
      obj[name] = name;
    }
  });
  return obj
}

function _setAttribute (element, name, value) {
  if (element[name] !== value) {
    try {
      element[name] = value;
    } catch (e) {
      // SVGs don't like getting their properties set and that's okay...
    }
  }
  if (!(typeof value).match(/(?:boolean|number|string)/)) {
    value = name;
  }
  const str = value.toString();
  if (element.getAttribute(name) !== str) {
    element.setAttribute(name, str);
  }
  return element
}

function _setAttributes (element, attributes) {
  Object.entries(attributes).forEach(([name, value]) => {
    _setAttribute(element, name, value);
  });
  return element
}

function _pruneAttributes (element, newAttributes, oldAttributes) {
  const orphans = new Set(Object.keys(oldAttributes));
  Object.keys(newAttributes).forEach(attribute => orphans.delete(attribute));
  orphans.forEach(attribute => {
    element.removeAttribute(attribute);
    delete element[attribute];
  });
}

const _descriptionMap = new Map();
function _descriptionsToNodes (descriptions, xmlns) {
  if (!Array.isArray(descriptions)) {
    descriptions = [descriptions];
  }
  const nodes = [];
  descriptions.forEach(description => {
    if (typeof description === 'function') {
      description = description();
    }
    if (description != null) {
      if (Array.isArray(description)) {
        nodes.push(..._descriptionsToNodes(description, xmlns));
      } else {
        if (description.tag === null || description.tag === '') {
          nodes.push(..._descriptionsToNodes(description.children, xmlns));
        } else if (typeof description.tag === 'function') {
          const attributes = _renderAttributes(description.attributes);
          nodes.push(..._descriptionsToNodes(description.tag(attributes, description.children, description), attributes.xmlns || xmlns));
        } else if (description.type) {
          if (!_descriptionMap.has(description)) {
            let node;
            if (description.type === 'textnode') {
              node = document.createTextNode(description.value);
            } else {
              let oldAttributes = {};
              let newAttributes = _renderAttributes(description.attributes, node);
              node = document.createElementNS(newAttributes.xmlns || xmlns, description.tag, { is: description.attributes.is });
              _setAttributes(node, newAttributes);
              render(node, description.children, newAttributes.xmlns || xmlns);
              watchFunction(() => {
                newAttributes = _renderAttributes(description.attributes, node);
                _setAttributes(node, newAttributes);
                _pruneAttributes(node, newAttributes, oldAttributes);
                oldAttributes = newAttributes;
              });
            }
            _descriptionMap.set(description, node);
          }
          nodes.push(_descriptionMap.get(description));
        } else {
          nodes.push(document.createTextNode(description.toString()));
        }
      }
    }
  });
  return nodes
}

function _setChildren (element, descriptions, xmlns) {
  const newNodes = _descriptionsToNodes(descriptions, xmlns);
  newNodes.forEach((newNode, index) => {
    while (element.childNodes[index] !== newNode) {
      const oldNode = element.childNodes[index];
      if (!oldNode) {
        element.appendChild(newNode);
      } else if (newNodes.indexOf(oldNode) > index) {
        element.insertBefore(newNode, oldNode);
      } else {
        element.removeChild(oldNode);
      }
    }
  });
  while (element.childNodes.length > newNodes.length) {
    element.removeChild(element.lastChild);
  }
  return element
}

function render (element, descriptions, xmlns = 'http://www.w3.org/1999/xhtml') {
  if (!descriptions) {
    return _descriptionsToNodes(element, xmlns)
  }
  function f () {
    return _setChildren(element, descriptions, xmlns)
  }
  watchFunction(f);
}

// takes a function that evaluates to true or false and static if and else responses. return function that evaluates condition and returns appropriate response
function showIfElse (condition, a, b = []) {
  return () => condition() ? a : b
}

// takes an object and a mapping-function. returns a function that maps the object through the function and returns previously calculated mappings on future calls
function mapEntries (object, f) {
  const map = new Map();
  return () => {
    const o = (typeof object === 'function' ? object() : object) || {};
    map.forEach(indexedValues => {
      indexedValues.index = 0;
    });
    const mappedEntries = Object.entries(o).map(([name, value]) => {
      if (!map.has(value)) {
        map.set(value, { index: 0, values: [] });
      }
      const indexedValues = map.get(value);
      if (indexedValues.values.length <= indexedValues.index) {
        indexedValues.values.push(f(value, name));
      }
      return indexedValues.values[indexedValues.index++]
    });
    // cleanup any unmapped-to values
    map.forEach((indexedValues, key) => {
      if (indexedValues.index) {
        indexedValues.values.splice(indexedValues.index);
      } else {
        map.delete(key);
      }
    });
    return mappedEntries
  }
}

function mapSwitch (expression, f) {
  const map = new Map();
  return () => {
    const expr = expression();
    if (!map.has(expr)) {
      map.set(expr, f(expr));
    }
    return map.get(expr)
  }
}

function objToDeclarations (obj = {}) {
  return Object.entries(obj).map(([name, value]) => `${name}: ${value};`).join('')
}

export { after, h, mapEntries, mapSwitch, objToDeclarations, proxy, render, showIfElse, unwatchFunction, watchFunction };
