/*
 Copyright 2011 Javier Alejandro Figueroa

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function ($) {
    if (typeof (Raphael) == 'undefined') {
        console.log("jQuery Coachy: I need Raphael JS in order to work. http://raphaeljs.com")
        return;
    }

    // RaphaelJS Extension:
    // show arrow from [origin]:(point) to [$elm]:(jQuery wrapped DOM Element), with arrow head [size] and line [stoke] width
    Raphael.fn.arrowForElement = function (origin, $elm, size, stroke) {
        var cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0
        var curve = 200;
        var perfectPos = $.fn.getPointingSpotForBox($elm, origin.x, origin.y, 15);
        var x1 = perfectPos.x, y1 = perfectPos.y;
        var boxMaxX = $elm.offset().left + $elm.outerWidth(),
            boxMaxY = $elm.offset().top + $elm.outerHeight();
        if (origin.x > x1 && origin.y > y1) { //arrow diag from bottom right to top left 
            cx1 = origin.x - curve; cy1 = origin.y; cx2 = x1;
            if (boxMaxY > origin.y) cy2 = y1 - curve;
            else cy2 = y1 + curve;
        } else if (origin.x < x1 && origin.y < y1) { //arrow diag from top left to bottom right 
            cx1 = origin.x + curve; cy1 = origin.y; cx2 = x1; cy2 = y1 - curve;
        } else if (origin.x > x1 && origin.y < y1) { //arrow diag from top right to bottom left
            cx1 = origin.x - curve; cy1 = origin.y; cx2 = x1; cy2 = y1 - curve;
        } else if (origin.x < x1 && origin.y > y1) { //arrow diag from bottom left to top right 
            cx1 = origin.x + curve; cy1 = origin.y; cx2 = x1;
            if (boxMaxY > origin.y) cy2 = y1 - curve;
            else cy2 = y1 + curve;
        } else if (origin.y == y1 && origin.x != x1) { //straight horizontal line
            cx1 = origin.x; cy1 = origin.y - 100; cx2 = x1; cy2 = y1 - 100;
        } else if (origin.y != y1 && origin.x == x1) { //straight vertical line
            cx1 = origin.x + 100; cy1 = origin.y; cx2 = x1 + 100; cy2 = y1;
        } else if (origin.y == y1 && origin.x == x1) { //dot
            cx1 = origin.x; cy1 = origin.y; cx2 = x1; cy2 = y1;
        }

        var linePath = this.path("M" + origin.x + " " + origin.y + " C" + cx1 + " " + cy1 + " " + cx2 + " " + cy2 + " " + x1 + " " + y1).attr({ "stroke-width": "1px", stroke: stroke });
        var point = linePath.getPointAtLength(linePath.getTotalLength() - 10);
        var angle = Raphael.angle(point.x, point.y, x1, y1);
        var arrowPath = this.path(
                        "M" + x1 + " " + y1 +
                        " L" + ((x1 - 10) - (size * 2)) + " " + (y1 - (size * 2)) +
                        " L" + ((x1 - 10) - (size * 2)) + " " + (y1 + (size * 2)) +
                        " L" + x1 + " " + y1
                        )
                        .rotate((angle + 180), x1, y1)
                        .attr({ "fill": stroke, "stroke": stroke, "stroke-width": "1px" });
        return { finalX: x1, finalY: y1, linePath: linePath, arrowPath: arrowPath };
    }

    // where to point the arrow if the object is a box?
    $.fn.getPointingSpotForBox = function ($elem, arrowOriginX, arrowOriginY, customOffset) {
        // measuring element
        var elmOffset = $elem.offset();
        var elmWidth = $elem.outerWidth();
        var elmHeight = $elem.outerHeight();
        // corners
        var elmX0 = elmOffset.left;
        var elmX1 = elmOffset.left + elmWidth;
        var elmY0 = elmOffset.top;
        var elmY1 = elmOffset.top + elmHeight;
        // variables to return
        var xRet, yRet;
        // offseting arrow in relation to element
        if (!customOffset) customOffset = 10;
        //
        // now where should it point to? (without invading element area) 
        // _____
        // -> X:
        // arrowOrigin is at left of the element? lets point to it's right border
        //// ALWAYS PONTING TO MIDDLE OF WIDTH:
        xRet = elmX0 + ((elmX1 - elmX0) / 2);
        ////if (elmX1 < arrowOriginX) {
        ////    xRet = elmX0 + ((elmX1 - elmX0) / 2);// - customOffset;
        ////}
        ////    // arrowOrigin is about the same x ? lets point to it's middle width
        ////else if (elmX0 <= arrowOriginX && elmX1 >= arrowOriginX) {
        ////    xRet = elmX0 + ((elmX1 - elmX0) / 2);
        ////}
        ////    // arrowOrigin is at right of the element ! lets point to it's left border
        ////else {
        ////    xRet = elmX0 + ((elmX1 - elmX0) / 2);// - customOffset;
        ////}
        // _____
        // -> Y:
        // arrowOrigin is below element? lets point to it's bottom border
        if (elmY1 < arrowOriginY) {
            yRet = elmY1 + customOffset;
        }
            // arrowOrigin is about the same Y ? lets point to it's middle height
            //else if (elmY0 <= arrowOriginY && elmY1 >= arrowOriginY) {
            //    yRet = elmY0;// + ((elmY1 - elmY0) / 2);
            //}
            // arrowOrigin is above the element ! lets point to it's top border
        else {
            yRet = elmY0 - customOffset;
        }
        return { x: xRet, y: yRet };
    };

    $.fn.extend({
        coachy: function (options) {
            // UID for jQueryCoachy
            var id = "__jquerycoachy__" + parseInt(Math.random() * 10);
            // defaults:
            var defaults = {
                on: "customEventIn",
                off: "customEventOut",
                arrow: {
                    x1: $(window).width() / 2,
                    y1: $(window).height() / 2
                },
                zindex: "-999999",
                opacity: 0.8,
                theme: "white",
                message: "jQuery Coachy!",
                bringToFront: true, // bring element to front with z-index
                autoOpen: false,
                life: 0 // 0(ms) => stays forever
            };
            //options extend defaults
            var options = $.extend(defaults, options);
            //reference to plugin:
            var plugin = this;


            // Coachy is binded to the elements

            // bind event to show coachy on "option.on events" on elements
            $(document).on(options.on, this.selector, function () {
                var x1 = options.arrow.x1,
                    y1 = options.arrow.y1;
                var windowX = $(window).width();
                var windowY = $(window).height();
                // coachy div
                var div = $("<div />").attr("id", id);
                div.css({
                    "position": "absolute",
                    "top": 0,
                    "left": 0,
                    "z-index": options.zindex,
                    "background": options.theme == "white" ? "black" : "white",
                    "opacity": 0,
                    "pointer-events": " none"
                });
                //injected
                $("body").append(div);
                //fadeIn
                div.data('initialopacity',div.css('opacity')).stop().animate({ opacity: options.opacity }, 500);

                var $elm = $(this);
                if (options.bringToFront) {
                    $elm.attr('data-z-index', $elm.css('z-index'));
                    $elm.css('z-index', options.zindex + 10);
                }
                // raphaelJS canvas
                var paper = new Raphael(document.getElementById(id), windowX, windowY);
                //draw arrow
                var finalArrow = paper.arrowForElement(
                    /*arrow*/{ x: x1, y: y1 },
                    /*elementBox*/$elm,
                    5, options.theme);

                // text optimal offset
                var offsetX = (x1 < finalArrow.finalX) ? offsetX = -30 : offsetX = 30;
                var offsetY = (y1 < finalArrow.finalY) ? offsetY = -30 : offsetY = 30;

                // show text
                paper.text(x1 + offsetX, y1 + offsetY, options.message).attr({
                    font: "Helvetica",
                    "font-size": "25px",
                    stroke: options.theme,
                    fill: options.theme
                });

                // unbind on event
                $(this).off(options.on);
                $("#" + id + " > svg").css("pointer-events", " none");

                // has limited lifetime?
                if (options.life > 0) {
                    console.log('has lifetime:'+options.life);
                    var $plugin = $(this);
                    // autoHide clear function: cleartimeout so that it doesnt conflict with other dispatches of the "off" event
                    var autoHideClear = function () {
                        console.log('autoHideClear!');
                        clearTimeout(autoHideTO);
                        $plugin.off(options.off, autoHideClear);
                    }
                    // clear lifetime layout 
                    $plugin.on(options.off, autoHideClear);
                    // setTimeout to hide when lifetime runs out
                    var autoHideTO = setTimeout(function () {
                        console.log('autoHideTimeOut called!');
                        $plugin.trigger(options.off)
                    },options.life)
                }
            });

            // autoOpen?
            if (options.autoOpen) {
                this.trigger(options.on);
            }

            // return
            return this.each(function () {
                var o = options;
                var obj = $(this);
                obj.on(o.off, function (e) {
                    $("#" + id).stop().animate({ opacity: $("#" + id).data('initialopacity') }, 500, function () {
                        if (o.bringToFront) {
                            obj.css('z-index', obj.attr('data-z-index'));
                        }
                        $(this).remove();
                    });
                    
                });
                // to close Coachy on ESC Key
                $(document).bind("keypress", function (e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 27) {
                        $("#" + id).remove();
                    }
                })
            });
        }
    });
})(jQuery);