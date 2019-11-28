import Node from '../Node.js';
import CompileError from '../../utils/CompileError.js';

export default class OptionalMemberExpression extends Node {
	transpile(code, transforms) {
		super.transpile(code, transforms);

		function buildChain(expr) {
			const { computed } = expr;
			const chain = [];

			if (expr.name) {
				chain.push(expr.name);
			} else if (expr.object && expr.property) {
				const { object, property } = expr;

				if (property.type === 'Literal') {
					chain.push(...buildChain(object), `[${property.raw}]`);
				} else if (property.type === 'Identifier') {
					chain.push(...buildChain(object), computed ? `[${property.name}]` : property.name);
				} else {
					throw new CompileError(`Unknown property type found in OptionalMemberExpression: ${property.type}`);
				}
			} else {
				throw new CompileError(`Unknown expression type passed to OptionalMemberExpression: ${expr.type}`);
			}

			return chain;
		}

		function stringifyChain(chain) {
			return chain.slice(1).reduce((prev, next) => {
				if (next.startsWith('[')) {
					return `${prev}${next}`;
				} else {
					return `${prev}.${next}`;
				}
			}, chain[0]);
		}

		const chain = [...buildChain(this)];
		code.prependLeft(this.start, '(');
		code.overwrite(this.object.end, this.end, ` == null ? void 0 : ${stringifyChain(chain)})`);
	}
}
