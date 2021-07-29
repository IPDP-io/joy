const { binance, coinos, hasura } = require('./api');
const { mint } = require('./wallet');
const ticketPrice = 20;

const getTicket = async () => {
	let query = `query {
    nfts_aggregate {
      aggregate {
        max {
          ticket
        } 
      } 
    }
  }`;

	let {
		data: {
			nfts_aggregate: {
				aggregate: {
					max: { ticket }
				}
			}
		}
	} = await hasura.post({ query }).json();

	return ticket;
};

app.get('/ticket', async (req, res) => {
	try {
		res.send(await getTicket());
	} catch (e) {
		console.log(e);
		res.send(false);
	}
});

app.post('/boom', async (req, res) => {
	let { amount: value, confirmed, text } = req.body;

	if (!subscribers[text]) return res.code(500).send({ message: 'no subscribers' });

	let { amount, address, pubkey } = invoices[text];

	let ticket = await getTicket();
  console.log("ticket", ticket);

	if (confirmed && value >= amount) {
		let domain = 'silhouettesthemovie.com';
		let res = await coinos
			.url('/assets')
			.post({
				address,
				pubkey,
				domain,
				filename: 'QmSmQduTPXamJBQLTxVs2nZAkVYdRWk7K1gqtQyqsBmNo8',
				name: 'Silhouettes Ticket Stub',
				asset_amount: 1,
				precision: 0,
				ticker: 'T' + ticket
			})
			.json();

		if (ticket < 1000) {
			await coinos.url('/assets').post({
				address,
				pubkey,
				domain,
				filename: 'QmSmQduTPXamJBQLTxVs2nZAkVYdRWk7K1gqtQyqsBmNo8',
				name: 'Silhouettes Poster',
				asset_amount: 1,
				precision: 0,
				ticker: 'P' + ticket
			});
		}

		if (ticket < 100) {
			/* TBD
			await coinos.url('/assets').post({
				address,
				pubkey,
				domain,
				filename: 'QmSmQduTPXamJBQLTxVs2nZAkVYdRWk7K1gqtQyqsBmNo8',
				name: 'Silhouettes Poster',
				asset_amount: 1,
				precision: 0,
				ticker: 'P' + ticket
			});
      */
		}
	}
	subscribers[text].send(JSON.stringify({ type: 'payment', value }));

	res.send(req.body);
});

let getAmount = async () => {
	let { price } = await binance.query({ symbol: 'BTCUSDT' }).get().json().catch(console.log);
	return (ticketPrice / price).toFixed(8);
};

app.post('/BTC', async (req, res) => {
	let { address, pubkey } = req.body;
	let network = 'bitcoin';
	let amount = await getAmount();
	let { address: text } = await coinos
		.url('/address')
		.query({ network, type: 'bech32' })
		.get()
		.json();
	invoices[text] = { address, pubkey, amount };

	let invoice = {
		address: text,
		network,
		text,
		amount,
		webhook: 'http://172.17.0.1:8091/boom'
	};

	await coinos.url('/invoice').post({ invoice }).json();

	return { address: text, amount };
});

app.post('/LBTC', async (req, res) => {
	let { address, pubkey } = req.body;
	let network = 'liquid';
	let amount = await getAmount();
	let { address: text, confidentialAddress } = await coinos
		.url('/address')
		.query({ network })
		.get()
		.json();
	invoices[text] = { address, amount, pubkey };

	await coinos
		.url('/invoice')
		.post({
			invoice: {
				address: confidentialAddress,
				unconfidential: address,
				network,
				text,
				amount,
				webhook: 'http://172.17.0.1:8091/boom'
			}
		})
		.json();

	return { address: text, amount };
});

app.post('/LNBTC', async (req, res) => {
	let { address, pubkey } = req.body;
	let network = 'lightning';
	let amount = await getAmount();
	let text = await coinos.url('/lightning/invoice').post({ amount }).text().catch(console.log);
	invoices[text] = { address, amount, pubkey };

	await coinos
		.url('/invoice')
		.post({
			invoice: {
				network,
				text,
				amount,
				webhook: 'http://172.17.0.1:8091/boom'
			}
		})
		.json();

	return { address: text, amount };
});