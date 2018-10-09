import * as ts from 'typescript';
import * as Lint from 'tslint';

const keywordMask = new RegExp('^.*((' + [
    'password',
    'secret',
    'api',
    'apiKey',
    'token',
    'pass',
    'hash'
].join(')|(') + ')).*$', 'im');

function containsKeyword (node: ts.Expression): boolean {
    switch (node.kind) {
        case ts.SyntaxKind.CallExpression:
            return containsKeywordCallExpression(node as ts.CallExpression);
        case ts.SyntaxKind.ElementAccessExpression:
            return containsKeywordElementAccessExpression(node as ts.ElementAccessExpression);
        case ts.SyntaxKind.Identifier:
            return containsKeywordIdentifier(node as ts.Identifier);
        case ts.SyntaxKind.PropertyAccessExpression:
            return containsKeywordPropertyAccessExpression(node as ts.PropertyAccessExpression);
        default:
            return false;
    }
}

function containsKeywordCallExpression (node: ts.CallExpression) {
    return containsKeyword(node.expression);
}

function containsKeywordElementAccessExpression (node: ts.ElementAccessExpression) {
    if (node.argumentExpression.kind === ts.SyntaxKind.StringLiteral) {
        const argumentExpression = (node.argumentExpression as ts.StringLiteral);
        return containsKeyword(node.expression) || Boolean(keywordMask.test(argumentExpression.text));
    } else {
        return containsKeyword(node.expression) || containsKeyword(node.argumentExpression);
    }
}

function containsKeywordIdentifier (node: ts.Identifier) {
    return Boolean(keywordMask.test(node.text));
}

function containsKeywordPropertyAccessExpression (node: ts.PropertyAccessExpression) {
    return containsKeyword(node.expression) || containsKeyword(node.name);
}

function isVulnerableType (node: ts.Expression): boolean {
    switch (node.kind) {
        case ts.SyntaxKind.CallExpression:
            return isVulnCallExpression(node as ts.CallExpression);
        case ts.SyntaxKind.ElementAccessExpression:
            return isVulnElementAccessExpression(node as ts.ElementAccessExpression);
        case ts.SyntaxKind.Identifier:
            return true;
        case ts.SyntaxKind.PropertyAccessExpression:
            return isVulnPropertyAccessExpression(node as ts.PropertyAccessExpression);
        case ts.SyntaxKind.StringLiteral:
            return true;
        default:
            return false;
    }
}

function isVulnCallExpression (node: ts.CallExpression) {
    return isVulnerableType(node.expression);
}

function isVulnElementAccessExpression (node: ts.ElementAccessExpression) {
    return isVulnerableType(node.expression) || isVulnerableType(node.argumentExpression);
}

function isVulnPropertyAccessExpression (node: ts.PropertyAccessExpression) {
    return isVulnerableType(node.expression) || isVulnerableType(node.name);
}

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitBinaryExpression (node: ts.BinaryExpression) {
        if (node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
            node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
            node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken ||
            node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken) {

            if (isVulnerableType(node.left) && isVulnerableType(node.right)) {
                if (containsKeyword(node.left)) {
                    this.addFailureAtNode(node, 'Potential timing attack on the left side of expression');
                } else if (containsKeyword(node.right)) {
                    this.addFailureAtNode(node, 'Potential timing attack on the right side of expression');
                }
            }
        }

        super.visitBinaryExpression(node);
    }
}
