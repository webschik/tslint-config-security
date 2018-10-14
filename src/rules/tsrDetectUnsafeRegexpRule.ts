import * as ts from 'typescript';
import * as Lint from 'tslint';
import {StringLiteral, stringLiteralKinds} from '../node-kind';

const isSafeRegexp = require('safe-regex');

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitRegularExpressionLiteral(node: ts.RegularExpressionLiteral) {
        if (node.text && !isSafeRegexp(node.text)) {
            this.addFailureAtNode(node, 'Unsafe Regular Expression');
        }

        super.visitRegularExpressionLiteral(node);
    }

    visitNewExpression(node: ts.NewExpression) {
        const expression: ts.Identifier = node.expression as ts.Identifier;
        const firstArgument: undefined | StringLiteral = node.arguments && (node.arguments[0] as StringLiteral);

        if (
            expression &&
            expression.text === 'RegExp' &&
            firstArgument &&
            stringLiteralKinds.includes(firstArgument.kind) &&
            firstArgument.text &&
            !isSafeRegexp(firstArgument.text)
        ) {
            this.addFailureAtNode(node, 'Unsafe Regular Expression (new RegExp)');
        }

        super.visitNewExpression(node);
    }
}
