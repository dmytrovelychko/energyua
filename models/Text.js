const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Text Model
 * =============
 */
const Text = new keystone.List('Text');

Text.add({
	partial: { type: String },
	placeholder: { type: Types.Key, required: true, default: 'not set' },
	en: { type: Types.Textarea },
	ru: { type: Types.Textarea },
	ua: { type: Types.Textarea },
	chi: { type: Types.Textarea },
	createdAt: { type: Date, default: Date.now },
});

Text.defaultSort = '-createdAt';
Text.defaultColumns = 'partial, placeholder, en, ua, ru, chi, createdAt';
Text.register();
