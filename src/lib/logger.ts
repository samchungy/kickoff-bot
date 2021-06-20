import pino, {PinoLambdaLogger} from 'pino-lambda';

const logger: PinoLambdaLogger = pino({
	level: process.env.LOG_LEVEL || '',
	...(process.env.ENV === 'local' && {
		prettyPrint: {colorize: true, translateTime: 'SYS:'},
	}),
});

export {
	logger,
	PinoLambdaLogger as Logger,
};
