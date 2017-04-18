(function (root) {
    'use strict';

    /**
    * Application Properties.
    */
    var properties = {
        ran: false,


        options: {
            toString: function () {
                var str = '\n';

                Object.keys(this).map((function (key, index, arr) {
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


        isDebug: false,


        errorCount: 0,


        isListening: false,


        finalTranscript: '',


        lastTranscriptSentence: '',


        version: '1.0.0'
    }


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
        ON_SPEECH_END = 'onSpeechEnd',
        ON_BAD_QUALITY = 'onBadQuality';


    // API Event functions.
    const ON_RESULT = 'ON_RESULT';


    /**
     * Checking if the library is already been `ran` it mean initialized by the user.
     *
     * @function
     * @private
     */
    function isRan() {
        if (!properties.ran) {
            logger('error', 'You must initailzied carolina.js `carolina.init(options)`.');
            return false;
        }

        return true;
    }


    /**
     * Global setter for premitive properties.
     *
     * @function
     * @param {*} finalTranscript
     */
    function set(prop, value) {
        if ('undefiend' === typeof properties[prop]) {
            logger('error', 'You cannot set to not exist property a value.');
            return;
        }

        logger('debug', 'Setting new value for ' + prop + ' => ', value);
        properties[prop] = value;

        return this;
    }


    /**
     * Carolina generic inner library logger.
     *
     * @param {*} type
     * @param {*} msg
     * @param {*} args
     */
    function logger(type, msg, ...args) {
        if ('function' !== typeof console[type]) {
            console.error('Trying to you console log with unknown console type => ', type);
            return;
        }

        // If the user not set the configuration to be at debug mode we will not print debug logs.
        if (type === 'debug' && !properties.isDebug) {
            return;
        }

        if (Array.isArray(args) && args.length > 0) {
            console[type]('CAROLINA::' + msg, args);
            return;
        }

        console[type]('CAROLINA::' + msg);
    }


    /**
     * Callback to user handler.
     *
     * @function
     * @param {*} cbName
     * @param {*} args
     */
    function invokeCallbacks(cbName, ...args) {
        var cbs = properties.options.callbacks;

        // Check if callbacks configured.
        if (!cbs) {
            logger('debug', 'There is no configured callbacks!');
            return;
        }

        // Check if the callback name exist is the callbacks object.
        if (!cbs[cbName]) {
            logger('debug', 'There is no callback configured for callback name => ', cbName);
            return;
        }

        cbs[cbName].apply(cbs.context, args);
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

                logger('debug', `${method} took ${duration} ms to execute`);
            }
        }
    }


    /**
     * Class for voice recognition that support by the browser.
     *
     * @class
     * @returns
     */
    function browserWebkitSupportVoiceRecognition() {
        // Browser voice recognition instance.
        var rec = null;


        // If the browser is not support kill this execution script as soon as possible.
        if (!browserSpeechRecognition(root)) {
            logger('error', 'Your browser is not support webkit speech recognition!.');
            return null;
        }


        /**
         * 
         * @param {any} browserVoiceRecognitionCfg 
         */
        function init(browserVoiceRecognitionCfg) {
            initializedVoiceRecognitionWebkit({
                lang: browserVoiceRecognitionCfg.lang,
                continuous: browserVoiceRecognitionCfg.continuous,
                interimResults: browserVoiceRecognitionCfg.interimResults,
                maxAlternatives: browserVoiceRecognitionCfg.maxAlternatives
            });
        }


        /**
         * Get the browser speech recognition instance.
         *
         * @function
         */
        function browserSpeechRecognition(rootWindow) {
            return rootWindow.SpeechRecognition ||
                rootWindow.webkitSpeechRecognition ||
                rootWindow.mozSpeechRecognition ||
                rootWindow.msSpeechRecognition ||
                rootWindow.oSpeechRecognition
        }


        /**
         * Initialize the voice webkit chrome instance and configure it.
         *
         * @function
         * @param {any} voiceRecCfg
         */
        function initializedVoiceRecognitionWebkit(voiceRecCfg) {
            if (!!rec) {
                logger('error', 'You cannot initialized the webkit speech recognition twice!, you should kill the current instance and initialized again.');
                return;
            }

            // Create browser speech recognition instance.
            rec = new (browserSpeechRecognition(root))();

            // Configure browser recognition settings.
            rec.lang = voiceRecCfg.lang;
            rec.continuous = voiceRecCfg.continuous;
            rec.interimResults = voiceRecCfg.interimResults;
            rec.maxAlternatives = voiceRecCfg.maxAlternatives;


            /**
            * User start speaking callback handler.
            */
            rec.onstart = onStart;


            /**
             * Getting live on result user speaking text.
             */
            rec.onresult = onResult;


            /**
             * Library enounter in error callback handler.
             */
            rec.onerror = onError;


            /**
             * User stop speaking callback handler.
             */
            rec.onend = onEnd;


            /**
             * Fired when the speech recognition service returns a final result with no significant recognition.
             * This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
             */
            rec.onnomatch = onNoMatch;


            /**
             * Fired when any sound — recognisable speech or not — has been detected.
             */
            rec.onsoundstart = onSoundStart;


            /**
             * Fired when any sound — recognisable speech or not — has stopped being detected.
             */
            rec.onsoundend = onSoundEnd;


            /**
             * Fired when sound that is recognised by the speech recognition service as speech has been detected.
             */
            rec.onspeechstart = onSpeechStart;


            /**
             * Fired when speech recognised by the speech recognition service has stopped being detected.
             */
            rec.onspeechend = onSpeechEnd;
        }


        /**
         * API Event function when we get notify by google about the voice recogniton text and confidence.
         *
         * @function
         * @param {*} event
         */
        function onResult(event) {
            var interimTranscript = '',
                profiler = new _profiler(ON_RESULT);

            // Start profling and monitoring function execution.
            profiler.start();

            // Set last transcript sentence before override it with a new sentence.
            set('lastTranscriptSentence', properties.finalTranscript);

            for (var i = event.resultIndex; i < event.results.length; ++i) {
                var chunkTranscript = event.results[i][0].transcript,
                    confidence = event.results[i][0].confidence;

                // This will pass only when the confidence is more than 50% accuraccy.
                if (properties.options.quality !== Math.round(confidence)) {
                    logger('debug', 'The transcript we capture from speaking is not confidence enough due to your quality restrictions => ', chunkTranscript);
                    invokeCallbacks(ON_BAD_QUALITY, chunkTranscript);
                    return;
                }

                if (event.results[i].isFinal) {
                    logger('debug', 'Recevied new chunk transcript from user speaking text value & confidence => ', chunkTranscript, confidence);
                    invokeCallbacks(ON_CHUNK_STREAM, chunkTranscript);
                } else {
                    interimTranscript += chunkTranscript;
                    logger('debug', 'Interim transcript current speaking value => ', interimTranscript);
                    invokeCallbacks(ON_INTERIM_TRANSCRIPT, interimTranscript);
                }
            }

            set('finalTranscript', properties.finalTranscript + chunkTranscript);
            logger('debug', 'Live stream of transcript => ', properties.finalTranscript);
            invokeCallbacks(ON_LIVE_STREAM, properties.finalTranscript);

            // End profling and monitoring function execution.
            profiler.end();
        }


        /**
         * API Event function when the service is start listening.
         *
         * @function
         */
        function onStart() {
            set('isListening', true);
            logger('debug', 'Start listening... ');
            invokeCallbacks(ON_START);
        }


        /**
         * API Event function when the service got error.
         *
         * @function
         */
        function onError(event) {
            // Increase the library error counter this should represent the library condition health.
            set('errorCount', properties.errorCount++);
            set('isListening', false);
            logger('error', 'An error been occured => ', event);
            invokeCallbacks(ON_ERROR, event);
        }


        /**
         * API Event function when the service is end talking.
         *
         * @function
         */
        function onEnd(event) {
            set('isListening', false);
            // Clean final transcript.
            set('finalTranscript', '');
            logger('info', 'Stop listening... ');
            invokeCallbacks(ON_END, event);
        }


        /**
         * API Event function when the service start sound.
         *
         * @param {*} event
         */
        function onSoundStart(event) {
            logger('debug', 'Sound recognisable speech or not has been detected');
            invokeCallbacks(ON_SOUND_START, event);
        }


        /**
         * API Event function when the service is not getting any match.
         *
         * @param {*} event
         */
        function onNoMatch(event) {
            logger('debug', 'Speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesnt meet or exceed the confidence threshold.');
            invokeCallbacks(ON_NO_MATCH, event);
        }


        /**
         * API Event function when the service sound end.
         *
         * @param {*} event
         */
        function onSoundEnd(event) {
            logger('debug', 'Any sound recognisable speech or not has stopped being detected.');
            invokeCallbacks(ON_SOUND_END, event);
        }


        /**
         * API Event function when the service speech start
         *
         * @param {*} event
         */
        function onSpeechStart(event) {
            logger('debug', 'A sound that is recognised by the speech recognition service as speech has been detected.');
            invokeCallbacks(ON_SPEECH_START, event);
        }


        /**
         * API Event function when the service speech end.
         *
         * @param {*} event
         */
        function onSpeechEnd(event) {
            logger('debug', 'Speech recognised by the speech recognition service has stopped being detected.');
            invokeCallbacks(ON_SPEECH_END, event);
        }

        return {
            init: init,
            start: function () { rec.start() },
            abort: function () { rec.abort() },
            stop: function () { rec.stop() }
        }
    }


    // Create the instance not via new.
    browserWebkitSupportVoiceRecognition.prototype.create = function () {
        return new browserWebkitSupportVoiceRecognition();
    }


    /**
     * Class for voice recognition that support webapp.
     * 
     * @class
     * @returns
     */
    function webviewSupportVoiceRecognition() {
        // Cordova plugin for webapps voice recognition support.
        var rec = root.plugins.speechRecognition,
            options = {};

        // Check if the user added the speech recognition plugin as soon as possible.
        if (!rec) {
            logger('error', 'For ios and webapps you should have install the speechRecognition plugin.');
            return null;
        }

        /**
         * 
         * @param {any} webviewVoiceRecognitionCfg 
         */
        function init(webviewVoiceRecognitionCfg) {
            options.lang = webviewVoiceRecognitionCfg.lang;
        }

        return {
            init: init,
            start: function () {
                rec.startListening(
                    function (args) {
                        invokeCallbacks(ON_RESULT, args)
                    }
                    , function (args) {
                        invokeCallbacks(ON_ERROR, args)
                    });
            },
            abort: function () {
                rec.stopListening(
                    function (args) {
                        invokeCallbacks(ON_END, args)
                    }
                    , function (args) {
                        invokeCallbacks(ON_ERROR, args)
                    });
            },
            stop: function () {
                rec.stopListening(
                    function (args) {
                        invokeCallbacks(ON_END, args)
                    }
                    , function (args) {
                        invokeCallbacks(ON_ERROR, args)
                    });
            }
        }
    }


    // Create the instance not via new.
    webviewSupportVoiceRecognition.prototype.create = function () {
        return new webviewSupportVoiceRecognition();
    }


    /**
     * 
     * @returns 
     */
    function platformFactory() {
        var standalone = root.navigator.standalone,
            userAgent = root.navigator.userAgent.toLowerCase(),
            safari = /safari/.test(userAgent),
            ios = /iphone|ipod|ipad/.test(userAgent),
            factoryVoiceRec = null;

        if (ios) {
            //browser
            if (!standalone && safari) {
                logger('error', 'Apple not giving any way to use speech recognition via browser.');
                return null;
            } else if (standalone && !safari) {
                //standalone
            } else if (!standalone && !safari) {
                //uiwebview
                factoryVoiceRec = webviewSupportVoiceRecognition.prototype.create();
            };
        } else {
            //not iOS
            factoryVoiceRec = browserWebkitSupportVoiceRecognition.prototype.create();
        }

        return {
            factory: factoryVoiceRec,
            env: {
                userAgent: userAgent,
                ios: ios,
                safari: safari
            }
        };
    }

    // Create instance for the best platform.
    var applicationDomain = platformFactory();

    // If we could not initiate any voice recognition instance we return null.
    if (null === applicationDomain.factory) {
        logger('error', 'We could not generate factory instance to your device environment.');
        return null;
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
        start: applicationDomain.factory.start,


        /**
         * @function
         */
        abort: applicationDomain.factory.abort,


        /**
         * @function
         */
        stop: applicationDomain.factory.stop,


        /**
         * This function cleaning the stream.
         *
         * @function
         */
        clearStream: function () {
            set('finalTranscript', '');
        },


        /**
         * Get the last sentence of transcript user speaking.
         *
         * @function
         */
        lastSentence: function () {
            return properties.lastTranscriptSentence;
        },


        /**
         * Print to the user about the library current state, health and configuration.
         *
         * @function
         */
        doctor: function () {
            var doctorReport = 'Voice recognition status ver: ' + properties.version
                +
                '\n'
                +
                `debug mode is ${properties.isDebug ? 'ON' : 'OFF'} `
                +
                '\n'
                +
                `configuration details are: ${properties.options.toString()}`
                +
                '\n'
                +
                `library health condition ${properties.errorCount > 3 ? 'POOR' : 'GOOD'}`
                +
                '\n'
                +
                `quality of speaking ${properties.options.quality === 1 ? 'GOOD' : 'POOR'}`

            logger('info', doctorReport);
        },


        /**
         * Show if the current library is in listening state or not.
         *
         * @function
         * @returns {boolean}
         */
        isListening: function () {
            return properties.isListening;
        }
    }

    root.Carolina = {

        /**
         * Initialization function getting configuration from client and invoke the library.
         * You can read in our docs about the initialization parameters.
         *
         * @function
         */
        init: function (options) {
            if (properties.ran) {
                logger('error', 'You can init only once');
                return;
            }

            // Lock the init function for more initialization, this init function should run only once.
            properties.ran = true;

            // Set carolina configuration settings.
            properties.options = Object.assign({},
                properties.options,
                {
                    lang: options.lang || 'en-US',
                    debug: options.debug || false,
                    quality: options.quality || 1,
                    continuous: options.continuous || false,
                    interimResults: options.interimResults || false,
                    maxAlternatives: options.maxAlternatives || 1,
                    callbacks: options.callbacks // The most important property, this is the way we communicate with the host.
                });

            // Set debug mode indicator from configuration settings.
            properties.isDebug = 'boolean' === typeof options.debug ? options.debug : false;

            // Initialize voice recognition by factory instance.
            applicationDomain.factory.init(properties.options);
        },


        /**
         * Facade bridge to inner carolina api functions.
         *
         * @function
         */
        fn: function (method, ...args) {
            var profiler = new _profiler(method);

            // Start profling and monitoring function execution.
            profiler.start();

            if (!isRan()) {
                return;
            }

            if ('function' !== typeof innerFunctionAPI[method]) {
                logger('error', 'You try to invoke invalid method => ', method);
                return;
            }

            logger('debug', 'Starting to run the method ' + method + ' with args => ', args);

            var returnVal;

            try {
                returnVal = innerFunctionAPI[method].apply(this, args);
            }
            catch (e) {
                logger('error', 'You have been encounter api function exception => ', e);
            }

            // End profling and monitoring function execution.
            profiler.end();

            return returnVal;
        }
    }
})(window);