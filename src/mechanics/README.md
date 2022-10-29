## core/mechanics - working concept

core/mechanics consists of two classes `Array2D`, `Mechanics` and `Mechanics.Layer`.  

the `Mechanics` class accepts two parameters; the size of the `Array2D` and the `layers`.  

the `layers` argument is an object with its key as a number that is higher than 0 and value be a `Layer`.  

at its core, the `Layer` consists of an object with 3 properties `construct`, `destruct`, and `tick`.  

#### `Layer`:
```typescript
type ArrayAction = (array: Array2D) => Array2D | Void
interface Layer {
    construct: [ArrayAction | null, ArrayAction[]]
    destruct: [ArrayAction | null, ArrayAction[]]
    tick: [ArrayAction | null, ArrayAction[]]
}
```

since writing with a `Layer` is inconvenient, i wrote the class `Mechanics.Layer` that helps with simple tasks.  

for now, the class `Mechanics.Layer` only has an extra event called `collision` to test if it works.  

the `collision` event only fires when it detects a layer number higher than the layer the event is on.  

