
var Cof = Cof || {};
Cof.Helpers = {
    numSeparators: function(num, dec, dec_sep, thou_sep) {
        var n = num,
        c = isNaN(dec) ? 0 : Math.abs(dec), // # of digits after decimal ... if undefined, use zero
        d = dec_sep || '.', // US & Canada use a decimal to separate dollars/cents ... can be changed on call for other locales
        t = (typeof thou_sep === 'undefined') ? ',' : thou_sep, // US & Canada use a comma as thousand separators ... can be changed on call for other locales
        sign = (n < 0) ? '-' : '', // is negative number?
        i = parseInt (n = Math.abs(n).toFixed(c)) + '',
        j = (j = i.length) > 3 ? j % 3 : 0;
        return sign + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    },
    numFormat: function(num, format, decimals) {
        var formattedNumber = Cof.Helpers.numSeparators(num, decimals);
        if (format === "dollars") {
            return "$" + formattedNumber;
        } else {
            return formattedNumber;
        }
    },
    SmoothScroll: function(trigger, additionalOffset) {
        if (location.pathname.replace(/^\//,'') === trigger.pathname.replace(/^\//,'') && location.hostname === trigger.hostname) {
            var target = $(trigger.hash);
            target = target.length ? target : $('[name=' + trigger.hash.slice(1) + ']');
            if (target.length) {
                additionalOffset = additionalOffset || 0;
                var scrollToPos = target.position().top + additionalOffset;
                $('html,body').animate({
                    scrollTop: scrollToPos
                }, {
                    duration: 750,
                    complete: function() {
                        target.focus();
                    }
                });

                return false;
            }
        }
    },
    getQuerystringParam: function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
};

Cof.KeyCodes = function(obj) {
    obj.tab        = 9;
    obj.enter      = 13;
    obj.esc        = 27;
    obj.space      = 32;
    obj.pageup     = 33;
    obj.pagedown   = 34;
    obj.end        = 35;
    obj.home       = 36;
    obj.left       = 37;
    obj.up         = 38;
    obj.right      = 39;
    obj.down       = 40;
};
Cof.BadgeCookieValue = function (key) {
    var badgeString = $.cookie('BADGE'),
        badgeArray = badgeString.split('|'),
        badgeArrLen = badgeArray.length - 1;
    for (var i = badgeArrLen; i--;) {
        var KVP = badgeArray[i].split('^');
        if (KVP[0] === key) {
            return KVP[1];
        }
    }
    return false;
};
Cof.isTouchDevice = function () {
    return !!('ontouchstart' in document.documentElement);
};
Cof.ScreenSize = function () {
    if (window.matchMedia("screen and (min-width: 48em) and (max-width: 59.9375em)").matches) {
        return "tablet";
    } else if (window.matchMedia("screen and (max-width: 47.9375em)").matches) {
        return "mobile";
    } else {
        return "desktop";
    }
};
Cof.DocumentHeight = function() {
    return $(document).height();
};

/* global Cof, $, Hammer */

/**
 * SlidePanel() is a class constructor to bind a button/link trigger to the slide panel widget.
 * Usage: Requires the following:
 *      1. An existing slide panel DOM element with the class of `panel-overlay` to fill with content
 *      2. Trigger elements have class of `slide-panel-trigger`
 *      3. Trigger elements have an attribute of `href` or `data-content-url` which points to the content to be loaded
 *
 * @class SlidePanel
 * @constructor
 * @param {Object} slidePanelTrigger The trigger element object.
 * @return N/A
 */

var reqAnimationFrame = (function () {
    return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

Cof.SlidePanel = function(slidePanelTrigger) {
    this.$trigger = slidePanelTrigger;
    this.$index = slidePanelTrigger.index();
    this.$panel = $('.panel-overlay');
    this.$panelID = this.AssignPanelID();
    this.$panelClose = this.$panel.find('.overlay-close');
    this.$contentUrl = this.GetContentUrl(slidePanelTrigger);
    this.$slideTime = this.GetSlideTime(slidePanelTrigger);
    this.$persist = this.GetPersist(slidePanelTrigger);
    this.$touch = this.GetTouchEnabled(slidePanelTrigger);
    this.$position = this.GetPosition(slidePanelTrigger); // top/bottom/left/right
    this.$windowWidth = this.GetWindowWidth();
    this.BindEventHandlers();
    this.SetHeight();
    this.$panel.attr('aria-hidden', 'true').addClass('closed');
    this.$transform = {
        translate: {
            x: 0,
            y: 0
        }
    };
    this.$totalDist = 0;
    this.$ticking = false;
};
Cof.SlidePanel.prototype = {
    /**
     * A Method that determines whether the slide panel has content,
     * used as a helper for persistent panels (used in TriggerClick function)
     *
     * @return true or false
     */
    IsEmpty: function() {
        var holderContent = this.$panel.find('.panel-holder').html();
        if (holderContent ==="") {
            return true;
        } else {
            return false;
        }
    },
    /**
     * A Method that populates the $contentUrl based on provided element attribution
     *
     * @param {Object} slidePanelTrigger The trigger element object.
     * @return Content URL
     */
    GetContentUrl: function(slidePanelTrigger) {
        if (!slidePanelTrigger.attr('data-content-url')) {
            return slidePanelTrigger.attr('href');
        } else {
            return slidePanelTrigger.attr('data-content-url');
        }
    },
    /**
     * A Method that populates the $slidetime based on provided element attribution
     *
     * @param {Object} slidePanelTrigger The trigger element object.
     * @return Slide Transition Time
     */
    GetSlideTime: function(slidePanelTrigger) {
        if (!slidePanelTrigger.data('slidetime')) {
            return 750;
        } else {
            return slidePanelTrigger.data('slidetime')+50;
        }
    },
    /**
     * A Method that populates the $position based on provided element attribution
     *
     * Used for swipe event listening
     * Example: data-position: right refers to a panel that slides in from the right
     *
     * @param {Object} slidePanelTrigger The trigger element object.
     * @return Slide Transition Time
     */
    GetPosition: function(slidePanelTrigger) {
        if (!slidePanelTrigger.data('position')) {
            return "top";
        } else {
            return slidePanelTrigger.data('position');
        }
    },
    /**
     * A Method that populates the $persist based on provided element attribution
     *
     * @param {Object} slidePanelTrigger The trigger element object.
     * @return Content Persistence
     */
    GetPersist: function(slidePanelTrigger) {
        if (slidePanelTrigger.data('persist')===true) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * A Method that populates the $touch based on provided element attribution
     *
     * @param {Object} slidePanelTrigger The trigger element object.
     * @return Touch Enabled true/false
     */
    GetTouchEnabled: function(slidePanelTrigger) {
        if (slidePanelTrigger.data('touchenabled')===true) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * A Method that populates the $panelWidth based on jQuery's outerWidth() method
     *
     * @param {Object} slidePanelTrigger The trigger element object.
     * @return this.$panelWidth
     */
    GetWindowWidth: function(){
        return $(window).width();
    },
    /**
     * A Method that adds a unique id to the panel overlay
     *
     * @return panel overlay
     */
    AssignPanelID: function() {
        var slidePanelObj = this;
        var panel = slidePanelObj.$panel;
        var id = "cof-slidepanel-"+this.$index;
        panel.attr('id', id);
        return id;
    },
    /**
     * A Method that binds input events to the Trigger and SlidePanel Objects
     *
     * @return Bound Event Methods
     */
    BindEventHandlers: function() {
        var slidePanelObj = this;
        var panel = slidePanelObj.$panel;
        slidePanelObj.$trigger.on('click', function(e) {
            return slidePanelObj.TriggerClick(e);
        });

        slidePanelObj.$panelClose.on('click', function() {
            return slidePanelObj.Close();
        });

        // close if panel is clicked but children are not
        // (in case where panel content is not full-width and user clicks off of content)
        panel.on('click', function(e){
            if (e.target !==this){
                return true;
            } else{
                return slidePanelObj.Close();
            }
        });

        // if touch-enabled, add swipe to close functionality
        if (slidePanelObj.$touch) {
            slidePanelObj.SwipeClose();
        }

        // re-calculate panel width on orientation change
        window.addEventListener('orientationchange', slidePanelObj.GetWindowWidth);
    },
    /**
     * A Method that fetchs content from $contentUrl and displays it via AJAX in `.panel-holder`
     *
     * @return true/false
     */
    DisplayAjaxContent: function() {
        var slidePanelObj = this;

        var panelRequest = $.ajax({
            url: slidePanelObj.$contentUrl,
            dataType: "html"
        });

        panelRequest.done(function(content) {
            // add "load" trigger to allow for hooks on ajax load
            slidePanelObj.$panel.trigger('cof-sp-load', slidePanelObj);
            slidePanelObj.$panel.find('.panel-holder').html(content);
            // for a11y, to create loop for focus trap while panel is open
            slidePanelObj.$panel.prepend('<a href="javascript:;" class="panel-start">Start of Modal Dialog</a>').append('<a href="javascript:;" class="panel-end">End of Modal Dialog</a>');
            $('.panel-end, .panel-start').unbind('focus').on("focus", function () {
                $('.overlay-close').focus();
            });

            slidePanelObj.Open();
            return true;
        });

        panelRequest.fail(function() {
           //Failure Event?

           return false;
        });
    },
    /**
     * A Method that opens the panel
     *
     * @return true
     */
    Open: function(){
        var slidePanelObj = this;
        var slideTime = slidePanelObj.$slideTime;
        slidePanelObj.$panel.show(function(){
            slidePanelObj.$panel.removeClass('closed').trigger('cof-sp-open', slidePanelObj).addClass('open').attr('aria-hidden', 'false');
            window.setTimeout(function() {
                slidePanelObj.$panelClose.focus();
                slidePanelObj.$panel.trigger('cof-sp-opencomplete', slidePanelObj);
            }, slideTime);
        });
    },
    /**
     * A Method that clears content `.panel-holder`
     *
     * @return true
     */
    ClearContent: function() {
        var slidePanelObj = this;
        slidePanelObj.$panel.find('.panel-holder').html();

        return true;
    },
    /**
     * A Method that closes the panel by removing `open` class from the overlay element, and then calls ClearContent()
     *
     * @return true
     */
    Close: function() {
        var slidePanelObj = this;
        var slideTime = slidePanelObj.$slideTime;
        var persist = slidePanelObj.$persist;
        slidePanelObj.$panel.removeClass('open').addClass('closed').trigger('cof-sp-close', slidePanelObj).attr('aria-hidden', 'true');
        window.setTimeout(function() {
            if (!persist) {
                slidePanelObj.ClearContent();
            }
            slidePanelObj.$trigger.focus();
            slidePanelObj.$panel.trigger('cof-sp-closecomplete', slidePanelObj);
        }, slideTime);

        return true;
    },
    /**
     * A Method that binds the `click` event to the trigger
     *
     * @return DisplayAjaxContent() || Open()
     */
    TriggerClick: function(e) {
        e.preventDefault();
        var slidePanelObj = this;
        // for persistent content, is it already loaded?
        if (slidePanelObj.$persist && !slidePanelObj.IsEmpty()) {
            return slidePanelObj.Open();
        } else {
            return slidePanelObj.DisplayAjaxContent();
        }
    },
    /**
     * A Method that gets the DOM height
     *
     * @return Document Height
     */
    DocumentHeight: function() {
        return $(document).height();
    },
    /**
     * A Method that sets the panel overlay height equal to the DOM height
     *
     * @return N/A
     */
    SetHeight: function() {
        var slidePanelObj = this;
        var setOverlayHeight = function() {
            slidePanelObj.$panel.height(slidePanelObj.DocumentHeight());
        };
        return window.setTimeout(setOverlayHeight, 500);
    },

    SwipeClose: function() {
        var slidePanelObj = this;
        var panelWidth = slidePanelObj.$windowWidth;
        // setup hammer object on panel
        var panelID = slidePanelObj.$panelID;
        var el = document.querySelector('#'+panelID);
        var mc = new Hammer.Manager(el);
        mc.add(new Hammer.Pan({ threshold: 5, pointers: 1, direction: Hammer.DIRECTION_HORIZONTAL }));
        // move panel with user swipe
        mc.on('panstart panmove', function(ev){
            $(el).addClass('drag');
            //this.$transform.translate.x = ev.deltaX;
            slidePanelObj.$transform.translate.x = ev.deltaX;
            slidePanelObj.SwipeRequestUpdate();
        });
        mc.on('hammer.input', function(ev){
            // determine user intent, over 50% of width closes, otherwise keep open
            if (ev.isFinal){
                if (slidePanelObj.$totalDist > panelWidth/4) {
                    slidePanelObj.Close();
                } else {
                    slidePanelObj.Open();
                }
                el.style.webkitTransform = "";
                el.style.mozTransform = "";
                el.style.transform = "";
                // reset swipe distance, remove drag class
                $(el).removeClass('drag');
                slidePanelObj.$totalDist = 0;
            }
        });
    },

    SwipeRequestUpdate: function(){
        var slidePanelObj = this;
        if (!slidePanelObj.$ticking) {
            reqAnimationFrame(function(){slidePanelObj.SwipeUpdateTransform();});
            slidePanelObj.$ticking = true;
        }
        slidePanelObj.SwipeUpdateTransform();
    },

    SwipeUpdateTransform: function(){
        var slidePanelObj = this;
        var value = "";
        if (slidePanelObj.$transform.translate.x >= 0) {
            value = 'translate3d(' + slidePanelObj.$transform.translate.x + 'px, 0, 0)';
            slidePanelObj.$totalDist = slidePanelObj.$transform.translate.x;
        } else {
            value = 'translate3d(0, 0, 0)';
        }
        var panelID = slidePanelObj.$panelID;
        var el = document.querySelector('#'+panelID);
        el.style.webkitTransform = value;
        el.style.mozTransform = value;
        el.style.transform = value;
        slidePanelObj.$ticking = false;
    }
};

//On PageLoad, If there are any slide-panel triggers present, instantiate the SlidePanel.Trigger object
$(function() {
    if ($('.slide-panel-trigger').length) {
        Cof.slidePanelTriggers = [];

        $('.slide-panel-trigger').each(function() {
            Cof.slidePanelTriggers.push(new Cof.SlidePanel($(this)));
        });
    }
});