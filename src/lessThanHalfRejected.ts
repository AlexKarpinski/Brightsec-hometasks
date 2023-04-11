/**
 * lessThanHalfRejected function returns a promise that:
 * - resolves if amount of rejected promises from promiseCollection is less than half of promiseCollection length
 * - rejects if at least one promise does not settle within the specified timeout
 *
 * @returns Promise<void>
 * @param promiseCollection
 * @param timeout
 */
export const lessThanHalfRejected = async (promiseCollection: Promise<any>[], timeout?: number): Promise<void> => {
    validateParams(promiseCollection, timeout);

    const maxRejectedPromisesCount = Math.floor(promiseCollection.length / 2);
    let timeoutIsNotSettled = false;

    const results = await Promise.allSettled(
        promiseCollection.map((prom) =>
            Promise.race([
                prom,
                new Promise((resolve, reject) =>
                    setTimeout(() => {
                        timeoutIsNotSettled = true;
                        reject(new Error('Promise did not settle'));
                    }, timeout)
                ),
            ]),
        ),
    );

    if (timeoutIsNotSettled) {
        throw new Error('At least one promise did not settle within the specified timeout');
    }

    const rejectedCountPromisesCount = results.filter(({ status }) => status === 'rejected').length;

    if (rejectedCountPromisesCount > maxRejectedPromisesCount) {
        throw new Error(`Too many promises (${rejectedCountPromisesCount}) were rejected.`);
    }
};

const validateParams = (promiseCollection: Promise<any>[], timeout?: number) => {
    if (!Array.isArray(promiseCollection)) {
        throw new Error('Parameter must be an array');
    }

    if (promiseCollection.some(p => !(p instanceof Promise))) {
        throw new Error('All elements in array must be a Promise instance');
    }

    if (timeout !== undefined && typeof timeout !== 'number') {
        throw new Error('Timeout parameter must be a number');
    }

    if (timeout !== undefined && timeout < 0) {
        throw new Error('Timeout parameter cannot be negative');
    }
};