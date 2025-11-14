import { Logger } from '@nestjs/common';

const logger = new Logger();
export default function getLogger(): Logger {
  return logger;
}