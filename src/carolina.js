(function (root) {
    'use strict';

    // Callbacks constants.
    const EVENTS = {
        ON_START: 'onStart',
        ON_END: 'onEnd',
        ON_ERROR: 'onError',
        ON_LIVE_STREAM: 'onLiveStream',
        ON_CHUNK_STREAM: 'onChunkStream',
        ON_INTERIM_TRANSCRIPT: 'onInterimTranscript',
        ON_SOUND_START: 'onSoundStart',
        ON_NO_MATCH: 'onNoMatch',
        ON_SOUND_END: 'onSoundEnd',
        ON_SPEECH_START: 'onSpeechStart',
        ON_SPEECH_END: 'onSpeechEnd',
        ON_BAD_QUALITY: 'onBadQuality'
    }


    const METADATA = {
        VERSION: '1.0.0',
        LIB_NAME: 'CAROLINA'
    }


    const LOG_LEVEL = {
        NO_LOGS: 0,
        INFO_MODE: 1,
        DEBUG_MODE: 2,
        ULTRA_DEBUG_MODE: 3
    }


    const API_FUNCTIONS = [
        'start',
        'stop',
        'abort',
        'isListening',
        'doctor'
    ];


    const QUALITY = {
        GOOD: 1,
        BAD: 0
    }


    // API Event functions.
    const ON_RESULT = 'ON_RESULT';


    var lib;


    function Lib() {
        /**
        * Application Properties.
        *
        * @private
        */
        this.properties = {
            options: {},
            logLevel: 0,
            errorCount: 0,
            isListening: false,
            finalTranscript: '',
            lastTranscriptSentence: ''
        }
        this.methodNames = {
            initialize: 'initialize',
            run: 'run',
            setProp: 'setProp',
            getProp: 'getProp',
            invokeCallbacks: 'invokeCallbacks',
            optionsToString: 'optionsToString',
            doctor: 'doctor',
            isListening: 'isListening',
        }
        this.logger;
        this.factory = {};
    }


    Lib.CLASS = 'Lib';


    Lib.create = function () {
        return new Lib();
    }


    Lib.prototype.initialize = function (options) {
        var mergeOptions;

        // Set carolina configuration settings.
        mergeOptions = Object.assign({},
            this.getProp('options'),
            {
                lang: options.lang || 'en-US',
                logLevel: ('number' === typeof options.logLevel ? options.logLevel : LOG_LEVEL.INFO_MODE),
                quality: ('number' !== typeof options.quality ? options.quality : QUALITY.GOOD),
                continuous: options.continuous || false,
                interimResults: options.interimResults || false,
                maxAlternatives: options.maxAlternatives || 1,
                callbacks: options.callbacks // The most important property, this is the way we communicate with the host.
            });

        // Create logger for this class.
        this.logger = logger.create(Lib.CLASS, mergeOptions.logLevel);

        this.setProp('options', mergeOptions);

        return this;
    }


    Lib.prototype.run = function (cb) {
        var standalone = root.navigator.standalone,
            userAgent = root.navigator.userAgent.toLowerCase(),
            safari = /safari/.test(userAgent),
            ios = /iphone|ipod|ipad/.test(userAgent);

        if (ios) {
            //browser
            if (!standalone && safari) {
                this.logger.error('Apple not giving any way to use speech recognition via browser.');
                throw 'Cannot use library due to user platform device. (ios , browser)';
            } else if (standalone && !safari) {
                //standalone
            } else if (!standalone && !safari) {
                //uiwebview
                this.factory.functions = webviewVoiceRecognition.create(this.getProp('options'));
            };
        } else {
            //not iOS
            this.factory.functions = browserVoiceRecognition.create(this.getProp('options'));
        }

        cb.call(null, this.factory);
    }


    Lib.prototype.setProp = function (prop, value) {
        if ('undefiend' === typeof this.properties[prop]) {
            this.logger.error('You cannot set to not exist property a value.');
            return;
        }

        this.logger.silly('Setting new value for ' + prop + ' => ', value);

        this.properties[prop] = value;

        return this;
    }


    Lib.prototype.getProp = function (prop) {
        return this.properties[prop];
    }


    Lib.prototype.invokeCallbacks = function (cbName, ...args) {
        var cbs = this.getProp('options').callbacks;

        // Check if callbacks configured.
        if (!cbs) {
            this.logger.debug('There is no configured callbacks!');
            return;
        }

        // Check if the callback name exist is the callbacks object.
        if (!cbs[cbName]) {
            this.logger.debug('There is no callback configured for callback name => ', cbName);
            return;
        }

        cbs[cbName].apply(cbs.context, args);
    }


    Lib.prototype.optionsToString = function () {
        var str = '\n';

        var options = this.getProp('options');

        Object.keys(options).map(function (key, index, arr) {
            if (key === 'toString') {
                return;
            }

            str += key + ' => ' + options[key];

            if (index !== arr.length - 1) {
                str += '\n';
            }
        });

        return str;
    }


    Lib.prototype.doctor = function () {
        var doctorReport = 'Library ' + METADATA.LIB_NAME + ' v' + METADATA.VERSION
            +
            '\n'
            +
            `Log level is ${this.getProp('options').logLevel ? 'ON' : 'OFF'} `
            +
            '\n'
            +
            `Configuration details are: ${this.optionsToString()}`
            +
            '\n'
            +
            `Library health condition ${this.getProp('errorCount') > 3 ? 'POOR' : 'GOOD'}`
            +
            '\n'
            +
            `Quality of speaking ${this.getProp('options').quality === QUALITY.GOOD ? 'GOOD' : 'POOR'}`

        this.logger.info(doctorReport);
    }


    Lib.prototype.isListening = function () {
        return this.getProp('isListening');
    }


    /**
     * Carolina generic inner library logger.
     *
     * @param {*} fnClass
     * @param {*} logLevel
     */
    function logger(fnClass, logLevel) {
        this.methodNames = {
            debug: 'debug',
            info: 'info',
            error: 'error',
            warn: 'warn'
        }
        this.logLevel = logLevel;
        this.fnClass = fnClass;

        this.printLog = function (type, msg, args) {
            if ('undefined' === typeof this.logLevel || this.logLevel === LOG_LEVEL.NO_LOGS) {
                return;
            }

            if ('function' !== typeof console[type]) {
                console.error('Trying to you console log with unknown console type => ', type);
                return;
            }

            if (Array.isArray(args) && args.length > 0) {
                console[type](METADATA.LIB_NAME + '::' + this.fnClass + ':: ' + msg + ' => ', args);
                return;
            }

            console[type](METADATA.LIB_NAME + '::' + this.fnClass + ':: ' + msg);
        }
    }


    logger.CLASS = 'logger';


    logger.create = function (fnClass, logLevel) {
        return new logger(fnClass, logLevel);
    }


    logger.prototype.debug = function (msg, ...args) {
        if (this.logLevel < LOG_LEVEL.DEBUG_MODE) {
            return;
        }

        this.printLog(this.methodNames.debug, msg, args);
    }


    logger.prototype.info = function (msg, ...args) {
        if (this.logLevel < LOG_LEVEL.INFO_MODE) {
            return;
        }

        this.printLog(this.methodNames.info, msg, args);
    }


    logger.prototype.error = function (msg, ...args) {
        if (this.logLevel < LOG_LEVEL.INFO_MODE) {
            return;
        }

        this.printLog(this.methodNames.error, msg, args);
    }


    logger.prototype.warn = function (msg, ...args) {
        if (this.logLevel < LOG_LEVEL.INFO_MODE) {
            return;
        }

        this.printLog(this.methodNames.warn, msg, args);
    }

    logger.prototype.silly = function (msg, ...args) {
        if (this.logLevel < LOG_LEVEL.ULTRA_DEBUG_MODE) {
            return;
        }

        this.printLog(this.methodNames.debug, msg, args);
    }


    /**
     * Function invoke profiler for monitoring preformence.
     */
    function profilerHandler(method) {
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


    profilerHandler.prototype.create = function (method) {
        if (!properties.isDebug) {
            return {
                start: function () { },
                end: function () { }
            }
        }

        return new profilerHandler(method);
    }


    /**
     * Class for voice recognition that support by the browser.
     *
     * @class
     * @returns
     */
    function browserVoiceRecognition(config) {
        var _this = this;
        // Browser voice recognition instance.
        this.record;
        this.quality;
        this.logger;


        /**
         * 
         * @param {any} config 
         */
        function init(config) {
            this.logger = logger.create(browserVoiceRecognition.CLASS, lib.getProp('options').logLevel);

            // If the browser is not support kill this execution script as soon as possible.
            if (!speechRecognition(root)) {
                this.logger.error('Your browser is not support webkit speech recognition.');
                return null;
            }

            initVoiceRecognitionBrowser.call(this,
                {
                    lang: config.lang,
                    continuous: config.continuous,
                    interimResults: config.interimResults,
                    maxAlternatives: config.maxAlternatives,
                    quality: config.quality
                });
        }


        /**
         * Get the browser speech recognition instance.
         *
         * @function
         */
        function speechRecognition(rootWindow) {
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
        function initVoiceRecognitionBrowser(voiceRecCfg) {
            if (!!this.record) {
                this.logger.error('You cannot initialized the webkit speech recognition twice!, you should kill the current instance and initialized again.');
                return;
            }


            // Create browser speech recognition instance.
            this.record = new (speechRecognition(root))();


            // Configure browser recognition settings.
            this.record.lang = voiceRecCfg.lang;
            this.record.continuous = voiceRecCfg.continuous;
            this.record.interimResults = voiceRecCfg.interimResults;
            this.record.maxAlternatives = voiceRecCfg.maxAlternatives;


            // Set the quality of voice recognition result we send back to the user.
            this.quality = voiceRecCfg.quality;


            /**
            * User start speaking callback handler.
            */
            this.record.onstart = onStart.bind(this);


            /**
             * Getting live on result user speaking text.
             */
            this.record.onresult = onResult.bind(this);


            /**
             * Library enounter in error callback handler.
             */
            this.record.onerror = onError.bind(this);


            /**
             * User stop speaking callback handler.
             */
            this.record.onend = onEnd.bind(this);


            /**
             * Fired when the speech recognition service returns a final result with no significant recognition.
             * This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
             */
            this.record.onnomatch = onNoMatch.bind(this);


            /**
             * Fired when any sound — recognisable speech or not — has been detected.
             */
            this.record.onsoundstart = onSoundStart.bind(this);


            /**
             * Fired when any sound — recognisable speech or not — has stopped being detected.
             */
            this.record.onsoundend = onSoundEnd.bind(this);


            /**
             * Fired when sound that is recognised by the speech recognition service as speech has been detected.
             */
            this.record.onspeechstart = onSpeechStart.bind(this);


            /**
             * Fired when speech recognised by the speech recognition service has stopped being detected.
             */
            this.record.onspeechend = onSpeechEnd.bind(this);
        }


        /**
         * API Event function when we get notify by google about the voice recogniton text and confidence.
         *
         * @function
         * @param {*} event
         */
        function onResult(event) {
            var interimTranscript = '';

            var previousTranscript = lib.getProp('finalTranscript');

            // Set last transcript sentence before override it with a new sentence.
            lib.setProp('lastTranscriptSentence', previousTranscript);

            for (var i = event.resultIndex; i < event.results.length; ++i) {
                var chunkTranscript = event.results[i][0].transcript,
                    confidence = event.results[i][0].confidence;

                // This will pass only when the confidence is more than 50% accuraccy.
                if (this.quality !== Math.round(confidence)) {
                    this.logger.debug('The transcript we capture from speaking is not confidence enough due to your quality restrictions => ', chunkTranscript);
                    lib.invokeCallbacks(EVENTS.ON_BAD_QUALITY, chunkTranscript);
                    return;
                }

                if (event.results[i].isFinal) {
                    this.logger.debug('Recevied new chunk transcript from user speaking text value & confidence => ', chunkTranscript, confidence);
                    lib.invokeCallbacks(EVENTS.ON_CHUNK_STREAM, chunkTranscript);
                } else {
                    interimTranscript += chunkTranscript;
                    this.logger.debug('Interim transcript current speaking value => ', interimTranscript);
                    lib.invokeCallbacks(EVENTS.ON_INTERIM_TRANSCRIPT, interimTranscript);
                }
            }

            var currentTranscript = previousTranscript + chunkTranscript;

            this.logger.debug('Live stream of transcript => ', currentTranscript);

            lib
                .setProp('finalTranscript', currentTranscript)
                .invokeCallbacks(EVENTS.ON_LIVE_STREAM, currentTranscript);
        }


        /**
         * API Event function when the service is start listening.
         *
         * @function
         */
        function onStart() {
            lib.setProp('isListening', true);
            this.logger.debug('Start listening... ');
            lib.invokeCallbacks(EVENTS.ON_START);
        }


        /**
         * API Event function when the service got error.
         *
         * @function
         */
        function onError(event) {
            // Increase the library error counter this should represent the library condition health.
            lib
                .setProp('errorCount', lib.getProp('errorCount')++)
                .setProp('isListening', false);

            this.logger.error('An error been occured => ', event);

            lib.invokeCallbacks(EVENTS.ON_ERROR, event);
        }


        /**
         * API Event function when the service is end talking.
         *
         * @function
         */
        function onEnd(event) {
            lib
                .setProp('finalTranscript', '')
                .setProp('isListening', false);

            this.logger.info('Stop listening... ');

            lib.invokeCallbacks(EVENTS.ON_END, event);
        }


        /**
         * API Event function when the service start sound.
         *
         * @param {*} event
         */
        function onSoundStart(event) {
            this.logger.debug('Sound recognisable speech or not has been detected');
            lib.invokeCallbacks(EVENTS.ON_SOUND_START, event);
        }


        /**
         * API Event function when the service is not getting any match.
         *
         * @param {*} event
         */
        function onNoMatch(event) {
            this.logger.debug('Speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesnt meet or exceed the confidence threshold.');
            lib.invokeCallbacks(EVENTS.ON_NO_MATCH, event);
        }


        /**
         * API Event function when the service sound end.
         *
         * @param {*} event
         */
        function onSoundEnd(event) {
            this.logger.debug('Any sound recognisable speech or not has stopped being detected.');
            lib.invokeCallbacks(EVENTS.ON_SOUND_END, event);
        }


        /**
         * API Event function when the service speech start
         *
         * @param {*} event
         */
        function onSpeechStart(event) {
            this.logger.debug('A sound that is recognised by the speech recognition service as speech has been detected.');
            lib.invokeCallbacks(EVENTS.ON_SPEECH_START, event);
        }


        /**
         * API Event function when the service speech end.
         *
         * @param {*} event
         */
        function onSpeechEnd(event) {
            this.logger.debug('Speech recognised by the speech recognition service has stopped being detected.');
            lib.invokeCallbacks(EVENTS.ON_SPEECH_END, event);
        }

        init.call(_this, config);

        return {
            start: function () { _this.record.start() },
            abort: function () { _this.record.abort() },
            stop: function () { _this.record.stop() }
        }
    }


    browserVoiceRecognition.CLASS = 'browserVoiceRecognition';


    // Create the instance not via new.
    browserVoiceRecognition.create = function (config) {
        return new browserVoiceRecognition(config);
    }


    /**
     * Class for voice recognition that support webapp.
     * 
     * @class
     * @returns
     */
    function webviewVoiceRecognition() {
        var _this = this;
        // Cordova plugin for webapps voice recognition support.
        this.record;
        this.properties = {
            hasPermission: false,
            options: {}
        }


        /**
         * 
         * @param {any} webviewVoiceRecognitionCfg 
         */
        function init(webviewVoiceRecognitionCfg) {
            this.logger = logger.create(webviewVoiceRecognition.CLASS, lib.getProp('options').logLevel);

            // Check if the user added the speech recognition plugin as soon as possible.
            if (!root.plugins.speechRecognition) {
                this.logger.error('For ios and webapps you should have install the speechRecognition plugin.');
                return null;
            }

            this.record = root.plugins.speechRecognition;

            Object.assign({},
                lib.getProp.call(this, 'options'),
                {
                    lang: webviewVoiceRecognitionCfg.lang,
                    matches: webviewVoiceRecognitionCfg.maxAlternatives,
                });
        }


        /**
         * Check if the user has premission already.
         * 
         * @returns 
         */
        function hasPermission() {
            return new Promise(function (resolve, reject) {
                this.record.hasPermission(function (hasPremission) {
                    resolve(hasPremission);
                },
                    reject(lib.invokeCallbacks(EVENTS.ON_ERROR))
                );
            });
        }


        /**
         * Grant from the user the premission to use his device mic.
         * 
         * @returns 
         */
        function requestPermission() {
            return new Promise(function (resolve, reject) {
                this.record.requestPermission(
                    resolve(true),
                    function (args) {
                        reject(lib.invokeCallbacks(EVENTS.ON_ERROR));
                    })
            });
        }


        /**
         * 
         * @param {any} args 
         */
        function onResult(args) {
        }


        /**
         * 
         * @param {any} args 
         */
        function onEnd(args) {
            lib.invokeCallbacks(EVENTS.ON_END, args);
        }


        /**
         * 
         * @param {any} args 
         */
        function onError(args) {
            lib.invokeCallbacks(EVENTS.ON_ERROR, args);
        }


        init.call(_this, config);

        return {
            start: function () {
                if (!lib.getProp.call(_this, 'hasPermission')) {
                    hasPermission()
                        .then(function (hasPermission) {
                            if (!hasPermission) {
                                return requestPermission();
                            }

                            lib.setProp.call(_this, hasPermission);
                            lib.setProp('isListening', true);
                            _this.record.startListening(onResult.bind(_this), onError, lib.getProp.call(_this, 'options'));
                            return false; // We are artificail pass the grant permission step. very ugly for now.
                        })
                        .then(function (grantPermission) {
                            if (!grantPermission) {
                                return;
                            }

                            _this.record.startListening(onResult.bind(_this), onError, lib.getProp.call(_this, 'options'));
                        });

                    return;
                }

                _this.record.startListening(onResult.bind(_this), onError, lib.getProp.call(_this, 'options'));
            },
            abort: function () {
                lib.setProp('isListening', false);
                _this.record.stopListening(onEnd, onError);
            },
            stop: function () {
                lib.setProp('isListening', false);
                _this.record.stopListening(onEnd, onError);
            }
        }
    }


    webviewVoiceRecognition.CLASS = 'webviewVoiceRecognition';


    // Create the instance not via new.
    webviewVoiceRecognition.create = function (config) {
        return new webviewVoiceRecognition(config);
    }


    root.Carolina = {
        /**
         * Initialization function getting configuration from client and invoke the library.
         * You can read in our docs about the initialization parameters.
         *
         * @function
         */
        init: function (options) {
            lib = Lib.create();

            lib
                .initialize(options)
                .run(function (ptfactory) {
                    Object.keys(ptfactory.functions).map(function (fn) {
                        // Append the new factory functions into export global variable.
                        root.Carolina[fn] = ptfactory.functions[fn];
                    });

                    // Expose public api functions on the export global variable.
                    API_FUNCTIONS.map(function (fn) {
                        if ('function' === typeof root.Carolina[fn]) {
                            return;
                        }

                        root.Carolina[fn] = !!lib[fn] ? lib[fn].bind(lib) : undefined;
                    });
                });

            // Print all about the configuration and status of the library after initialize complete.
            lib.doctor();

            // After finish initialize carolina library we remove the ability to init again.
            delete root.Carolina.init;
        }
    }
})(window);