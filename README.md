# tiny-templates

tiny-templates library is designed to build complex documents or source code files based on native templates and data binding. It was somewhat inspired by knockoutjs

## build

```bash
$ npm install
$ tsc
```
## test

```bash
$ npm test
```

## examples

[Click to the complex codegen example](codegen.md)

### Simple rendering (mostly useless by itself)

```js
const testData = {
    name: "nameValue"
};

console.log(applyData(testData, (c, data) => {
        return `foo_${data.name}`;
    }));

// output:
// foo_nameValue
```

### Conditional rendering

```js
const testData = {
    conditionTrue: true
};

console.log(applyData(testData, (c, data) =>
        c.if(data.conditionTrue, "render something")));

console.log(applyData(testData, (c, data) =>
    c.if((c, data) => { return c.depth === 0 }, "render something too")));

console.log(applyData(testData, (c, data) =>
    c.ifElse((c, data) => { return c.depth === 0 },
        (c,d)=> c.render("render if true"),
        "render if false")));


// output:
// render something
// render something too
// render if true
```

### join rendered parts based on array

```js
const testData = {
    abcArray: ["a", "b", "c"]
};

console.log(applyData(testData,
        (c, data) => c.join(data.abcArray, " | ",
            (c, index, name, data) => `${index}_${name}_${data}`)
    ));

console.log(applyData(testData,
        (c, data) => c.join(data.abcArray, " | ",
            (c, index, name, data) => `${index}_${name}_${data}`,
            "prefix:",
            ":suffix")
    ));

// output:
// 0_0_a | 1_1_b | 2_2_c
// prefix:0_0_a | 1_1_b | 2_2_c:suffix
```

### join rendered parts based on object

```js
const testData = {
    xyzObj: {
        x: "X",
        y: "Y",
        z: "Z"
    }
};

console.log(applyData(testData,
        (c, data) => c.join(data.abcArray, " | ",
            (c, index, name, data) => `${index}_${name}_${data}`)
    ));

console.log(applyData(testData,
        (c, data) => c.join(data.abcArray, " | ",
            (c, index, name, data) => `${index}_${name}_${data}`,
            "prefix:",
            ":suffix")
    ));

// output:
// 0_0_a | 1_1_b | 2_2_c
// prefix:0_0_a | 1_1_b | 2_2_c:suffix
```
