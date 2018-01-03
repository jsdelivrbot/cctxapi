const ccxt = require ('ccxt/ccxt.js');
const express = require('express')
const path = require('path')
const app = express();
const PORT = process.env.PORT || 5000

const exchanges = [
  'bitfinex',
  'livecoin'
]

const symbol = 'BTC/EUR'
const tickers = {}

const router = express.Router();

router.get('/ticker', function (req, res) {

  Promise.resolve('Hello World').then(response => res.send(response));

  /*
  new Promise((resolve, reject) => {
    exchange.fetchTicker(symbol)
    resolve({
      "datetime": ticker['datetime'],
      "exchangeId": exchangeId,
      "price": ticker['last']
    });
  }).then(response => res.send(response));
  */

/*
  await Promise.all (exchanges.map (exchangeId =>

      new Promise (async (resolve, reject) => {

          const exchange = new ccxt[exchangeId] ({ enableRateLimit: true })

          //while (true) {

              const ticker = await exchange.fetchTicker (symbol)
              tickers[exchangeId] = ticker;

              Object.keys (tickers).map (exchangeId => {
                  const ticker = tickers[exchangeId]
                  //console.log (ticker['datetime'], exchangeId, ticker['last']);
                  resolve({
                    "datetime": ticker['datetime'],
                    "exchangeId": exchangeId,
                    "price": ticker['last']
                  })
              })
          //}

      })

  )).then(response => res.send(response))
*/

});

app
  .use(express.static(path.join(__dirname, 'public')))
  .use('/apis', router)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))