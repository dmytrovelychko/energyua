var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Text Model
 * =============
 */

var Text = new keystone.List('Text');

Text.add({
	name: { type: Types.Key, required: true },
	en: { type: String },
	ru: { type: String },
	ua: { type: String },
	chi: { type: String },
	createdAt: { type: Date, default: Date.now },
});

Text.defaultSort = '-createdAt';
Text.defaultColumns = 'name, en, ru, ua, chi, createdAt';
Text.register();
