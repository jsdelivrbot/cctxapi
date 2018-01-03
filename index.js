const ccxt = require ('ccxt/ccxt.js');
const express = require('express')
const path = require('path')
const app = express();
const config = require('./config.js');
const PORT = process.env.PORT || 5000

const exchanges = [
  'bitfinex',
  'livecoin'
]

const symbol = 'BTC/EUR'
const tickers = {}

const router = express.Router();

router.get('/ticker', function (req, res) {

  const securityKey = 'API_KEY';
  let apiKey = req.get(securityKey);
  if (!apiKey) {
    apiKey = req.query[securityKey];
  }
  if (apiKey != config[securityKey]) {
    res.status(401).end();
  }

  const btceurExchangeName = config.btceur.api;
  const btceurPair = config.btceur.pair;

  const btceurExchange = new ccxt[btceurExchangeName]({ enableRateLimit: true });
  Promise.resolve({})
    .then(response => {
      return btceurExchange.fetchTicker(symbol);
    })
    .then(response => response['last'])
    .then(btceur => {
      let promises = [];
      config.portfolio.map(port => {
        console.log('api: ', port.api);
        let promise = Promise
            .resolve({})
            .then(response => {
              const exchange = new ccxt[port.api]({ enableRateLimit: true });
              return exchange.fetchTicker(port.pair);
            })
            .then(response => {
              return {
                "title": port.title,
                "datetime": response['datetime'],
                "exchangeId": port.api,
                "quantity": port.q,
                "priceBtc": response['last'],
                "priceEur": response['last'] * btceur,
                "totalEur": response['last'] * btceur * port.q
              };
            });

        promises.push(promise);
      });
      return Promise
        .all(promises)
        .then(response => {
          let totalBtc = 0.0;
          let totalEur = 0.0;
          response.map(r => {
            totalBtc = totalBtc + (r['priceBtc'] * r['quantity']);
            totalEur = totalEur + (r['totalEur']);
          });

          response.map(r => {
            r['percentage'] = r['totalEur'] * 100 / totalEur;
          });

          // Hack
          // price Eur contains the totalEur
          // TotalEur contains the Gain over invested sum in Eur
          response.push({
            "title": "Grand Total",
            "datetime": Date.now(),
            "exchangeId": "---",
            "percentage": 100.0,
            "priceBtc": totalBtc,
            "priceEur": totalEur,
            "totalEur": totalEur - config.investment
          });
          return response;
        });
    })
    .then(response => res.json(response))
    .catch(error => {
      console.error(error);
      res.status(504).send(error).end();
    });

});

app
  .use(express.static(path.join(__dirname, 'public')))
  .use('/apis', router)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
