# BLARGH
Yet Another Feather-Like Slider (5KB-)



BASIC HTML STRUCTURE:

	<link rel="stylesheet" type="text/css" href="../src/blargh.min.css">

	<div class="blargh-wrapper blargh-noinit" id="slider">
		<div class="blargh-container">
			<div class="blargh-slide">
				SLIDE 01
			</div>
			<div class="blargh-slide">
				SLIDE 02
			</div>
			<div class="blargh-slide">
				SLIDE 03
			</div>
		</div>
	</div>
	<a href="javascript:" onclick="slider.prev();return false;">PREV</a> - 
	<a href="javascript:" onclick="slider.next();return false;">NEXT</a>

	<script src="../src/blargh.min.js"></script>
	<script>
		var slider = new BLARGH({id: 'slider'});
	</script>

Check demos for more examples.



PARAMETERS

	'initial': 1, // initial slide
	'extended': false, // manage left and right previews
	'lazy': true, // enable internal lazy load manager
	'visibility': true, // enable visibility manager
	'autoplay': false, // false or milliseconds
	'mouseover': true, // mouseover pauses autoplay
	'visibilityid': false, // container id used by visibility (false = main container)
	'mouseoverid': false, // container id used by mouseover (false = main container)
	'pagerid': false,  // container id used by pager (false = main container)
	'pager': false, // enable pager dots
	'pagerlinks': false, // enable clickable pager
	'preload': true // lazy preload next/prev



PROPS

	slides: slides array
	info: current slider info 



METHODS

	next(immediate, noCallback) : go to next slide
	prev(immediate, noCallback) : go to prev slide
	go(index, noCallback) : go to slide
	onChange(callbackFunction) : add onChange callback
	lazyLoad(index) : manually lazy load slide
	update() : update slider content



DEMO IMAGES

https://www.pexels.com/it-it/foto/aereo-aereo-militare-aeroplano-aviazione-76959/
https://www.pexels.com/it-it/foto/aereo-aereo-da-combattimento-aeronautica-militare-aeroplano-76964/
https://www.pexels.com/it-it/foto/acqua-acque-azzurre-aereo-aeroplano-2405101/
https://www.pexels.com/it-it/foto/aereo-di-linea-aeroplano-aeroporto-airbus-1098745/
https://www.pexels.com/it-it/foto/aereo-aeronautica-militare-aeroplano-aeroporto-2382848/
