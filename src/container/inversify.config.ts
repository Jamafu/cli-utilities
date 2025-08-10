import 'reflect-metadata';

import { Container } from 'inversify';

export const container = new Container({
  autobind: true,
  defaultScope: 'Singleton',
});
