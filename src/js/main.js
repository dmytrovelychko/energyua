var heightCollpsedNavbarMenu = null;

function calclulateHeightCollapsedNavbarMenu() {
	var heights = $('.navbar-collapsed_menu-item').map(function () { return $(this).outerHeight(); }).get();
	heightCollpsedNavbarMenu = heights.reduce(function(total, el) { return total + el; });
}

$(document).ready(function() {
	calclulateHeightCollapsedNavbarMenu();
	maximizeHeaderInfoContentHeight();
});
$(window).resize(function() {
	$('.navbar-collapsed_menu').css({ height: 0 });
	calclulateHeightCollapsedNavbarMenu();
	maximizeHeaderInfoContentHeight();
});

// btn navbar collapsed menu
$('.navbar-collapsed_btn').click(function() {
	var currentHieght = $('.navbar-collapsed_menu').outerHeight();
	$('.navbar-collapsed_menu').css({
		height: currentHieght === 0 ? heightCollpsedNavbarMenu : 0
	});
});
$('.navbar-collapsed_btn').hover(function() {
	$(this).toggleClass('navbar-collapsed_btn__active');
	$('.navbar-collapsed_btn-stripe').toggleClass('navbar-collapsed_btn-stripe__active');
});

// btn navbar normal hide neighbour delimiters
$('.navbar-n_menu-item').hover(function() {
	$(this).prev().toggleClass('invisible');
	$(this).next().toggleClass('invisible');
});

// lang menu navbar normal
$('.lang-v_item__chosen').click(function() {
	$('.lang-v_options').toggleClass('hidden');
});
$('.lang-v_item__option').click(function() {
	$('.lang-v_options').toggleClass('hidden');
});


// Header info content resize to same max height
function maximizeHeaderInfoContentHeight() {
	var infoContents = $('.about_content');
	// reset heights
	infoContents.css({ height: 'auto' });
	var heights = infoContents.map(function () { return $(this).outerHeight(); }).get();
	var maxHeight = heights.reduce(function(a, b) {
		return Math.max(a, b);
	});
	infoContents.css({ height: maxHeight });
}
