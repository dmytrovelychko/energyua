var moment = require('moment');
var _ = require('lodash');
var hbs = require('handlebars');
var keystone = require('keystone');
var cloudinary = require('cloudinary');

// Collection of templates to interpolate
var linkTemplate = _.template('<a href="<%= url %>"><%= text %></a>');
var scriptTemplate = _.template('<script src="<%= src %>"></script>');
var cssLinkTemplate = _.template('<link href="<%= href %>" rel="stylesheet">');

module.exports = function () {

	var _helpers = {};

	/**
	 * Generic HBS Helpers
	 * ===================
	 */

	// standard hbs equality check, pass in two values from template
	// {{#ifeq keyToCheck data.myKey}} [requires an else blockin template regardless]
	_helpers.ifeq = function (a, b, options) {
		if (a == b) { // eslint-disable-line eqeqeq
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	};

	/**
	 * Port of Ghost helpers to support cross-theming
	 * ==============================================
	 *
	 * Also used in the default keystonejs-hbs theme
	 */

	// ### Date Helper
	// A port of the Ghost Date formatter similar to the keystonejs - pug interface
	//
	//
	// *Usage example:*
	// `{{date format='MM YYYY}}`
	// `{{date publishedDate format='MM YYYY'`
	//
	// Returns a string formatted date
	// By default if no date passed into helper than then a current-timestamp is used
	//
	// Options is the formatting and context check this.publishedDate
	// If it exists then it is formated, otherwise current timestamp returned

	_helpers.date = function (context, options) {
		if (!options && context.hasOwnProperty('hash')) {
			options = context;
			context = undefined;

			if (this.publishedDate) {
				context = this.publishedDate;
			}
		}

		// ensure that context is undefined, not null, as that can cause errors
		context = context === null ? undefined : context;

		var f = options.hash.format || 'MMM Do, YYYY';
		var timeago = options.hash.timeago;
		var date;

		// if context is undefined and given to moment then current timestamp is given
		// nice if you just want the current year to define in a tmpl
		if (timeago) {
			date = moment(context).fromNow();
		} else {
			date = moment(context).format(f);
		}
		return date;
	};

	// ### Category Helper
	// Ghost uses Tags and Keystone uses Categories
	// Supports same interface, just different name/semantics
	//
	// *Usage example:*
	// `{{categoryList categories separator=' - ' prefix='Filed under '}}`
	//
	// Returns an html-string of the categories on the post.
	// By default, categories are separated by commas.
	// input. categories:['tech', 'js']
	// output. 'Filed Undder <a href="blog/tech">tech</a>, <a href="blog/js">js</a>'

	_helpers.categoryList = function (categories, options) {
		var autolink = _.isString(options.hash.autolink) && options.hash.autolink === 'false' ? false : true;
		var separator = _.isString(options.hash.separator) ? options.hash.separator : ', ';
		var prefix = _.isString(options.hash.prefix) ? options.hash.prefix : '';
		var suffix = _.isString(options.hash.suffix) ? options.hash.suffix : '';
		var output = '';

		function createTagList (tags) {
			var tagNames = _.map(tags, 'name');

			if (autolink) {
				return _.map(tags, function (tag) {
					return linkTemplate({
						url: ('/blog/' + tag.key),
						text: _.escape(tag.name),
					});
				}).join(separator);
			}
			return _.escape(tagNames.join(separator));
		}

		if (categories && categories.length) {
			output = prefix + createTagList(categories) + suffix;
		}
		return new hbs.SafeString(output);
	};

	_helpers.langVerticalMenu = function (langData) {
		const currentLang = langData.currentLang;
		const data = langData.langData;
		const partChoosen = `<div class="lang-v_item lang-v_item__chosen">`
			+ `<a><img class="lang-v_img" alt=${data[currentLang].alt} src=${data[currentLang].src} ></a></div>`;
		let partList = '';

		Object.keys(data).forEach((key) => {
			if (key !== currentLang) {
				partList += `<li class="lang-v_item lang-v_item__option">
				<a href="?lang=${key}"><img class="lang-v_img" alt=${data[key].alt} src=${data[key].src} ></a></li>`;
			}
		});

		return partChoosen + `<ul class="lang-v_options hidden">${partList}</ul>`;


	// 		<li class="lang-v_item lang-v_item__option">
	// 		<a href="?lang=en">
	// 		<img id="lang-v-1" class="lang-v_img" alt="en" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABhklEQVR4Xu2av2oCYRDE5xJBjFqICF5SWFxhrT6HRfIayeP4IiGg7yIiEgIKKlooll/wgvlj2oP5YObKbfZu9rez3+1dAvErEX9+WAATIK6AW0AcAJugW8AtIK6AW+AHgFFgwBDwwkh7dv+8+L8IGIVarYJ2u4nlcovj8ZTfWLVaQZoWH1uttjgcTohKgCy7x2z2iCx7xXz+kQvQ6aRYLJ4Kj3W7b5hO3+MS4FztVquBzWaHUukGzWYD+/0B9fpd4bH1epdTFsIzpwWS5H8LXO6kXL7FYPCAyWSIXu+LhqJjl1xRCSBPgD2A4QExjcFrDxiPh+j3/3pAUbFvD4hJAHsA4xwQ0xiUJ8AeoD4FfA5gEBCTCVI8ICYB5KeAvAfIb4QYm4loVmIhBMpSlCF6vgy93ghZAHkCAK0WuP4uECyAOgHyHmAB1M8BNkF1E5QnwCaoboLyBMh7gAXwGNR+HWatpth5/acouwLs/CaAXQF2fhPArgA7vwlgV4Cd3wSwK8DOL0/AJ+1MFG7sEPpLAAAAAElFTkSuQmCC"/>
	// 		</a>
	// 		</li>
	// 		<li class="lang-v_item lang-v_item__option">
	// 		<a href="?lang=chi">
	// 		<img id="lang-v-3" class="lang-v_img" alt="ch" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADmUlEQVR4Xu1aTWvUUBQ9L5nMTObL2jJKaym0duNKEXHhwp/gqks3ggVddKGoG0FQXKiLdiVS3LlT8IdUKLgTLVZBqrTUfs5HJk3ek/syKdqZadOSmEzn3dUwzby8e+45592blKHHg/V4/lAAKAb0OAJKAj1OAGWCSgJKAj2OgJKAT4DFc32il8gw9mlDFn+XAaEBwAEIQAiApZILaTQACEDLU/aAMerC+miApZNJrKMBQNWl0NpXVuwA6VGOUw+rEA1g5XkezpLW8fo4+XFoAGRyYy6gA/ZCCsxoray8ZoTj9NMKhM2w8iwH+5sO1gGwrgKAVxkGbtfBsgKrMzmP6nuDJFAUYDoxwUVtzpDXEzDkNowcJyFgHMwAys/PsWlqw7Nb0th+3CzJ1GVCvpX6n7lngPRbZgCiwWBe3IH9XZcg8C1CIs7ae/feHwDafJayZrJ6wgYy4y7OvNymr/BzqojGZx0s3XR6TchEW4IDxjBH+UFVMmb5SR72oi6BiTv2BcDX+8AtC6lBF6LCoBUEUoOeCzrLGvgmAysIOCsa1mZNNBZaExPck0L5Xg1aTmD5cR721y4AgJIkEIwRjvLdGrJXHKAKgLRMQRXMA9ZcCqvTplfVdPuacoshd7kpARfglW6QQDMXcnKK/sk6+q5bgN38QxrYfJvB71c5gAMss/9ZL5xuNMFmrnyboXStgfKjmkxWGhgDVl+Y2HiXhV4M0Og0u0M6QpMSB58CUgckBYahmW1krzqovE8DLlCYsNGY07E0VQJLkWN2ToskkBl35FqyJ+gglf8NTCAAyP3TZ10MTVew/iYrK06JnJiw0H/Dwq/7BTS+dE6KqG+ed3By0pJArb02UZ9PJWJGCAgAg3nBc77aB2O3+aGmyLy0I6tZnzfadoXyRxzQSkIyiLrBpTtFuOtMNkpxRyAA/CSEw1qGGjJISf+9nd3f06AO7/gscykld4vJ4zMJ3WBwAA5TqnbToCEgTwHyThqPE9AF0l4iAeBYT4NBiHCsp8EgANAJ0TINHtAkBVo3gosikcCuafrTYM89EougUlEtGR0DotpxyOsqACJ7LB5ypaJaTjFAMSCqN0NRcTbkdZUElASUBCJ6OxyyVqNaTnmA8gDlAcoD5GM632RC+xeZqFwr5HWVCSoTVCb4rwmGLLGuWS4hryniw0sBEB/2ybizYkAy6hDfLhQD4sM+GXdWDEhGHeLbhWJAfNgn485/AD52xVCc3wVLAAAAAElFTkSuQmCC"/>
	// 		</a>
	// 		</li>
	// 		<li class="lang-v_item lang-v_item__option">
	// 		<a href="?lang=de">
	// 		<img id="lang-v-4" class="lang-v_img" alt="de" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAvklEQVR4Xu3biQ2DMBBEUbsn+q8gPYEEITG08B8d7Hiutcwc8W/G5x8AwIA4AiQQJwATJAESiCNAAgsB9hgZzsNfGQAADGghQAI8gAlKATGoB2iCfwQ0wVYPuvzv5wH7GCkGzO/sALhpjwEkwAOYYCkGpYAYVIQ0QVXYLrAuQ59YEdreJggADGhVYRLgAa8ixASZIBNM3QdIASkgBZ7rcD0GSwa4zuqlaPXk77kxAAPiCJBAnAB+miIBEogjcACJAlFB9ZO9kAAAAABJRU5ErkJggg=="/>
	// 		</a>
	// 		</li>

	};

	/**
	 * KeystoneJS specific helpers
	 * ===========================
	 */

	// block rendering for keystone admin css
	_helpers.isAdminEditorCSS = function (user, options) {
		var output = '';
		if (typeof (user) !== 'undefined' && user && user.isAdmin) {
			output = cssLinkTemplate({
				href: '/keystone/styles/content/editor.min.css',
			});
		}
		return new hbs.SafeString(output);
	};

	// block rendering for keystone admin js
	_helpers.isAdminEditorJS = function (user, options) {
		var output = '';
		if (typeof (user) !== 'undefined' && user && user.isAdmin) {
			output = scriptTemplate({
				src: '/keystone/js/content/editor.js',
			});
		}
		return new hbs.SafeString(output);
	};

	// Used to generate the link for the admin edit post button
	_helpers.adminEditableUrl = function (user, options) {
		var rtn = keystone.app.locals.editable(user, {
			list: 'Post',
			id: options,
		});
		return rtn;
	};

	// ### CloudinaryUrl Helper
	// Direct support of the cloudinary.url method from Handlebars (see
	// cloudinary package documentation for more details).
	//
	// *Usage examples:*
	// `{{{cloudinaryUrl image width=640 height=480 crop='fill' gravity='north'}}}`
	// `{{#each images}} {{cloudinaryUrl width=640 height=480}} {{/each}}`
	//
	// Returns an src-string for a cloudinary image

	_helpers.cloudinaryUrl = function (context, options) {

		// if we dont pass in a context and just kwargs
		// then `this` refers to our default scope block and kwargs
		// are stored in context.hash
		if (!options && context.hasOwnProperty('hash')) {
			// strategy is to place context kwargs into options
			options = context;
			// bind our default inherited scope into context
			context = this;
		}

		// safe guard to ensure context is never null
		context = context === null ? undefined : context;

		if ((context) && (context.public_id)) {
			options.hash.secure = keystone.get('cloudinary secure') || false;
			var imageName = context.public_id.concat('.', context.format);
			return cloudinary.url(imageName, options.hash);
		}
		else {
			return null;
		}
	};

	// ### Content Url Helpers
	// KeystoneJS url handling so that the routes are in one place for easier
	// editing.  Should look at Django/Ghost which has an object layer to access
	// the routes by keynames to reduce the maintenance of changing urls

	// Direct url link to a specific post
	_helpers.postUrl = function (postSlug, options) {
		return ('/blog/post/' + postSlug);
	};

	// might be a ghost helper
	// used for pagination urls on blog
	_helpers.pageUrl = function (pageNumber, options) {
		return '/blog?page=' + pageNumber;
	};

	// create the category url for a blog-category page
	_helpers.categoryUrl = function (categorySlug, options) {
		return ('/blog/' + categorySlug);
	};

	// ### Pagination Helpers
	// These are helpers used in rendering a pagination system for content
	// Mostly generalized and with a small adjust to `_helper.pageUrl` could be universal for content types

	/*
	* expecting the data.posts context or an object literal that has `previous` and `next` properties
	* ifBlock helpers in hbs - http://stackoverflow.com/questions/8554517/handlerbars-js-using-an-helper-function-in-a-if-statement
	* */
	_helpers.ifHasPagination = function (postContext, options) {
		// if implementor fails to scope properly or has an empty data set
		// better to display else block than throw an exception for undefined
		if (_.isUndefined(postContext)) {
			return options.inverse(this);
		}
		if (postContext.next || postContext.previous) {
			return options.fn(this);
		}
		return options.inverse(this);
	};

	_helpers.paginationNavigation = function (pages, currentPage, totalPages, options) {
		var html = '';

		// pages should be an array ex.  [1,2,3,4,5,6,7,8,9,10, '....']
		// '...' will be added by keystone if the pages exceed 10
		_.each(pages, function (page, ctr) {
			// create ref to page, so that '...' is displayed as text even though int value is required
			var pageText = page;
			// create boolean flag state if currentPage
			var isActivePage = ((page === currentPage) ? true : false);
			// need an active class indicator
			var liClass = ((isActivePage) ? ' class="active"' : '');

			// if '...' is sent from keystone then we need to override the url
			if (page === '...') {
				// check position of '...' if 0 then return page 1, otherwise use totalPages
				page = ((ctr) ? totalPages : 1);
			}

			// get the pageUrl using the integer value
			var pageUrl = _helpers.pageUrl(page);
			// wrapup the html
			html += '<li' + liClass + '>' + linkTemplate({ url: pageUrl, text: pageText }) + '</li>\n';
		});
		return html;
	};

	// special helper to ensure that we always have a valid page url set even if
	// the link is disabled, will default to page 1
	_helpers.paginationPreviousUrl = function (previousPage, totalPages) {
		if (previousPage === false) {
			previousPage = 1;
		}
		return _helpers.pageUrl(previousPage);
	};

	// special helper to ensure that we always have a valid next page url set
	// even if the link is disabled, will default to totalPages
	_helpers.paginationNextUrl = function (nextPage, totalPages) {
		if (nextPage === false) {
			nextPage = totalPages;
		}
		return _helpers.pageUrl(nextPage);
	};


	//  ### Flash Message Helper
	//  KeystoneJS supports a message interface for information/errors to be passed from server
	//  to the front-end client and rendered in a html-block.  FlashMessage mirrors the Pug Mixin
	//  for creating the message.  But part of the logic is in the default.layout.  Decision was to
	//  surface more of the interface in the client html rather than abstracting behind a helper.
	//
	//  @messages:[]
	//
	//  *Usage example:*
	//  `{{#if messages.warning}}
	//      <div class="alert alert-warning">
	//          {{{flashMessages messages.warning}}}
	//      </div>
	//   {{/if}}`

	_helpers.flashMessages = function (messages) {
		var output = '';
		for (var i = 0; i < messages.length; i++) {

			if (messages[i].title) {
				output += '<h4>' + messages[i].title + '</h4>';
			}

			if (messages[i].detail) {
				output += '<p>' + messages[i].detail + '</p>';
			}

			if (messages[i].list) {
				output += '<ul>';
				for (var ctr = 0; ctr < messages[i].list.length; ctr++) {
					output += '<li>' + messages[i].list[ctr] + '</li>';
				}
				output += '</ul>';
			}
		}
		return new hbs.SafeString(output);
	};


	//  ### underscoreMethod call + format helper
	//	Calls to the passed in underscore method of the object (Keystone Model)
	//	and returns the result of format()
	//
	//  @obj: The Keystone Model on which to call the underscore method
	//	@undescoremethod: string - name of underscore method to call
	//
	//  *Usage example:*
	//  `{{underscoreFormat enquiry 'enquiryType'}}

	_helpers.underscoreFormat = function (obj, underscoreMethod) {
		return obj._[underscoreMethod].format();
	};

	return _helpers;
};
