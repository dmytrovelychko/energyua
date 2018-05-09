const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Text Model
 * =============
 */
const Text = new keystone.List('Text');

Text.add({
	partial: { type: String },
	placeholder: { type: Types.Key, required: true, default: 'nav-btn-1' },
	en: { type: String },
	ru: { type: String },
	ua: { type: String },
	chi: { type: String },
	createdAt: { type: Date, default: Date.now },
});

Text.defaultSort = '-createdAt';
Text.defaultColumns = 'partial, placeholder, en, ua, ru, chi, createdAt';
Text.register();
