import util from 'util';
import winston from 'winston';
import * as ansiColors from 'ansi-colors';

const logColors = {
  levels: {
    error: ansiColors.red,
    warn: ansiColors.yellow,
  },
  elements: {
    timestamp: ansiColors.gray,
  },
};

const winstonFormatLog = winston.format.printf(info => {
  // Format the message.
  let message = '';
  if (info.message instanceof Error) {
    // If an error was passed in as the message, just output the stack.
    message = info.message.stack;
  } else {
    message += info.message;

    if (info.metadata.data !== undefined) {
      // If a data object was passed in as a second argument, pretty print it after the message.
      const formattedData = util.inspect(info.metadata.data, {
        showHidden: false,
        colors: true,
        compact: false,
        depth: 10,
        ...info.metadata.inspectOptions,
      });
      message += `\n${formattedData}`;
    }
  }

  // Colorize log elements.
  const levelColor = logColors.levels[info.level];
  if(levelColor) {
    message = levelColor(message);
  }

  const timestamp = logColors.elements.timestamp(info.timestamp);

  // Output formatted log.
  return `[${timestamp}] ${message}`;
});

const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    test: 2,
    info: 3,
    verbose: 4,
    debug: 5,
  },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    winston.format.splat(),
    winstonFormatLog,
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug',
    }),
  ],
});

export const Log = {
  // Inspect Options: (https://nodejs.org/api/util.html#util_util_inspect_object_showhidden_depth_colors)

  error(message, data, inspectOptions) {
    logger.error(message, { data, inspectOptions });
  },

  warn(message, data, inspectOptions) {
    logger.warn(message, { data, inspectOptions });
  },

  info(message, data, inspectOptions) {
    logger.info(message, { data, inspectOptions });
  },

  verbose(message, data, inspectOptions) {
    logger.verbose(message, { data, inspectOptions });
  },

  debug(message, data, inspectOptions) {
    logger.debug(message, { data, inspectOptions });
  },
};
