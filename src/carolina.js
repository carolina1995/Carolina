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

    /**
     * @property
     * @private
     */
    var _ran = false,


        /**
         * @property
         * @private
         */
        _options = {
            toString: function () {
                var str = '\n';

                Object.keys(this).map((function(key, index, arr) {
                    if (key === 'toString') {
                        return;
                    }

                    str += key + ' => ' + this[key];

                    if (index !== arr.length - 1) {
                        str += '\n';
                    }
                }).bind(this));

                return str;
            }
        },


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
        _final_transcript = '';


    // Callbacks constants.
    const ON_START = 'onStart',
        ON_END = 'onEnd',
        ON_ERROR = 'onError',
        ON_LIVE_STREAM = 'onLiveStream',
        ON_CHUNK_STREAM = 'onChunkStream',
        ON_INTERIM_TRANSCRIPT = 'onInterimTranscript',
        ON_SOUND_START = 'onSoundStart',
        ON_NO_MATCH = 'onNoMatch',
        ON_SOUND_END = 'onSoundEnd',
        ON_SPEECH_START = 'onSpeechStart',
        ON_SPEECH_END = 'onSpeechEnd';

    // API Event functions.
    const ON_RESULT = 'ON_RESULT';


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

        if (Array.isArray(args) && args.length > 0) {
            console[type]('CAROLINA::' + msg, args);
            return;
        }

        console[type]('CAROLINA::' + msg);
    }


    /**
     * Function invoke profiler for monitoring preformence.
     */
    var _profiler = function (method) {
        var _start,
            _end;

        return {
            start: function () {
                _start = new Date();
            },

            end: function () {
                _end = new Date();
                var duration = _end.getTime() - _start.getTime();

                _logger('debug', `${method} took ${duration} ms to execute`);
            }
        }
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
     * API Event function when we get notify by google about the voice recogniton text and confidence.
     * 
     * @function
     * @param {*} event 
     */
    var _onResult = function (event) {
        var interim_transcript = '',
            profiler = new _profiler(ON_RESULT);

        // Start profling and monitoring function execution.
        profiler.start();

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            var chunkTranscript = event.results[i][0].transcript,
                confidence = event.results[i][0].confidence;

            if (_options.quality !== Math.round(confidence)) {
                _logger('warn', 'The transcript we got is not confidence enough due to your quality restrictions. ', chunkTranscript);
                return;
            }

            if (event.results[i].isFinal) {
                _final_transcript += chunkTranscript;
                _logger('debug', 'Recevied new chunk transcript from user speaking text value & confidence => ', chunkTranscript, confidence);
                _invokeCallbacks(ON_CHUNK_STREAM, chunkTranscript);
            } else {
                interim_transcript += chunkTranscript;
                _logger('debug', 'Interim transcript current speaking value => ', interim_transcript);
                _invokeCallbacks(ON_INTERIM_TRANSCRIPT, interim_transcript);
            }
        }

        _final_transcript = _final_transcript;
        _logger('debug', 'Live stream of transcript => ', _final_transcript);
        _invokeCallbacks(ON_LIVE_STREAM, _final_transcript);

        // End profling and monitoring function execution.
        profiler.end();
    }


    /**
     * API Event function when the service is start listening.
     * 
     * @function
     */
    var _onStart = function () {
        _setIsListening(true);
        _logger('debug', 'Start listening... ');
        _invokeCallbacks(ON_START);
    }


    /**
     * API Event function when the service got error.
     * 
     * @function
     */
    var _onError = function (event) {
        // Increase the library error counter this should represent the library condition health.
        _errorCount++;
        _setIsListening(false);
        _logger('error', 'An error been occured => ', event);
        _invokeCallbacks(ON_ERROR, event);
    }


    /**
     * API Event function when the service is end talking.
     * 
     * @function
     */
    var _onEnd = function (event) {
        _setIsListening(false);
        // Clean final transcript.
        _setFinalTranscript('');
        _logger('info', 'Stop listening... ');
        _invokeCallbacks(ON_END, event);
    }


    /**
     * API Event function when the service start sound.
     * 
     * @param {*} event 
     */
    var _onSoundStart = function (event) {
        _logger('debug', 'Sound recognisable speech or not has been detected');
        _invokeCallbacks(ON_SOUND_START, event);
    }


    /**
     * API Event function when the service is not getting any match.
     * 
     * @param {*} event 
     */
    var _onNoMatch = function (event) {
        _logger('debug', 'Speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesnt meet or exceed the confidence threshold.');
        _invokeCallbacks(ON_NO_MATCH, event);
    }


    /**
     * API Event function when the service sound end.
     * 
     * @param {*} event 
     */
    var _onSoundEnd = function (event) {
        _logger('debug', 'Any sound recognisable speech or not has stopped being detected.');
        _invokeCallbacks(ON_SOUND_END, event);
    }


    /**
     * API Event function when the service speech start
     * 
     * @param {*} event 
     */
    var _onSpeechStart = function (event) {
        _logger('debug', 'A sound that is recognised by the speech recognition service as speech has been detected.');
        _invokeCallbacks(ON_SPEECH_START, event);
    }


    /**
     * API Event function when the service speech end.
     * 
     * @param {*} event 
     */
    var _onSpeechEnd = function (event) {
        _logger('debug', 'Speech recognised by the speech recognition service has stopped being detected.');
        _invokeCallbacks(ON_SPEECH_END, event);
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
        },


        /**
         * @function
         */
        stop: function () {
            rec.stop();
        },


        /**
         * This function cleaning the stream.
         * 
         * @function
         */
        clearStream: function () {
            _setFinalTranscript('');
        },


        /**
         * Print to the user about the library current state, health and configuration.
         *
         * @function
         */
        doctor: function () {
            var doctorReport = 'Library Status Health'
                +
                '\n'
                +
                `debug mode is ${_isDebug ? 'ON' : 'OFF'} `
                +
                '\n'
                +
                `configuration details are: ${_options.toString()}`
                +
                '\n'
                +
                `library health condition ${_errorCount > 3 ? 'POOR' : 'GOOD'}`
                +
                '\n'
                +
                `quality of speaking ${_options.quality === 1 ? 'GOOD' : 'POOR'}`

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
    rec.onstart = _onStart;


    /**
     * Getting live on result user speaking text.
     * 
     * @function
     * @private
     */
    rec.onresult = _onResult;


    /**
     * Library enounter in error callback handler.
     */
    rec.onerror = _onError;


    /**
     * User stop speaking callback handler.
     */
    rec.onend = _onEnd;


    /**
     * Fired when the speech recognition service returns a final result with no significant recognition. 
     * This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
     */
    rec.onnomatch = _onNoMatch;


    /**
     * Fired when any sound — recognisable speech or not — has been detected.
     */
    rec.onsoundstart = _onSoundStart;


    /**
     * Fired when any sound — recognisable speech or not — has stopped being detected.
     */
    rec.onsoundend = _onSoundEnd;


    /**
     * Fired when sound that is recognised by the speech recognition service as speech has been detected.
     */
    rec.onspeechstart = _onSpeechStart;


    /**
     * Fired when speech recognised by the speech recognition service has stopped being detected.
     */
    rec.onspeechend = _onSpeechEnd;


    root.Carolina = {

        /**
         * Initialization function getting configuration from client and invoke the library.
         * You can read in our docs about the initialization parameters.
         *
         * @function
         */
        init: function (options) {
            if (_ran) {
                _logger('error', 'You can init only once');
                return;
            }

            // Lock the init function for more initialization, this init function should run only once.
            _ran = true;

            // Set carolina configuration settings.
            _options = Object.assign({},
                _options,
                {
                    lang: options.lang || 'en-US',
                    debug: options.debug || false,
                    quality: options.quality || 1,
                    continuous: options.continuous || false,
                    interimResults: options.interimResults || false,
                    callbacks: options.callbacks
                });

            // Set debug mode indicator from configuration settings.
            _isDebug = 'boolean' === typeof options.debug ? options.debug : false;

            // Configure browser recognition settings.
            rec.lang = _options.lang;
            rec.continuous = _options.continuous;
            rec.interimResults = _options.interimResults;
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

            var returnVal;

            try {
                returnVal = innerFunctionAPI[method].apply(this, args);
            }
            catch (e) {
                _logger('error', 'You have been encounter api function exception => ', e);
            }

            return returnVal;
        }
    }
})(window);