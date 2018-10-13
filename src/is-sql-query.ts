function createMainKeywordsPattern(keyword: string): RegExp {
    return new RegExp(`(^|\\s)(${keyword})`);
}

const selectKeyword: RegExp = createMainKeywordsPattern('SELECT');
const deleteKeyword: RegExp = createMainKeywordsPattern('DELETE');
const insertKeyword: RegExp = createMainKeywordsPattern('INSERT');
const updateKeyword: RegExp = createMainKeywordsPattern('UPDATE');
const dropKeyword: RegExp = createMainKeywordsPattern('DROP');
const createKeyword: RegExp = createMainKeywordsPattern('CREATE');
const alterKeyword: RegExp = createMainKeywordsPattern('ALTER');

/**
 * @description Basic SQL query detection
 * @param {string} q
 * @returns {boolean}
 */
export function isSqlQuery(q: string): boolean {
    // detect the shortest sql query
    if (!q[11]) {
        return false;
    }

    const query: string = q.toUpperCase();

    if (selectKeyword.test(query) && (query.includes(' FROM ') || query.includes('*FROM '))) {
        return true;
    }

    if (insertKeyword.test(query) && query.includes(' INTO ')) {
        return true;
    }

    if (updateKeyword.test(query) && query.includes(' SET ')) {
        return true;
    }

    if (deleteKeyword.test(query) && query.includes(' FROM ')) {
        return true;
    }

    if (dropKeyword.test(query) && (query.includes(' TABLE ') || query.includes(' DATABASE '))) {
        return true;
    }

    if (
        createKeyword.test(query) &&
        (query.includes(' INDEX ') || query.includes(' TABLE ') || query.includes(' DATABASE '))
    ) {
        return true;
    }

    if (alterKeyword.test(query) && query.includes(' TABLE ')) {
        return true;
    }

    return false;
}
