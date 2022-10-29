/**
 * @author charles yiu
 * @email me@yiu.ch | charlesyiu.w@gmail.com
 * @create date 2022-10-15 13:24:55
 * @modify date 2022-10-29 17:03:01
 * @desc this file includes the code required to simulate a full snakery.io game
 */

// only supports array-likes & booleans
class Array2D {
    #valueType
    get #defaultValue() { return (this.#valueType === "boolean" ? false : {}) }
    #array
    #mostCommon(array) {
        let item
        let count = 1
        for (let index = 0; index < array.length; index++) {
            if (typeof item === "undefined" || item !== array[index]) {
                let _count = 0
                for (let _index = 0; _index < array.length; _index++) {
                    if (array[count] < array[_count]) _count++
                    if (count > _count) {
                        count = _count
                        item = array[index]
                    }
                }
                _count = 0
            }
        }
        return item
    }
    #generateFilling(length, value) {
        const array = []
        for (let index = 0; index < length; index++) array.push(structuredClone(value))
        return array
    }
    #ensureType(value) {
        if (typeof value !== this.#valueType) throw TypeError()
        if (this.#valueType === "object") {
            const invalidLabels = Object.keys(value).filter(value => isNaN(parseInt(value)) || value == 0)
            for (let index = 0; index < invalidLabels.length; index++) delete value[invalidLabels[index]]
        } else if (this.#valueType === "number") array[index][_index] = Boolean(array[index][_index])
        return value
    }
    #ensureArray(array) {
        if (!Array.isArray(array)) array = []
        if (array.length === 0) array.push([structuredClone(this.#defaultValue)])
        return array
    }
    #cleanArray(array) {
        array = this.#ensureArray(array)

        const widths = []
        for (let index = 0; index < array.length; index++) {
            if (array[index].length > 0) {
                for (let _index = 0; _index < array[index].length; _index++) array[index][_index] = this.#ensureType(array[index][_index])
            } else {
                if (!Array.isArray(array[index])) array[index] = []
                array[index].push(this.#defaultValue)
            }
            widths.push(array[index].length)
        }
        
        const width = this.#mostCommon(widths)
        for (let index = 0; index < array.length; index++) {
            if (typeof width !== "undefined") {
                array[index] = array[index].slice(0, width)
                array[index].splice(array[index].length, 0, ...this.#generateFilling(width - array[index].length, 0))
            }
        }
        return array
    }

    #label = null
    get label() { return this.#label }

    constructor(array, label) {
        if (typeof label === "string") this.#label = label
        array = this.#ensureArray(array)
        const types = []
        for (let y = 0; y < array.length; y++) for (let x = 0; x < array.length; x++) types.push(typeof array[y][x])
        this.#valueType = this.#mostCommon(types)
        if (!["object", "boolean"].includes(this.#valueType)) this.#valueType = "boolean"
        
        this.#array = this.#cleanArray(array)
    }

    #processCoordinates(x, y) {
        x = parseInt(x)
        if (
            isNaN(x) ||
            ((x >= 0) ? x : Math.abs(x) - 1)  >= this.width
        ) throw TypeError()
        if (x < 0) x = this.width - x
        y = parseInt(y)
        if (
            isNaN(y) ||
            ((y >= 0) ? y : Math.abs(y) - 1)  >= this.height
        ) throw TypeError()
        if (y < 0) y = this.height - y
        
        return [x, y]
    }
    
    get(x, y, label) {
        [x, y] = this.#processCoordinates(x, y)
        label = Math.abs(parseInt(label))
        if (this.#valueType === "object" && !(isNaN(label) || label === 0)) return Boolean(this.#array[y][x][label])
        else return this.#array[y][x]
    }
    set(x, y, value, label) {
        [x, y] = this.#processCoordinates(x, y)
        label = Math.abs(parseInt(label))
        value = Boolean(value)
        if (this.#valueType === "object" && !(isNaN(label) || label === 0)) this.#array[y][x][label] = value
        else this.#array[y][x] = value
        this.#array = this.#cleanArray(this.#array)
    }
    get array() { return this.#array }
    
    get width() {
        this.#array = this.#cleanArray(this.#array)
        return this.#array[0].length
    }
    set width(value) {
        value = parseInt(value)
        if (isNaN(value)) throw TypeError()
        if (value < 1) throw Error("invalid width")
        value -= this.width
        if (value > 0) {
            const fillingLengths = {
                left: Math.floor(value / 2),
                right: Math.floor(value / 2) + Math.floor(value % 2)
            }
            for (let index = 0; index < this.#array.length; index++) {
                this.#array[index].unshift(...this.#generateFilling(fillingLengths.left, structuredClone(this.#defaultValue)))
                this.#array[index].push(...this.#generateFilling(fillingLengths.right, structuredClone(this.#defaultValue)))
            }
        } else if (value < 0) {
            const slicingLengths = {
                left: Math.abs(Math.ceil(value / 2)),
                right: Math.ceil(value / 2) + Math.floor(value % 2)
            }
            for (let index = 0; index < this.#array.length; index++) {
                this.#array[index] = this.#array[index]
                    .slice(slicingLengths.left)
                    .slice(0, slicingLengths.right)
            }
        }
        this.#array = this.#cleanArray(this.#array)
    }
    get height() { return this.array.length }
    set height(value) {
        value = parseInt(value)
        if (isNaN(value)) throw TypeError()
        if (value < 1) throw Error("invalid height")
        value -= this.height
        if (value > 0) {
            const fillingLengths = {
                top: Math.floor(value / 2),
                bottom: Math.floor(value / 2) + Math.floor(value % 2)
            }
            let horizontalPart = this.#generateFilling(this.width, this.#defaultValue)
            this.#array.unshift(...this.#generateFilling(fillingLengths.top, horizontalPart))
            this.#array.push(...this.#generateFilling(fillingLengths.bottom, horizontalPart))
        } else if (value < 0) {
            const slicingLengths = {
                top: Math.abs(Math.ceil(value / 2)),
                bottom: Math.ceil(value / 2) + Math.floor(value % 2)
            }
            this.#array = this.#array
                .slice(slicingLengths.top)
                .slice(0, slicingLengths.bottom)
        }
        this.#array = this.#cleanArray(this.#array)
    }

}
class Mechanics extends Array2D {
    static Layer = class Layer {
        constructor(layer) {
            if (typeof layer === "object") {
                layer = Mechanics.Layer.ensureObject(layer)
                Object.keys(layer).forEach(layerKey => {
                    if (layer[layerKey][0] !== null) this[`$_${layerKey}`] = layer[layerKey][0]
                    this[`$${layerKey}`] = layer[layerKey][1]
                })
            }
        }
        addEventListener(event, action) {
            if (typeof event !== "string" || typeof action !== "function") throw TypeError()
            if (!Array.isArray(this[`#$${event}`])) throw TypeError()
            this[`#$${event}`].push(action)
        }
        toObject() {
            const self = this
            // construct()
            return {
                "construct": [(function(array) { self._construct.call(self, this, array) }), []],
                "destruct": [(function(array) { self._destruct.call(self, this, array) }), []],
                "tick": [(function(array) { self._tick.call(self, this, array) }), []]
            }
        }
        static ensureObject(layer) {
            layer = (typeof layer === "function") ? (new layer()).toObject() : layer
            const layerEvents = Object.keys(layer)
            if (layerEvents.filter(event => !Mechanics.events.includes(event.startsWith("_") ? event.substring(1) : event)).length > 0) throw TypeError()
            const object = { }
            layerEvents.forEach(layerKey => {
                const objectKey = layerKey.startsWith("_") ? layerKey.substring(1) : layerKey
                if (!Array.isArray(object[objectKey])) object[objectKey] = [null, []]
                if (Array.isArray(layer[layerKey])) {
                    let actions = layer[layerKey]
                    if (
                        object[objectKey].length !== 2 || Array.isArray(object[objectKey][1]) &&
                        ((typeof object[objectKey][0] === "function" || typeof object[objectKey][0] === "object") && object[objectKey] !== null)
                    ) {
                        object[objectKey][0] = layer[layerKey][0]
                        actions = layer[layerKey][1]
                    }
                    actions.forEach(action => { if (typeof action === "function") object[objectKey][1].push(action) })
                } else if (typeof layer[layerKey] === "functions ") object[objectKey][0] = layer[layerKey]
            })
            return object
        }

        // TODO add typechecking
        static setLayerArray(target, label, array) {
            label = Math.abs(parseInt(label))
            if (isNaN(label) || label === 0) throw TypeError()
            for (let y = 0; y < target.height; y++) {
                if (y >= array.height) break
                for (let x = 0; x < target.width; x++) {
                    if (x >= array.width) break
                    target.set(x, y, array.get(x, y), label)
                }
            }
            return target
        }
        static getLayerArray(target, label) {
            label = Math.abs(parseInt(label))
            if (isNaN(label) || label === 0) throw TypeError()
            const array = new Array2D([[false]], String(label))
            array.width = target.width
            array.height = target.height
            for (let y = 0; y < target.height; y++) for (let x = 0; x < target.width; x++) {
                array.set(x, y, target.get(x, y, label))
            }
            return array
        }
        
        #_overrideAction(thisArg, eventName) {
            const actions = this[`$${eventName}`]
            const self = this
            actions.unshift(typeof this[`$_${eventName}`] === "function" ? (function(array) {
                array = self[`$_${eventName}`].call(self, array) || array
                array = self[eventName].call(self, array) || array
                thisArg = Mechanics.Layer.setLayerArray(thisArg, array.label, array)
                return array
            }) : (((typeof this[eventName] === "function") ? this[eventName].bind(this) : null)))
            return actions
        }
        _construct(thisArg, array) { 
            this.#_overrideAction(thisArg, "construct").forEach(action => { if (action !== null) array = action(array) || array })
        }
        _destruct(thisArg, array) {
            this.#_overrideAction(thisArg, "destruct").forEach(action => { if (action !== null) array = action(array) || array })
        }
        _tick(thisArg, array) {
            this.#_overrideAction(thisArg, "tick").forEach(action => { if (action !== null) array = action(array) || array })

            // handle collisions
            const collisions = []
            for (let y = 0; y < thisArg.height; y++) for (let x = 0; x < thisArg.width; x++) {
                const item = array.get(x, y)
                if (item) {
                    const items = thisArg.get(x, y)
                    const collision = {
                        x: x,
                        y: y,
                        labels: []
                    }
                    Object.keys(items).forEach(label => {
                        if (label === array.label || parseInt(label) < parseInt(array.label)) return
                        if (items[label] === true) collision.labels.push(label)
                    })
                    if (collision.labels.length > 0) collisions.push(collision)
                }
            }
            this.#_overrideAction(thisArg, "collision").forEach(action => { if (action !== null) array = action(array, collisions) || array })
        }
        $construct = []
        $destruct = []
        $tick = []
        $collision = []
        
    }
    static events = [
        "construct",
        "destruct",
        "tick"
    ]
    
    #layers = []
    
    constructor(size, layers) {
        if (!Array.isArray(size) || typeof layers !== "object") throw TypeError()
        if (size.length !== 2) throw TypeError()
        for (let index = 0; index < size.length; index++) {
            size[index] = parseInt(size[index])
            if (isNaN(size[index])) throw TypeError()
            size[index] = Math.abs(size[index])
            if (size[index] === 0) throw TypeError()
        }
        super()
        this.width = size[0]
        this.height = size[1]
        const layerLabels = Object.keys(layers)
        if (layerLabels.filter(value => isNaN(parseInt(value)) || value == 0).length > 0) throw TypeError()
        layerLabels.forEach(label => layers[label] = Mechanics.Layer.ensureObject(layers[label]))
        this.#layers = layers
    }

    dispatchEvent(event, ...layerLabels) {
        event = String(event)
        if (!Mechanics.events.includes(event)) throw TypeError()
        if (layerLabels.length === 0) layerLabels = Object.keys(this.#layers)
        layerLabels.forEach(label => {
            const _event = this.#layers[label][event]
            if (typeof _event !== "undefined") if (Array.isArray(_event)) {
                if (_event.length === 2) {
                    let array = Mechanics.Layer.getLayerArray(this, label)
                    if (typeof _event[0] === "function") _event[0].call(this, array)
                    if (Array.isArray(_event[1])) _event[1].forEach(action => {
                        if (typeof action === "function") action.call(this, array)
                    })
                    Mechanics.Layer.setLayerArray(this, label, array)
                }
            }
        })
    }

    #interval = null
    start(number) {
        if (typeof number !== "number") throw TypeError()
        if (number !== Math.floor(number)) number = number * 1000
        this.dispatchEvent("construct")
        this.#interval = setInterval(() => this.tick(), number)
    }
    stop() {
        if (this.#interval === null) throw TypeError()
        clearInterval(this.#interval)
        this.dispatchEvent("destruct")
    }
    tick() {
        // console.log(Object.keys(this))
        this.dispatchEvent("tick")
    }
}

module.exports = Mechanics