const Koa = require('koa');
const Router = require('koa-tree-router');
const Auth = require('koa-basic-auth');
const Static = require('koa-static');
const Flag = require('./flag');

const app = new Koa();
const router = new Router();

const credentials = { name: 'Jerry', pass: 'ThisIsMySuperSecurePassword1!' };
const timeout = 1000;

// Throtteling each login request is a terrible
// way to rate limit.
const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status == 401) {
      await sleep(timeout);
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.body = 'Error: Invalid Credentials.';
    } else {
      ctx.status = 400;
      ctx.body = `Uh-oh: ${err.message}`;
      console.log('Error handler:', err.message);
    }
  }
});

app.use(Static(`${__dirname}/static`));

router.get('/portal', Auth(credentials), async ctx => {
  await sleep(timeout);
  ctx.body = Flag;
});

app.use(router.routes());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
