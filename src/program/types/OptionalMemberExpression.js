import Node from '../Node.js';

export default class OptionalMemberExpression extends Node {
	transpile(code, transforms) {
		function buildChain(_obj) {
			let obj = _obj;
			let chain = [];
			if (obj.name) {
				chain.push(obj.name);
			} else if (obj.object) {
				chain.push(...buildChain(obj.object), obj.property.name);
			}
			return chain;
		}
		const chain = [...buildChain(this.object), this.property.name];
		code.prependLeft(this.object.start, '(');
		code.overwrite(this.object.end, this.property.end, ` == null ? void 0 : ${chain.join('.')})`);

		super.transpile(code, transforms);
	}
}
