import {expect, test} from '@playwright/test';
import {lessThanHalfRejected} from '../src/promise-lessThanHalfRejected';

test.describe('lessThanHalfRejected >> should be rejected @rejected', () => {

    test('if one rejected promise TC01', async () => {
        await expect(lessThanHalfRejected([Promise.reject(new Error('error'))]))
            .rejects.toThrow('Too many promises (1) were rejected.');
    });

    test('if more than half of promises are rejected TC02', async () => {
        const promises = [
            Promise.resolve(),
            Promise.reject(new Error('error')),
            Promise.reject(new Error('error')),
        ];

        await expect(lessThanHalfRejected(promises))
            .rejects.toThrow('Too many promises (2) were rejected');
    });

    test('if array contains Promises that never settle TC03', async () => {
        const promises = [
            new Promise(() => {
            }),
            new Promise(() => {
            }),
            new Promise(() => {
            }),
        ];
        await expect(lessThanHalfRejected(promises)).rejects
            .toThrow('At least one promise did not settle within the specified timeout');
    });
});

test.describe('lessThanHalfRejected >> should be resolved @resolved', () => {

    test('if empty array TC04', async () => {
        await expect(lessThanHalfRejected([])).resolves.toBeUndefined();
    });

    test('if one resolved promise TC05', async () => {
        await expect(lessThanHalfRejected([Promise.resolve()])).resolves.toBeUndefined();
    });

    test('if the same count of promises are rejected as resolved TC06', async () => {
        const promises = [
            Promise.resolve(),
            Promise.reject(new Error('error')),
        ];
        await expect(lessThanHalfRejected(promises)).resolves.toBeUndefined();
    });

    test('if less than half of promises are rejected TC07', async () => {
        const promises = [
            Promise.resolve(),
            Promise.resolve(),
            Promise.reject(new Error('error')),
        ];
        await expect(lessThanHalfRejected(promises)).resolves.toBeUndefined();
    });
});

test.describe('lessThanHalfRejected >> should throw @errorshandler', () => {

    test('parameter array error if promiseCollection is not an array TC08', async () => {
        const promiseCollection = {} as Promise<any>[];
        await expect(lessThanHalfRejected(promiseCollection))
            .rejects.toThrow('Parameter must be an array');
    });

    test('promise instance error if array contains non-Promise values TC09', async () => {
        // @ts-ignore
        await expect(lessThanHalfRejected([1, 'string', true]))
            .rejects.toThrow('All elements in array must be a Promise instance');
    });

    test('timeout negative error if timeout parameter is negative TC10', async () => {
        const promiseCollection = [Promise.resolve()];
        const timeout = -1;
        await expect(lessThanHalfRejected(promiseCollection, timeout))
            .rejects.toThrow('Timeout parameter cannot be negative');
    });

    test('promise settle error if at least one promise does not settle within the specified timeout TC11', async () => {
        const timeout = 5000;
        const promiseCollection = [
            new Promise((resolve) => setTimeout(() => resolve('done'), timeout * 2)),
        ];
        await expect(lessThanHalfRejected(promiseCollection, timeout))
            .rejects.toThrow('At least one promise did not settle within the specified timeout');
    });

});
