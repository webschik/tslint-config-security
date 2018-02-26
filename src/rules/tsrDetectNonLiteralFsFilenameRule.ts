import * as ts from 'typescript';
import * as Lint from 'tslint';
import fsModuleMethodsArgumentsInfo from '../fs-module-methods-arguments-info';

export class Rule extends Lint.Rules.AbstractRule {
    apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitPropertyAccessExpression (node: ts.PropertyAccessExpression) {
        const name: ts.Identifier = node.name;
        const methodName: string = name && name.text;
        const parent: ts.CallExpression = node.parent as ts.CallExpression;
        const fsArgsInfo: number[] = methodName && fsModuleMethodsArgumentsInfo[methodName];
        const methodArguments: ts.NodeArray<ts.Expression> = parent && parent.arguments;

        if (fsArgsInfo && methodArguments) {
            const invalidArgumentIndices: number[] = fsArgsInfo.filter((index: number) => {
                const arg: ts.Expression = methodArguments[index];

                return Boolean(arg && arg.kind !== ts.SyntaxKind.StringLiteral);
            });

            if (invalidArgumentIndices[0] !== undefined) {
                this.addFailureAtNode(
                    node,
                    `Found fs.${ methodName } with non-literal argument as index ${ invalidArgumentIndices.join(', ')}`
                );
            }
        }

        super.visitPropertyAccessExpression(node);
    }
}