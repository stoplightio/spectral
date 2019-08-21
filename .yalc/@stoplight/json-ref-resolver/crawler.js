"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_1 = require("@stoplight/json");
const dependency_graph_1 = require("dependency-graph");
const lodash_1 = require("lodash");
const Utils = require("./utils");
class ResolveCrawler {
    constructor(runner, jsonPointer) {
        this.resolvers = [];
        this.pointerGraph = new dependency_graph_1.DepGraph({ circular: true });
        this.pointerStemGraph = new dependency_graph_1.DepGraph({ circular: true });
        this.computeGraph = (target, parentPath = [], parentPointer = '#', pointerStack = []) => {
            if (!parentPointer)
                parentPointer = '#';
            let ref = this._runner.computeRef({
                val: target,
                jsonPointer: parentPointer,
                pointerStack,
            });
            if (ref) {
                this._resolveRef({
                    ref,
                    val: target,
                    parentPath,
                    pointerStack,
                    parentPointer,
                    cacheKey: parentPointer,
                    resolvingPointer: this.jsonPointer,
                });
            }
            else if (typeof target === 'object') {
                for (const key in target) {
                    if (!target.hasOwnProperty(key))
                        continue;
                    const val = target[key];
                    const currentPointer = Utils.addToJSONPointer(parentPointer, key);
                    ref = this._runner.computeRef({
                        key,
                        val,
                        jsonPointer: currentPointer,
                        pointerStack,
                    });
                    parentPath.push(key);
                    if (ref) {
                        this._resolveRef({
                            ref,
                            val,
                            parentPath,
                            parentPointer: currentPointer,
                            pointerStack,
                            cacheKey: Utils.uriToJSONPointer(ref),
                            resolvingPointer: this.jsonPointer,
                        });
                    }
                    else if (typeof val === 'object') {
                        this.computeGraph(val, parentPath, currentPointer, pointerStack);
                    }
                    parentPath.pop();
                }
            }
        };
        this._resolveRef = (opts) => {
            const { pointerStack, parentPath, parentPointer, ref } = opts;
            if (Utils.uriIsJSONPointer(ref)) {
                if (this._runner.dereferenceInline) {
                    const targetPointer = Utils.uriToJSONPointer(ref);
                    const targetPath = json_1.pointerToPath(targetPointer);
                    let referencesParent = true;
                    for (const i in targetPath) {
                        if (parentPath[i] !== targetPath[i]) {
                            referencesParent = false;
                            break;
                        }
                    }
                    if (referencesParent)
                        return;
                    if (!this.pointerStemGraph.hasNode(targetPointer)) {
                        this.pointerStemGraph.addNode(targetPointer);
                    }
                    let stem = '#';
                    let tail = '';
                    for (let i = 0; i < parentPath.length; i++) {
                        const part = parentPath[i];
                        if (part === targetPath[i]) {
                            stem += `/${part}`;
                        }
                        else {
                            tail += `/${part}`;
                            const dep = `${stem}${tail}`;
                            if (dep !== parentPointer && dep !== targetPointer) {
                                if (!this.pointerStemGraph.hasNode(dep)) {
                                    this.pointerStemGraph.addNode(dep);
                                }
                                this.pointerStemGraph.addDependency(dep, targetPointer);
                            }
                        }
                    }
                    if (!this.pointerGraph.hasNode(parentPointer)) {
                        this.pointerGraph.addNode(parentPointer);
                    }
                    if (!this.pointerGraph.hasNode(targetPointer)) {
                        this.pointerGraph.addNode(targetPointer);
                    }
                    this.pointerGraph.addDependency(parentPointer, targetPointer);
                    if (this.jsonPointer) {
                        pointerStack.push(targetPointer);
                        this.computeGraph(lodash_1.get(this._runner.source, targetPath), targetPath, targetPointer, pointerStack);
                        pointerStack.pop();
                    }
                }
            }
            else {
                if (this._runner.dereferenceRemote && !this._runner.atMaxUriDepth()) {
                    this.resolvers.push(this._runner.lookupAndResolveUri(opts));
                }
            }
        };
        this.jsonPointer = jsonPointer;
        this._runner = runner;
    }
}
exports.ResolveCrawler = ResolveCrawler;
//# sourceMappingURL=crawler.js.map