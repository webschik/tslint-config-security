import * as Lint from 'tslint';
import * as ts from 'typescript';
import fsModuleMethodsArgumentsInfo from '../fs-module-methods-arguments-info';

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

const expressionsToCheck: string[] = ['fs', `require('fs')`, `require("fs")`];

class RuleWalker extends Lint.RuleWalker {
    visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
        const {name, expression} = node;

        if (name && node.parent && expression) {
            const methodName: string = name.getText();
            const parent: ts.CallExpression = node.parent as ts.CallExpression;
            const fsArgsInfo: number[] | void = fsModuleMethodsArgumentsInfo.get(methodName);
            const methodArguments: ts.NodeArray<ts.Expression> = parent.arguments;

            if (fsArgsInfo && methodArguments && expressionsToCheck.includes(expression.getText())) {
                const invalidArgumentIndices: number[] = fsArgsInfo.filter((index: number) => {
                    const arg: ts.Expression = methodArguments[index];

                    return Boolean(arg && arg.kind !== ts.SyntaxKind.StringLiteral);
                });

                if (invalidArgumentIndices[0] !== undefined) {
                    const errorIndex: string = invalidArgumentIndices.join(', ');

                    this.addFailureAtNode(
                        node,
                        `Found fs.${methodName} with non-literal argument at index ${errorIndex}`
                    );
                }
            }
        }

        super.visitPropertyAccessExpression(node);
    }
}
