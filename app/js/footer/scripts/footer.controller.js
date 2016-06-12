/**
 * resetPasswordController
 *
 * 
 */
(function() {
  'use strict';

  angular
	.module('govtID').controller('footerController', footerController);

  footerController.$inject = ['$scope', '$rootScope', '$http', '$log', '$state', '$window', '$translate', '$cookies', '$translatePartialLoader', '$timeout'];
  function footerController($scope, $rootScope, $http, $log, $state, $window, $translate, $cookies, $translatePartialLoader, $timeout) {
  	 	/* WWW Style Footer Code Starts here */
        $('li.footersubs').hoverIntent({
            over: function () {
                if(!$(this).hasClass('sfHover')){
                    $('.sfHover').removeClass('sfHover').find('ul').hide();
                    $(this).addClass('sfHover').find('ul').show();
                }
            },
            timeout: 500,
            out: function (){
                $(this).removeClass('sfHover').find('ul').hide();
            }
        });

		

        $('li.footersubs > a').on("keyup", function(e) {

            Cof.Footer.keyCode = e.which || e.keyCode;
            if (Cof.Footer.keyCode === 9) {
                $(this).parent().removeClass('sfHover').find('ul').hide();
                $('.expand-footersubs:visible').hide();
                $(this).parent().find('.expand-footersubs').show();
                //$(this).parent().addClass('sfHover').find('ul').show();
            }
        }).on("focus", function() {
            if(!$(this).parent().hasClass('sfHover')){
                $('li.footersubs ul').hide();
            }
        }).on("click", function(e) {
            e.preventDefault();
        });

        if( navigator.userAgent.match(/Android/i)       ||
            navigator.userAgent.match(/webOS/i)         ||
            navigator.userAgent.match(/iPhone/i)        ||
            navigator.userAgent.match(/iPad/i)          ||
            navigator.userAgent.match(/iPod/i)          ||
            navigator.userAgent.match(/BlackBerry/i)    ||
            navigator.userAgent.match(/Kindle/i)        ||
            navigator.userAgent.match(/Silk/i)          ||
            navigator.userAgent.match(/Touch/i)
        ){
            $('li.footersubs > a').on("click", function(e) {
                if(!$(this).parent().hasClass('sfHover')){
                    $('.sfHover').removeClass('sfHover').find('ul').hide();
                    $(this).parent().addClass('sfHover').find('ul').show();
                }
                e.preventDefault();
            });
        }

        $('.expand-footersubs a').on("blur", function () {
            $(this).parent().hide();
        }).on("click", function () {
            $(this).parent().hide();
            $(this).parents('li').addClass('sfHover').find('ul').show().find('a:first').focus();
            return false;
        });

        $('a, input').on("focus", function () {
            if(!$(this).parents().hasClass('sfHover')){
                $('li.footersubs ul').hide();
            }
            if(!$(this).parents().hasClass('footersubs')){
                $('.expand-footersubs:visible').hide();
            }
        });

        $(document).on("click", function(e) {
            var foot = $(e.target);
            if(!foot.parents().hasClass('sfHover')){
                $('.footer-nav .sfHover').removeClass('sfHover').find('ul').hide();
                $('.expand-footersubs:visible').hide();
            }
        });

        /* WWW Style Footer Code Ends here */    
  }
})();
