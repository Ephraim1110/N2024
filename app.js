const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path'); 
const app = express();
const { Servient } = require("@node-wot/core");
const { HttpClientFactory } = require("@node-wot/binding-http");
const servient = new Servient();
servient.addClientFactory(new HttpClientFactory(null));


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret', 
  resave: false,
  saveUninitialized: true
}));

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.redirect('/login');
  });

app.get('/login', (req, res) => {
  res.render('login'); 
});

app.post('/login', (req, res) => {
  const { codeSecret, name } = req.body;
  if (codeSecret === 'N+2024') {
    req.session.name = name;
    res.redirect('/dashboard');
  } else {
    res.send('Code secret ou nom incorrect');
  }
});

app.get('/dashboard', (req, res) => {
  const userName = req.session.name || 'Utilisateur';
  res.render('dashboard', { userName }); 
});

app.get('/Efficiency', (req, res) => {
    const userName = req.session.name || 'Utilisateur';
    res.render('Efficiency', { userName }); 
  });
app.get('/logout', (req, res) => {

    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la déconnexion :', err);
      } else {
        res.redirect('/login'); 
      }
    });
  });
  app.post('/updateTemperature', async (req, res) => {
    const { temperature, set, on } = req.body;
    const userName = req.session.name || 'Utilisateur';

    try {
        const WoT = await servient.start();
        const td = await WoT.requestThingDescription("http://10.164.0.62:6010/thermostat");
        const thing = await WoT.consume(td);
        const temperatureValue = parseFloat(temperature);
        const temperatureData = {
            value: temperatureValue,
            observedBy: userName
        };

        await thing.writeProperty("temperature", temperatureData);

        res.status(200).json({ success: true, message: 'Temperature Data udapted successfully' });
    } catch (error) {
       
        res.status(500).json({ success: false, message: 'Failed to update temperature data.' });
    }
});



app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
