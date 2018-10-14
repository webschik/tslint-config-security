import * as ts from 'typescript';
import * as Lint from 'tslint';
import {StringLiteral, stringLiteralKinds} from '../node-kind';

const keywordMask = new RegExp(
    '^.*((' + ['password', 'secret', 'api', 'apiKey', 'token', 'auth', 'pass', 'hash'].join(')|(') + ')).*$',
    'im'
);

function containsKeyword(node: ts.Expression): boolean {
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

function containsKeywordCallExpression(node: ts.CallExpression) {
    return containsKeyword(node.expression);
}

function containsKeywordElementAccessExpression(node: ts.ElementAccessExpression) {
    if (stringLiteralKinds.includes(node.argumentExpression.kind)) {
        const argumentExpression: StringLiteral = node.argumentExpression as StringLiteral;

        return containsKeyword(node.expression) || Boolean(keywordMask.test(argumentExpression.text));
    }

    return containsKeyword(node.expression) || containsKeyword(node.argumentExpression);
}

function containsKeywordIdentifier(node: ts.Identifier) {
    return Boolean(keywordMask.test(node.text));
}

function containsKeywordPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    return containsKeyword(node.expression) || containsKeyword(node.name);
}

function isVulnerableType(node: ts.Expression): boolean {
    if (stringLiteralKinds.includes(node.kind)) {
        return true;
    }

    switch (node.kind) {
        case ts.SyntaxKind.CallExpression:
            return isVulnerableCallExpression(node as ts.CallExpression);
        case ts.SyntaxKind.ElementAccessExpression:
            return isVulnerableElementAccessExpression(node as ts.ElementAccessExpression);
        case ts.SyntaxKind.Identifier:
            return true;
        case ts.SyntaxKind.PropertyAccessExpression:
            return isVulnerablePropertyAccessExpression(node as ts.PropertyAccessExpression);
        default:
            return false;
    }
}

function isVulnerableCallExpression(node: ts.CallExpression) {
    return isVulnerableType(node.expression);
}

function isVulnerableElementAccessExpression(node: ts.ElementAccessExpression) {
    return isVulnerableType(node.expression) || isVulnerableType(node.argumentExpression);
}

function isVulnerablePropertyAccessExpression(node: ts.PropertyAccessExpression) {
    return isVulnerableType(node.expression) || isVulnerableType(node.name);
}

export class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    visitBinaryExpression(node: ts.BinaryExpression) {
        const operatorTokenKind = node.operatorToken.kind;

        if (
            operatorTokenKind === ts.SyntaxKind.EqualsEqualsToken ||
            operatorTokenKind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
            operatorTokenKind === ts.SyntaxKind.ExclamationEqualsToken ||
            operatorTokenKind === ts.SyntaxKind.ExclamationEqualsEqualsToken
        ) {
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
