#!/usr/bin/env nodejs

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();

// Require keystone
var keystone = require('keystone');
var handlebars = require('express-handlebars');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
	'name': 'energy.ua',
	'brand': 'energy.ua',
	'admin path': 'admin',

	'sass': 'public',
	'static': 'public',
	'favicon': 'public/img/favicon/favicon.ico',
	'views': 'templates/views',
	'view engine': '.hbs',

	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/views/partials',
		defaultLayout: 'default',
		// eslint-disable-next-line no-new-require
		helpers: new require('./templates/views/helpers')(),
		extname: '.hbs',
	}).engine,

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',

	// only for dev as mongodb inside docker
	// 'mongo': 'mongodb://root:example@localhost:27017/energy-ua',
});

// Load your project's Models
keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set('routes', require('./routes'));


// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	galleries: 'galleries',
	texts: 'texts',
	users: 'users',
});

// Start Keystone to connect to your database and initialise the web server
keystone.start();
