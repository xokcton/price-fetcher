import winston from 'winston';

winston.addColors({
  info: 'bold green',
  warn: 'bold yellow',
  error: 'bold red',
  debug: 'bold blue',
});

const formatting = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  }),
);

export const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        formatting,
        winston.format.colorize({
          all: true,
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      format: formatting,
    }),
  ],
});
