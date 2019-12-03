;(function(global){

	/* DEFAULT CONF */
	var default_config = {
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
	}

	/* GENERIC EXTEND FUNCTION */
	var extend = function ( defaults, options ) {
	    var extended = {};
	    var prop;
	    for (prop in defaults) {
	        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
	            extended[prop] = defaults[prop];
	        }
	    }
	    for (prop in options) {
	        if (Object.prototype.hasOwnProperty.call(options, prop)) {
	            extended[prop] = options[prop];
	        }
	    }
	    return extended;
	};
	
	/* GENERIC ADD/REMOVE CLASS  */
	var addClass = function(obj, clss){ obj.classList.add(clss); }
	var removeClass = function(obj, clss){ obj.classList.remove(clss); }


	/* MAIN SLIDER CODE */
	global.BLARGH = function(conf){
		var self = this, conf = conf || {}, mainObj=false, slides = [], current = 0, rcurrent = 0, transTmr = false, cbk_c = [], visible = true, observer = false, autoTmr = false, over = false , visObj = false, overObj = false, pagerObj = false, pagerInit = false, pagers = [], rslides=[];

		var config = extend(default_config, conf); // merge configurations
		if(!config.id)return false; // we need an id
		this.status = {}; // public position info
		var mainObj = document.getElementById(config.id); // main slider object
		if(!mainObj) return false;
		visObj = mainObj;
		overObj = mainObj;
		if(config.visibilityid) visObj = document.getElementById(config.visibilityid);
		if(config.mouseoverid) overObj = document.getElementById(config.mouseoverid);
		if(config.pager) {
			if(config.pagerid) {
				pagerObj = document.getElementById(config.pagerid);
			} else {
				var pgr = mainObj.getElementsByClassName("blargh-pager");
				if(pgr) pagerObj = pgr[0];
			}
		}

		current = config.initial - 1; // internal ids start from 0, external from 1
		// check if there's an active slide
		for(var i=0;i<slides.length;i++){
			var a = slides[i].className;
			if(a) if(a.indexOf('blargh-active')>-1) current = i;
		}
		rcurrent = current; // update rcurrent
		
				
		/* PRIVATE METHODS */

		// main init
		var init = function(){
			slides = mainObj.getElementsByClassName("blargh-slide"); // get all slides
			for(var i=slides.length-1;i>=0;i--){
				if(slides[i].className.indexOf('blargh-clone')>-1) slides[0].parentNode.removeChild(slides[i]); // remove clones
				else addClass(slides[i],'blargh-real');
			}
			
			// add clones if needed
			var tclones = [];
			if(config.extended){
				if(slides.length<=5){
					var c = [[0,0,0,0,0],[0,1,0,1],[0,1,2],[0,1,2,3],[0,1,2,3,4]];
					tclones = c[slides.length-1];
				}	
			} else {
				if(slides.length<=3){
					var c = [[0,0,0],[0,1],[0,1,2]];
					tclones = c[slides.length-1];
				}				
			}
			if(tclones.length>0){
				for(var i=0;i<tclones.length;i++){
					var c = slides[tclones[i]].cloneNode(true);
					removeClass(c,'blargh-real');
					addClass(c,'blargh-clone');
					slides[0].parentNode.appendChild(c);
				}
			}
			
			slides = mainObj.getElementsByClassName("blargh-slide"); // get all slides
			rslides = mainObj.getElementsByClassName("blargh-real"); // get real slides
			self.slides = rslides; // public slides array
			if(pagerObj){
				pagerObj.innerHTML='';
				pagerInit = false;
			}
			classSet();
		}

		
		// update slider - CORE FUNCTION!
		var classSet = function(){
			var prv = current - 1, nxt = (current + 1) % slides.length, pprv = current - 2, nnxt = (current + 2) % slides.length;
			if(prv<0) prv = prv + slides.length;
			if(pprv<0) pprv = pprv + slides.length;

			
			for(var i=0;i<slides.length; i++){

				/* remove prev classes */
				removeClass(slides[i], 'blargh-prev');
				removeClass(slides[i], 'blargh-next');
				if(config.extended){
					removeClass(slides[i], 'blargh-pprev');
					removeClass(slides[i], 'blargh-nnext');
				}
				removeClass(slides[i], 'blargh-active');


				/* add new classes */
				if(i===current) addClass(slides[i], 'blargh-active');
				else if(i===prv) addClass(slides[i], 'blargh-prev');
				else if(i===nxt) addClass(slides[i], 'blargh-next');
				else if((i===pprv)&&(config.extended)) addClass(slides[i], 'blargh-pprev');
				else if((i===nnxt)&&(config.extended)) addClass(slides[i], 'blargh-nnext');
			}
						
			rcurrent = current % rslides.length ;
			self.status = {"current": rcurrent + 1, "total": rslides.length, "visible": visible, "over": over}; // update public info

			if(config.lazy){
				if(visible){
					microLoad(slides[current]);
					if(config.preload){
						microLoad(slides[nxt]);
						microLoad(slides[prv]);
						if(config.extended){
							microLoad(slides[nxt]);
							microLoad(slides[prv]);
						}
					}
				}
			}
			
			if((config.autoplay)&&(visible)){
				autoTmr = setTimeout(function(){self.next()},config.autoplay);
			}
			
			if(pagerObj) updatePager();

		}
		
		// transition ends
		var endOfTrans = function(){
			if(transTmr){
				clearTimeout(transTmr);
				transTmr = false;
			}
			removeClass(mainObj, 'blargh-trans');
		}
		
		// move function
		var move = function(idx, immed, nocbk){
			if(autoTmr) {clearTimeout(autoTmr);autoTmr=false;}
			if(typeof idx === 'undefined')return;
			if(current === idx) return;
			var nocbk= nocbk || false;
			var immed = immed || false;
			if(transTmr !== false) {
				endOfTrans();
			}
			if(!immed) {
				transTmr = setTimeout(endOfTrans, 600);
				addClass(mainObj, 'blargh-trans');
			}
			current = idx;
			classSet();
			if(!nocbk) for(var i=0;i<cbk_c.length;i++) cbk_c[i](self);
		}

		var modUrl = function(o, u){
			return u;
		}
		
		// lazy load manager		
		var microLoad = function(o){
			if(o.getAttribute('data-mlazy'))return;
			var update_stuff = function(imgs){
				for(var i=0;i<imgs.length;i++){
					var a = imgs[i].getAttribute('data-msrc'); // src
					if(a) {
						imgs[i].src = modUrl(imgs[i],a);
						imgs[i].removeAttribute('data-msrc');
					}
					a = imgs[i].getAttribute('data-msrcset');
					if(a) {
						imgs[i].setAttribute('srcset', modUrl(imgs[i],a)); // srcset
						imgs[i].removeAttribute('data-msrcset');
					}
					a = imgs[i].getAttribute('data-mbackground');
					if(a) {
						imgs[i].style.backgroundImage = "url("+modUrl(imgs[i],a)+")"; // background
						imgs[i].removeAttribute('data-mbackground');
					}
				}
			}
			update_stuff(o.getElementsByTagName('img'));
			update_stuff(o.getElementsByTagName('source'));
			update_stuff(o.getElementsByTagName('span'));			
			o.setAttribute('data-mlazy', '');
		}

		// create/update pager
		var updatePager = function(){
			if(!pagerObj) return;
			if(!pagerInit){
				pagerInit = true;
				if(slides.length<2) pagerObj.innerHTML = ''; // no pager if only one page
				else {
					var s = '';
					for(var i=0;i<rslides.length;i++){
						s=s+"<span></span>";
					}
					pagerObj.innerHTML = s;
				}
				setTimeout(function(){
					pagers = pagerObj.getElementsByTagName('span');
					if(config.pagerlinks){
						for(var i=0;i<pagers.length;i++) {
							var n = function(i){
								pagers[i].addEventListener("click", function(){self.go(i+1)}, {passive: true});
							}(i);
						}
					}
					updatePager();
				},1);
			} else {
				for(var i=0;i<pagers.length;i++) {
					if(i===rcurrent) pagers[i].className='blargh-active';
					else pagers[i].className='';
				}
			}
		}

		/* PUBLIC METHODS */
		
		// *** public next method
		// immed (def. false) no transition
		// nocbk (def. false) no callback
		this.next = function(immed, nocbk){
			var immed = immed || false;
			var nocbk= nocbk || false;
			var idx = (current + 1) % slides.length;
			move(idx, immed, nocbk);
		}	
		
		// *** public prev method
		// immed (def. false) no transition
		// nocbk (def. false) no callback
		this.prev = function(immed, nocbk){
			var immed = immed || false;
			var nocbk= nocbk || false;
			var idx = current - 1;
			if(idx<0) idx = idx + slides.length;
			move(idx, immed, nocbk);
		}	
		
		// *** public go method
		// idx (required) index (1...)
		// nocbk (def. false) no callback
		this.go = function(idx, nocbk){
			if(typeof idx === 'undefined')return;
			var nocbk= nocbk || false;
			var idx = idx - 1;
			move(idx, true, nocbk);
		}
				
		// *** public onChange method
		// cb (required) callback function
		this.onChange = function(cb){
			cbk_c.push(cb);
		}

		// *** public lazyload method
		// idx (default all indexes) slide to load (1...)
		this.lazyLoad = function(idx){
			var o = mainObj;
			if(typeof idx !== 'undefined') o = slides[idx+1];
		}

		// *** public update method
		this.update = function(){
			init();
		}
		
		/* INIT */

		// observer manager
		if(config.visibility) {
			// if observer is supported...
			if ('IntersectionObserver' in global) {	
					var observerCallback = function(entries){
						entries.forEach(function(entry) {
									if(entry.intersectionRatio>=.1){
										if(visible) return;
										visible = true;
										classSet(); // update slider
									} else {
										if(!visible) return;
										visible = false;
										self.status.visible = false;
										if(autoTmr) {clearTimeout(autoTmr);autoTmr=false;} // stops autoplay
									}
						});
					}
					
					var observerOptions = {
			    	root: null,
			    	rootMargin: "0px",
			    	threshold: [0.1]
			  	};
			  	observer = new IntersectionObserver(observerCallback, observerOptions);
			  	visible = false;
			  	self.status.visible = false;
			  	observer.observe(visObj);
			}
		}
		// touch manager
		try{
			var container = mainObj;
		  var initialX = null;
		  var initialY = null;
		  var startTouch = function(e) {
		    initialX = e.touches[0].clientX;
		    initialY = e.touches[0].clientY;
		  };
		  var moveTouch = function(e) {
		    if (initialX === null) { return; }
		    if (initialY === null) { return; }
		    var currentX = e.touches[0].clientX;
		    var currentY = e.touches[0].clientY;
		    var diffX = initialX - currentX;
		    var diffY = initialY - currentY;
		    if (Math.abs(diffX) > Math.abs(diffY)) {
		      // sliding horizontally
		      if (diffX > 8) {
		        // swiped left
						self.next();
				    e.preventDefault();
		      } else if(diffX < -8) {
		        // swiped right
		        self.prev();
				    e.preventDefault();
		      }  
		    }
		    initialX = null;
		    initialY = null;
		  };
			container.addEventListener("touchstart", startTouch, {passive: true});
		  container.addEventListener("touchmove", moveTouch, {passive: true});
		}catch(er){}
		// mouseover manager
		if(config.autoplay){
			if(config.mouseover){
			  if(config.mouseover){
				  overObj.addEventListener("mouseover", function(){
				  	if(over === false){
					  	over = true;
					  	self.status.over = over;
					  	if(autoTmr!==false) {clearTimeout(autoTmr);autoTmr=false;}
					  }
				  }, {passive: true});
				  overObj.addEventListener("mouseout", function(){
						if(over === true){
					  	over = false;
					  	self.status.over = over;
					  	if(autoTmr===false) autoTmr = setTimeout(function(){self.next()},config.autoplay);
					  }
				  }, {passive: true});
				}
			}
		}

		init();

		removeClass(mainObj, 'blargh-noinit');
		addClass(mainObj, 'blargh-init');

	}
		
}(window));