import express, { Request, Response, Application } from 'express';
import { generateId } from '../util/util';
import * as bodyParser from "body-parser";
import NodeCache from 'node-cache';
import { join } from 'path';

const db = new NodeCache({ stdTTL: 0 });
const app: Application = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use('/', express.static(join(__dirname, 'greeting')))

app.get('/:id', (req: Request, res: Response) => {
  const id: string = req.params.id;
  const found: string = <string>db.get(id);
  if (found) {
    console.info(`redirecting to ${found}`);
    res.redirect(found);
  } else {
    console.log('not valid from /id: ', id);
    res.end('Not a valid tsiny URL');
  }
});

app.post('/shorten', (req: Request, res: Response) => {
  const url: string = req.body.url;
  const uid: string = generateId();
  db.set(uid, url);
  console.log('from /shorten: ', uid);
  res.json({ short_url: `${process.env.APP_URL}/${uid}` });
});

app.post('/resolve', (req: Request, res: Response) => {
  const id: string = req.body.id;
  const found: string = <string>db.get(id);
  if (found) {
    console.info(`resolved ${id} to ${found}`);
    res.json({ url: found });
  } else {
    res.status(404).json({ error: 'No such URL' });
  }
});

app.listen(port || 3000, function () {
  console.log('App is running on port 3000!');
});
