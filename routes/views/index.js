const keystone = require('keystone');

const LANGUAGE_CODES = ['ua', 'en', 'chi', 'de'];


const restructureTexts = (docs, lang) => {
	let collector = {};

	docs.forEach((doc) => {
		if (!collector.hasOwnProperty(doc.partial)) {
			collector[doc.partial] = {};
		}
		collector[doc.partial][doc.placeholder || 'unknown'] = doc[lang] || 'text';
	});
	return collector;
};

exports = module.exports = async function (req, res) {
	let lang = req.query && req.query.lang;
	if (!LANGUAGE_CODES.includes(lang)) {
		lang = 'ua';
	}
	console.dir(lang);
	const view = new keystone.View(req, res);
	const locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	const docs = await keystone.list('Text').model.find().sort('sortOrder').exec();
	let viewData = restructureTexts(docs, lang);
	// console.dir(viewData);

	// Render the view
	view.render('index', viewData);
};
