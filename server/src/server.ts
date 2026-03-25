import express, { NextFunction, Request, Response } from 'express';
import path from 'path';

////////////////////////////// Setup ///////////////////////////////////////////

const HOST_NAME = 'splines.portal';
const FRONTEND_FOLDER = path.join(__dirname, '../', 'public');

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.hostname !== HOST_NAME && req.hostname !== '192.168.4.1' && req.hostname !==  'localhost') {
        return res.redirect(`http://${HOST_NAME}`);
     }
     next();
});

// Call this AFTER app.use where we do the redirects
app.use(express.static(FRONTEND_FOLDER));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/////////////////////////////// Endpoints //////////////////////////////////////

// Serve frontend
app.get('/', (req, res, next) => {
    res.sendFile(path.join(FRONTEND_FOLDER, 'index.html'));
});

app.post('/submit', async (req: Request, res: Response) => {
    try {
        const params = new URLSearchParams();
        params.set('email', req.body.email || '');
        params.set('message', req.body.message || '');

        const backendRes = await fetch('http://127.0.0.1:3001/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const text = await backendRes.text();

        res.status(backendRes.status).send(text);
    } catch (err) {
        console.error('Proxy submit error:', err);
        res.status(500).send('Could not submit message');
    }
});


///////////////////////////// Server listening /////////////////////////////////

// Listen for requests
// If you change the port here, you have to adjust the ip tables as well
// see file: access-point/setup-access-point.sh
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Node version: ${process.version}`);
    console.log(`⚡ Raspberry Pi Server listening on port ${PORT}`);
});

