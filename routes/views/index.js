var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	view.query('texts', keystone.list('Text').model.find().sort('sortOrder'));
	console.dir(view);

	// Render the view
	view.render('index');
};
