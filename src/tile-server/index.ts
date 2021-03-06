import { PostgresService } from './services/postgres.service';
import * as Koa from 'koa';
import * as Logger from 'koa-logger';
import * as Mount from 'koa-mount';
import * as Helmet from 'koa-helmet';
import * as Cors from '@koa/cors';
import * as Compress from 'koa-compress';
import * as Views from 'koa-views';

import mvtRouter from './routers/mvt.router';

export async function start(args, overrideConfig) {
  const app = new Koa();
  if (process.env.NODE_ENV !== 'pro') {
    app.use(Logger());
  }
  app.use(
    Views(__dirname + '/html', {
      map: {
        html: 'ejs',
      },
    }),
  );

  app.use(
    Mount('/map', async (ctx) => {
      const ids = await PostgresService.getAllDatasetIds();
      await ctx.render('index', { ids });
    }),
  );
  app.use(Cors());
  app.use(Helmet());
  app.use(
    Compress({
      threshold: 2048,
      flush: require('zlib').Z_SYNC_FLUSH,
    }),
  );

  app.use(mvtRouter.routes()).use(mvtRouter.allowedMethods());

  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Running mvt tile server in port ${process.env.PORT || 3000}`);
  });
  server.setTimeout(900000);
}
