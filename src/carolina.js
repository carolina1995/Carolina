(function (root) {
    var carolina;

    if (!('webkitSpeechRecognition' in window)) {
        return upgrade();
    }

    var rec = new webkitSpeechRecognition();

    rec.continuous = true;
    rec.interimResults = true;

    var _ran = false,
        _options,
        _isDebug = false,
        _errorCount = 0,
        final_transcript;


    var _isRan = function () {
        if (!_ran) {
            console.error('You must initailzied carolina.js `carolina.init(options)`');
            return false;
        }

        return true;
    }


    var innerFunctionAPI = {

        start: function () {
            rec.start();
        },


        abort: function () {
            rec.abort();
        },


        stop: function () {
            rec.stop();
        },


        doctor: function () {
            console.log('Library Status Health!.'
                +
                '\n'
                +
                `debug mode is ${_isDebug ? 'ON' : 'OFF'} `
                +
                '\n'
                +
                `Configuration details are ${JSON.stringify(_options)}`
                +
                '\n'
                +
                `Library health condition ${_errorCount > 10 ? 'Poor' : 'Good'}`
            );
        }
    }

    rec.onstart = function () {
        console.warn('Start listen');
    }


    rec.onresult = function (event) {
        var interim_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        // final_transcript = capitalize(final_transcript);
        final_transcript = final_transcript;

        console.log('Final transcript => ', final_transcript);
        console.log('Interim transcript => ', interim_transcript);
    }


    rec.onerror = function (event) {
        _errorCount++;
        console.warn('An error been occured => ', event);
        console.error(event.error);
    }


    rec.onend = function () {
        console.warn('Speaker stop listen.');
    }


    root.carolina = {
        init: function (options) {
            if (_ran)
                return console.log('You can init only once.');

            _ran = true;

            _options = Object.assign({}, _options, { lang: options.lang });

            _isDebug = 'boolean' === typeof options.debug ? options.debug : false;

            rec.lang = _options.lang;
        },

        fn: function (method, ...args) {
            if (!_isRan()) {
                return;
            }

            if ('function' !== typeof innerFunctionAPI[method]) {
                console.error('You try to invoke invalid method => ', method);
                return;
            }

            innerFunctionAPI[method].apply(this, args);
        }
    }
})(window);