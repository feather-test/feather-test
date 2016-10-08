
describe('negated', function () {

    describe('when mogwai gets wet', function () {

        var skin = 'smooth';
        var temperament = 'angry';

        describe('he becomes a gremlin', function () {
            expect(skin).not.toBe(global.wrongValue ? 'smooth' : 'furry');
            expect(temperament).toBe(global.wrongValue || 'angry');
        });

    });

});
