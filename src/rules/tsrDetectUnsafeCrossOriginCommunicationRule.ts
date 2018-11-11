import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitCallExpression(node: ts.CallExpression) {
        const {name} = node.expression as ts.PropertyAccessExpression;
        const [, targetOrigin]: ts.NodeArray<ts.Expression> = node.arguments || [];

        if (
            name &&
            targetOrigin &&
            name.getText() === 'postMessage' &&
            ((targetOrigin as ts.StringLiteral).text || '').trim() === '*'
        ) {
            this.addFailureAtNode(node, 'Found a wildcard keyword (*) in the targetOrigin argument');
        }

        super.visitCallExpression(node);
    }
}
