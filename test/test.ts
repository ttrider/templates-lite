import { Context } from '../';
import { applyData } from "../index";
import * as util from 'util';
import * as test from 'tape';
import { runCodegenTest } from "./codegenTest";

runCodegenTest();

const testData = {
    name: "nameValue",

    conditionTrue: true,

    abcArray: ["a", "b", "c"],
    xyzObj: {
        x: "X",
        y: "Y",
        z: "Z"
    },

    itemTree: {
        name: "itemTree",
        subItem01: {
            name: "subitem 01",
            values: {
                q: "Q",
                w: "W",
                e: "E"
            },
        },
        subItem02: {
            name: "subitem 02",
            values: [
                "A", "S", "D"
            ]
        }
    }
};

test('render test', (t) => {

    t.equal(applyData(testData, (c, data) => {
        return "foo";
    }), "foo");

    t.equal(applyData(testData, (c, data) => {
        return `foo_${data.name}`;
    }), "foo_nameValue");

    t.equal(applyData(testData, "prefix_",
        (c, data) => {
            return `foo_${data.name}`;
        },
        "_suffix"), "prefix_foo_nameValue_suffix");

    t.end();
});

test('if test', (t) => {

    t.equal(applyData(testData, (c, data) =>
        c.if(data.conditionTrue, "fooTrue")),
        "fooTrue");

    t.equal(applyData(testData, (c, data) =>
        c.if((c, data) => { return !data.conditionTrue }, "fooTrue")),
        "");

    t.end();
});

test('if/else test', (t) => {

    t.equal(applyData(testData, (c, data) => c.ifElse(data.conditionTrue, "fooTrue", "fooFalse")),
        "fooTrue");

    t.equal(applyData(testData, (c, data) => c.ifElse(!data.conditionTrue, "fooTrue", "fooFalse")),
        "fooFalse");

    t.end();
});

test('join over array test', (t) => {

    t.equal(applyData(testData, (c, data) => {
        return c.join(data.abcArray, " | ", (c, index, name, data) => {
            return `${index}_${name}_${data}`;
        });
    }), "0_0_a | 1_1_b | 2_2_c");

    t.equal(applyData(testData, (c, data) => {
        return c.join(data.abcArray, " | ", (c: Context, index: number, data: any) => {
            return `${index}_${data}`;
        });
    }), "0_a | 1_b | 2_c");

    t.equal(applyData(testData, (c, data) => {
        return c.join(data.abcArray, " | ", (c: Context, data: any) => {
            return `${data}`;
        });
    }), "a | b | c");

    t.end();
});

test('join over object test', (t) => {

    t.equal(applyData(testData, (c, data) => {
        return c.join(data.xyzObj, " | ", (c, index, name, data) => {
            return `${index}_${name}_${data}`;
        });
    }), "0_x_X | 1_y_Y | 2_z_Z");

    t.equal(applyData(testData, (c, data) => {
        return c.join(data.xyzObj, " | ", (c: Context, name: string, data: any) => {
            return `${name}_${data}`;
        });
    }), "x_X | y_Y | z_Z");

    t.equal(applyData(testData, (c, data) => {
        return c.join(data.xyzObj, " | ", (c: Context, data: any) => {
            return `${data}`;
        });
    }), "X | Y | Z");


    t.end();
});

test('with test', (t) => {

    t.equal(applyData(testData, (c, data) => {
        return c.with(data.itemTree.subItem02.values).render((cW, dataW) => {
            return cW.join(dataW, " | ", (c, index, name, data) => data);
        });
    }), "A | S | D");

    t.end();
});

test('parents test', (t) => {

    t.equal(applyData(testData, (c, data) => {

        return c.with(data.itemTree, d => d.subItem02, d => d.values)
            .render((c, d) => {
                return `${c.root.name}:${c.parent.name}:${d.length}`;
            });
    }), "nameValue:subitem 02:3");

    t.equal(applyData(testData, (c, data) => {

        return c.with(data.itemTree, d => d.subItem01, d => d.values)
            .render((c, d) => {
                return `${c.parents.length}:${c.parents[0].name}:${c.parents[1].name}:${c.parents[2].name}`;
            });
    }), "3:subitem 01:itemTree:nameValue");

    t.end();
});


// const c = new Context(testData);

// const result = c.render(codeGen);

// console.info(result);

// function codeGen(this: Context, data: any): string | null {
//     const code = `function ${data.funcName}(p1:string, p2:number${this.renderIf(data.mode == 1, ", ", renderParam)}):void {

//     console.info("foo");

//     ${this.join(data.set, "\n    ", (index: number, data: any) => {
//             return `const var${index} = ${data};`;
//         })}

//     ${this.join(data.obj, "\n    ", (index: number, name: string, data: any) => {
//             return `const var${name} = ${data};`;
//         })}

// }}`;
//     return code;
// }

// function renderParam(this: Context, data: any): string | null {
//     return "p3:number";
// }