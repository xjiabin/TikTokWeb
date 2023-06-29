(function($) {
	$(document).ready(function(){
		jQuery('.progress-wrap').on('click', function(event) {
			event.preventDefault();
			jQuery('html, body').animate({scrollTop: 0});
			return false;
		})
	});
})(jQuery);