import { Options } from 'tslint/lib/runner';
import * as os from 'os';
import * as util from 'util';
export type templateFunction = (c: Context, data: any) => string;
export type conditionFunction = (c: Context, data: any) => boolean;
export type selectorFunction = (data: any) => any;
export type iteratorCallback = ((c: Context, index: number, name: string, data: any) => string)
    | ((c: Context, name: string, data: any) => string)
    | ((c: Context, index: number, data: any) => string)
    | ((c: Context, data: any) => string);

export type templateType = templateFunction | string | Array<templateFunction | string>;

/** Class representing a current data binding context */
export class Context {

    data: any;
    name: string;
    index: number;
    depth: number;
    private parentContext: Context | null;

    constructor(data: any, parentContext: Context | null = null, index: number = 0, name: string = "0") {
        this.data = data;
        this.parentContext = parentContext;
        this.index = index;
        this.name = name;
        this.depth = parentContext ? parentContext.depth + 1 : 0;
    }

    get parent(): any | null {
        if (this.parentContext) {
            return this.parentContext.data;
        }
        return null;
    }

    get root(): any | null {

        let current: Context = this;

        while (current.parentContext) {
            current = current.parentContext;
        }
        return current.data;
    }

    get parents(): any[] {
        const ret: any[] = [];

        let current: Context = this;
        while (current.parentContext) {
            current = current.parentContext;
            ret.push(current.data);
        }

        return ret;
    }

    /**
     * renders one of more template functions or strings and then join them into a single output string 
     * @param template - template function or value
     * @param templates - template function or value
     * @returns string or null
     */
    render(template: templateType, ...templates: Array<templateType>): string {
        return this.renderArrayInternal(getTemplates(template, templates));
    }

    /**
     * renders templares only if conditoin is true
     * @param condition - condition value or function
     * @param template - template function or value
     * @param templates - template function or value
     * @returns string or null
     */
    if(condition: boolean | conditionFunction, template: templateType, ...templates: Array<templateType>): string {

        let c = isConditionFunction(condition) ? condition(this, this.data) : condition;

        if (c) {
            return this.renderArrayInternal(getTemplates(template, templates));
        }
        return "";
    }

    /**
     * 
     * @param condition - condition value or function
     * @param thenInput - template function or value if condition is true
     * @param elseInput - template function or value if condition is false
     */
    ifElse(condition: boolean | conditionFunction, thenInput: templateFunction | string, elseInput: templateFunction | string): string {

        let c = isConditionFunction(condition) ? condition.bind(this)() : condition;

        if (c) {
            return this.render(thenInput);
        }
        return this.render(elseInput);
    }

    join(items: { [name: string]: any } | Array<any>,
        separator: string,
        cb: iteratorCallback,
        prefix?: templateType,
        suffix?: templateType,
    ): string {

        const ret: string[] = [];
        if (util.isArray(items)) {
            for (let index = 0; index < items.length; index++) {
                let data = items[index];
                let result = this.callIteratorCallback(index, null, data, cb);
                if (result !== null) {
                    ret.push(result);
                }
            }
        }
        else {

            let index = 0;
            for (const name in items) {
                if (items.hasOwnProperty(name)) {
                    let data = items[name];
                    let result = this.callIteratorCallback(index, name, data, cb);
                    if (result !== null) {
                        ret.push(result);
                    }
                    index++;
                }
            }

        }
        if (ret.length > 0) {
            let pv = "";
            let sv = "";
            if (prefix !== undefined) {
                pv = this.render(prefix);
            }
            if (suffix !== undefined) {
                sv = this.render(suffix);
            }
            return pv + ret.join(separator) + sv;

        }
        return ret.join(separator);
    }


    with(selector: any | selectorFunction, ...selectors: Array<selectorFunction>): Context {
        let data = selector;
        if (isSelectorFunction(selector)) {
            data = selector(this.data);
        }
        let currentContext = new Context(data, this);
        for (let sel of selectors) {
            data = sel(currentContext.data);
            currentContext = new Context(data, currentContext);
        }
        return currentContext;
    }

    private callIteratorCallback(
        index: number,
        name: string | null,
        data: any,
        cb: iteratorCallback
    ): string {

        const nameString = name === null ? index.toString() : name;
        const context = new Context(data, this, index, nameString);

        switch (cb.length) {
            case 4:
                return cb.call(this, context, index, nameString, data);
            case 3:
                return cb.call(this, context, name === null ? index : name, data);
            case 2:
                return cb.call(this, context, data);
            default:
                return cb.call(this, context, index, nameString, data);
        }
    }

    protected renderArrayInternal(templates: Array<templateFunction | string>): string {
        if (templates.length === 0) {
            return "";
        }
        if (templates.length === 1) {
            return this.renderInternal(templates[0]);
        }
        const ret: string[] = [];
        templates.forEach((input) => {
            const res = this.renderInternal(input);
            if (res != null) {
                ret.push(res);
            }
        });
        return ret.join("");
    }
    private renderInternal(input: templateFunction | string): string {

        if (isTemplateFunction(input)) {
            return input(this, this.data);
        }
        return input;
    }
}

function isConditionFunction(condition: boolean | conditionFunction): condition is conditionFunction {
    return util.isFunction(condition);
}
function isTemplateFunction(template: string | templateFunction): template is templateFunction {
    return util.isFunction(template);
}

function isTemplateArray(template: templateType): template is Array<string | templateFunction> {
    return util.isArray(template);
}

function isSelectorFunction(selector: any | selectorFunction): selector is selectorFunction {
    return util.isFunction(selector);
}

function getTemplates(template: templateType, templates: Array<templateType>): Array<templateFunction | string> {
    const ret: Array<templateFunction | string> = [];

    const q = [template].concat(templates);
    while (q.length > 0) {
        let item = q.shift();
        if (item !== undefined) {

            if (isTemplateArray(item)) {
                for (let t of item) {
                    q.push(t);
                }
            } else {
                ret.push(item);
            }
        }
    }
    return ret;
}

export function applyData(data: any, template: templateType, ...templates: Array<templateType>): string {
    let context = new Context(data);
    const q = getTemplates(template, templates);
    return context.render(q);
};

export default applyData;
