
describe('promises', () => {

    describe('promise resolve', (expect, done) => {
        let p = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('finito');
            }, 10);
        });
        p.then((success) => {
            expect(success).toBe('finito');
            done();
        });
    });

    describe('promise reject', (expect, done) => {
        let p = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('finito');
            }, 10);
        });
        p.then(null, (success) => {
            expect(success).toBe('finito');
            done();
        });
    });

    describe('promise error', (expect, done) => {
        let p = new Promise((resolve, reject) => {
            throw new Error('oops');
        });
        p.then().catch((error) => {
            expect(error.message).toBe('oops');
            done();
        });
    });

    describe('non-async still works', (expect) => {
        expect(1).toBe(1);
    });

});
