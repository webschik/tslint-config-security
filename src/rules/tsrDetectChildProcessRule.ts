import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    private names: string[] = [];

    visitCallExpression(node: ts.CallExpression) {
        const {expression} = node;
        const firstArgument: ts.StringLiteral = node.arguments && (node.arguments[0] as ts.StringLiteral);

        if (
            firstArgument &&
            expression &&
            firstArgument.kind === ts.SyntaxKind.StringLiteral &&
            firstArgument.text === 'child_process' &&
            expression.getText() === 'require'
        ) {
            const parent: ts.VariableDeclaration = node.parent as ts.VariableDeclaration;

            this.names.length = 0;

            if (parent && parent.kind === ts.SyntaxKind.VariableDeclaration) {
                this.names.push(parent.name.getText());
            }

            this.addFailureAtNode(node, 'Found require("child_process")');
        }

        super.visitCallExpression(node);
    }

    visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        const {name, expression} = node;

        if (name && expression && name.getText() === 'exec' && this.names.indexOf(expression.getText()) >= 0) {
            this.addFailureAtNode(node, 'Found child_process.exec() with non StringLiteral first argument');
        }

        super.visitPropertyAccessExpression(node);
    }
}
