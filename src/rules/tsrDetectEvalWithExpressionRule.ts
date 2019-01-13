import * as Lint from 'tslint';
import * as ts from 'typescript';
import {stringLiteralKinds} from '../node-kind';
import syntaxKindToName from '../syntax-kind-to-name';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitCallExpression(node: ts.CallExpression) {
        const firstArgument: ts.Expression = node.arguments[0];

        if (node.expression.getText() === 'eval' && firstArgument && !stringLiteralKinds.includes(firstArgument.kind)) {
            this.addFailureAtNode(node, `eval with argument of type ${syntaxKindToName(firstArgument.kind)}`);
        }

        super.visitCallExpression(node);
    }

    visitNewExpression(node: ts.NewExpression) {
        if (
            node.arguments &&
            node.expression.getText() === 'Function' &&
            node.arguments.some((node: ts.Node) => !stringLiteralKinds.includes(node.kind))
        ) {
            this.addFailureAtNode(node, 'Found function constructor with non-literal argument');
        }

        super.visitNewExpression(node);
    }
}
