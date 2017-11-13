# Complex Codegen example

## Module definition

```javascript
const moduleDefinition = {
    imports: [
        {
            from: "util",
            allAs: "util"
        },
        {
            from: "./f",
            items: [
                { name: "f1" },
                { name: "f2" },
                { name: "f3" }
            ]
        },
        {
            from: "./ff",
            items: [
                { name: "ff", as: "f4" },
            ]
        }
    ],
    classes: {
        "TestClassFooBar": {
            extends: ["BaseClass"],
            implements: ["IFoo", "IBar"]
        },
        "TestClassFoo": {
            extends: ["BaseClass"],
            implements: ["IFoo"]
        },
        "TestClassBar": {
            extends: ["BaseClass"],
            implements: ["IBar"]
        }
    }
}
```

## Template functions

```javascript
function renderImportItem(c: Context, data: any): string {

    return c.render("import ",
        c.ifElse(data.allAs,
            (c, d) => {
                return `* as ${d.allAs}`;
            },
            (c, d) => c.join(data.items, ", ", (c: Context, d: any) => d.name + c.if(d.as, " as ", d.as), "{ ", " }")),
        " from \"",
        data.from,
        "\";");
}

function renderClassItem(c: Context, index: number, name: string, data: any): string {

    return `export class ${name}${c.join(data.extends, ", ", (c: Context, d: any) => d, " extends ")}${c.join(data.implements, ", ", (c: Context, d: any) => d, " implements ")} {
    constructor(value: string) {
        super(value);
    }

    ${c.if(data.implements.indexOf("IFoo") >= 0, renderIFoo)}
    ${c.if(data.implements.indexOf("IBar") >= 0, renderIBar)}
}
`;
}

function renderIFoo(c: Context, data: any) {
    return `getFoo(): string {
        return "${c.name}_" + this.value + "_foo";
    }`;
}
function renderIBar(c: Context, data: any) {
    return `getBar(): string {
        return "${c.name}_" + this.value + "_bar";
    }`;
}

function renderModule(c: Context, d: any): string {

    return `${c.join(d.imports, os.EOL, renderImportItem)}

export interface IFoo {
    getFoo(): string;
}
export interface IBar {
    getBar(): string;
}

export class BaseClass {
    constructor(public value: string) {
        console.log(\`ctor: \${value}\`);
    }
}

${c.join(d.classes, os.EOL, renderClassItem)}
`;
}
```

## Bind data to template

```js
console.long(applyData(moduleDefinition, renderModule));
```

## Results

```javascript
import * as util from "util";
import { f1, f2, f3 } from "./f";
import { ff as f4 } from "./ff";

export interface IFoo {
    getFoo(): string;
}
export interface IBar {
    getBar(): string;
}

export class BaseClass {
    constructor(public value: string) {
        console.log(`ctor: ${value}`);
    }
}

export class TestClassFooBar extends BaseClass implements IFoo, IBar {
    constructor(value: string) {
        super(value);
    }

    getFoo(): string {
        return "TestClassFooBar_" + this.value + "_foo";
    }
    getBar(): string {
        return "TestClassFooBar_" + this.value + "_bar";
    }
}

export class TestClassFoo extends BaseClass implements IFoo {
    constructor(value: string) {
        super(value);
    }

    getFoo(): string {
        return "TestClassFoo_" + this.value + "_foo";
    }
    
}

export class TestClassBar extends BaseClass implements IBar {
    constructor(value: string) {
        super(value);
    }

    
    getBar(): string {
        return "TestClassBar_" + this.value + "_bar";
    }
}
```

