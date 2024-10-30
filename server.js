const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');

const app = express();

// Configurar PayPal con las credenciales de la cuenta
paypal.configure({
  mode: 'sandbox', // Cambiar a 'live' para producción
  client_id: 'Aa1NYydfjFu0sNKhPd4lWMfbTw8trSidOBCht_00l0Xh5qYNEMbirdLjqVSRLhNdW3Pdm7ZtUYPTblu9',
  client_secret: 'EAUmFMEzuQitnjfUhpL_20GGEB2EkWm8pCrgkv5IDyyxWGrWjedhNlEmT_mBhiAkWK6gQx0nJQMoZ7Ud'
});

// Middleware para analizar el cuerpo de la solicitud
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta para crear el pago
app.post('/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: 'http://192.168.83.129:3000/success', //IP del servidor:3000
      cancel_url: 'http://192.168.83.129:3000/cancel' //IP del servidor:3000
    },
    transactions: [{
      item_list: {
        items: [{
          name: 'Tarjeta de regalo App Store & iTunes',
          sku: '001',
          price: '100.00',  // Precio a 100 MXN
          currency: 'MXN',
          quantity: 1
        }]
      },
      amount: {
        currency: 'MXN',
        total: '100.00'  // Total 100 MXN
      },
      description: 'Compra de Tarjeta de regalo App Store & iTunes.'
    }]
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error al crear el pago');
    } else {
      for (let link of payment.links) {
        if (link.rel === 'approval_url') {
          res.redirect(link.href);
        }
      }
    }
  });
});

// Ruta para manejar el éxito del pago
app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [{
      amount: {
        currency: 'MXN',
        total: '100.00'  // Total actualizado a 100 MXN
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error al ejecutar el pago');
    } else {
      res.send('Pago realizado con éxito');
    }
  });
});

// Ruta para manejar la cancelación del pago
app.get('/cancel', (req, res) => {
  res.send('Pago cancelado');
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor ejecutándose en http://localhost:3000');
});

