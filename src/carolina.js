(function (root) {
    // If the browser is not support kill this execution script as soon as possible.
    if (!('webkitSpeechRecognition' in window)) {
        _logger('warn', 'Your browser is not support webkit speech recognition!');
        return;
    }

    // Create browser speech recognition instance.
    /**
     * Browser speech recognition instance.
     *
     * @property
     */
    var rec = new webkitSpeechRecognition();

    rec.continuous = true;
    rec.interimResults = true;

    /**
     * @property
     * @private
     */
    var _ran = false,


        /**
         * @property
         * @private
         */
        _options,


        /**
         * @property
         * @private
         */
        _isDebug = false,


        /**
         * @property
         * @private
         */
        _errorCount = 0,


        /**
         * @property
         * @private
         */
        _isListening = false,


        /**
         * @property
         * @private
         */
        _final_transcript;


    // Callbacks constants.
    const ON_START = 'onStart',
        ON_END = 'onEnd',
        ON_ERROR = 'onError',
        ON_LIVE_STREAM = 'onLiveStream',
        ON_CHUNK_STREAM = 'onChunkStream';


    /**
     * Checking if the library is already been `ran` it mean initialized by the user.
     * 
     * @function
     * @private
     */
    var _isRan = function () {
        if (!_ran) {
            _logger('error', 'You must initailzied carolina.js `carolina.init(options)`')
            return false;
        }

        return true;
    }


    /**
     * Final transcript setter.
     * 
     * @function
     * @private
     * @param {*} finalTranscript 
     */
    var _setFinalTranscript = function (finalTranscript) {
        _final_transcript = finalTranscript;

        return this;
    }


    /**
     * Is listening setter.
     * 
     * @param {*} isListening 
     */
    var _setIsListening = function (isListening) {
        _isListening = isListening;

        return this;
    }


    /**
     * Carolina generic inner library logger.
     * 
     * @param {*} type 
     * @param {*} msg 
     * @param {*} args 
     */
    var _logger = function (type, msg, ...args) {
        if ('function' !== typeof console[type]) {
            console.error('Trying to you console log with unknown console type => ', type);
            return;
        }

        // If the user not set the configuration to be at debug mode we will not print debug logs.
        if (type === 'debug' && !_isDebug) {
            return;
        }

        return console[type]('CAROLINA::' + msg, args);
    }


    /**
     * Callback to user handler.
     * 
     * @function
     * @param {*} cbName 
     * @param {*} args 
     */
    var _invokeCallbacks = function (cbName, ...args) {
        var cbs = _options.callbacks;

        // Check if callbacks configured.
        if (!cbs) {
            _logger('debug', 'There is no configured callbacks!');
            return;
        }

        // Check if the callback name exist is the callbacks object.
        if (!cbs[cbName]) {
            _logger('debug', 'There is no callback configured for callback name => ', cbName);
            return;
        }

        cbs[cbName].apply(cbs.context, args);
    }


    /**
     * Hide inner api function from the users only reveal by the facade bridge for more protection.
     * 
     * @type {object}
     * @private
     */
    var innerFunctionAPI = {

        /**
         * @function
         */
        start: function () {
            rec.start();
        },


        /**
         * @function
         */
        abort: function () {
            rec.abort();

            // Clean final transcript.
            _setFinalTranscript('');
        },


        /**
         * @function
         */
        stop: function () {
            rec.stop();

            // Clean final transcript.
            _setFinalTranscript('');
        },


        /**
         * Print to the user about the library current state, health and configuration.
         *
         * @function
         */
        doctor: function () {
            var doctorReport = '<h3>Library Status Health</h3>'
                +
                '\n'
                +
                `debug mode is ${_isDebug ? 'ON' : 'OFF'} `
                +
                '\n'
                +
                `Configuration details are: ${JSON.stringify(_options)}`
                +
                '\n'
                +
                `Library health condition ${_errorCount > 3 ? 'Poor' : 'Good'}`

            _logger('info', doctorReport);
        },


        /**
         * Show if the current library is in listening state or not.
         * 
         * @function
         * @returns {boolean}
         */
        isListening: function () {
            return _isListening;
        }
    }


    /**
     * User start speaking callback handler.
     */
    rec.onstart = function () {
        _setIsListening(true);
        _logger('debug', 'Start listening... ');
        _invokeCallbacks(ON_START);
    }


    /**
     * Getting live on result user speaking text.
     * 
     * @function
     * @private
     */
    rec.onresult = function (event) {
        var interim_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                _final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        _final_transcript = _final_transcript;

        _logger('debug', 'Final continues speaking stream string => ', _final_transcript);
        _logger('debug', 'Interim transcript current speaking value => ', interim_transcript);
        _invokeCallbacks(ON_LIVE_STREAM, _final_transcript);
        _invokeCallbacks(ON_CHUNK_STREAM, interim_transcript);
    }


    /**
     * Library enounter in error callback handler.
     */
    rec.onerror = function (event) {
        // Increase the library error counter this should represent the library condition health.
        _errorCount++;
        _setIsListening(false);
        _logger('error', 'An error been occured => ', event);
        _invokeCallbacks(ON_ERROR, event);
    }


    /**
     * User stop speaking callback handler.
     */
    rec.onend = function () {
        _setIsListening(false);
        _logger('info', 'Stop listening... ');
        _invokeCallbacks(ON_END, event);
    }


    root.Carolina = {

        /**
         * Initialization function getting configuration from client and invoke the library.
         * You can read in our docs about the initialization parameters.
         *
         * @function
         */
        init: function (options) {
            if (_ran)
                return console.log('You can init only once.');

            _ran = true;

            _options = Object.assign({}, _options, options);

            _isDebug = 'boolean' === typeof options.debug ? options.debug : false;

            rec.lang = _options.lang;
        },


        /**
         * Facade bridge to inner carolina api functions.
         * 
         * @function
         */
        fn: function (method, ...args) {
            if (!_isRan()) {
                return;
            }

            if ('function' !== typeof innerFunctionAPI[method]) {
                _logger('error', 'You try to invoke invalid method => ', method);
                return;
            }

            return innerFunctionAPI[method].apply(this, args);
        }
    }
})(window);