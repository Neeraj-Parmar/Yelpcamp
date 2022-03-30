if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const ExpressError = require('./utilities/ExpressError');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database Connected');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'idonthaveasecret';
const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret
	}
});
store.on('error', function(e) {
	console.log('Session store error', e);
});

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com',
	'https://api.tiles.mapbox.com',
	'https://api.mapbox.com',
	'https://kit.fontawesome.com',
	'https://cdnjs.cloudflare.com',
	'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com',
	'https://stackpath.bootstrapcdn.com',
	'https://api.mapbox.com',
	'https://api.tiles.mapbox.com',
	'https://fonts.googleapis.com',
	'https://use.fontawesome.com'
];
const connectSrcUrls = [ 'https://api.mapbox.com', 'https://*.tiles.mapbox.com', 'https://events.mapbox.com' ];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: [ "'self'", ...connectSrcUrls ],
			scriptSrc: [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
			styleSrc: [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
			workerSrc: [ "'self'", 'blob:' ],
			childSrc: [ 'blob:' ],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
				'https://images.unsplash.com'
			],
			fontSrc: [ "'self'", ...fontSrcUrls ]
		}
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	if (![ '/login', '/', '/register' ].includes(req.originalUrl)) {
		req.session.goto = req.originalUrl;
	}
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.currentUser = req.user;
	next();
});

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page not found!', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Something went wrong!';
	res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Listening to port: ${port}!`);
});
