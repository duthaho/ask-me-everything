(function($) {
    'use strict';

    var mdGridJs = function(el, options) {
        var optDefaut = {
            gridInner: '.grid__inner',
            gridSize: '.grid-sizer',
            gridItem: '.grid-item',
            gridItemInner: '.grid-item__inner',
            gridStyle: '.grid-css--masonry', 
            gridFilter: '.grid__filter', 
            dataLg: 4,
            dataMd: 3,
            dataSm: 2,
            dataXs: 1,
            dataGutter: 0,
            dataRatio: 100,
            breakpoint: {
                lg: 1200,
                md: 990,
                sm: 767,
                xs: 0
            }
        }

        this.opts= $.extend(optDefaut, options);
        this.el = $(el);
        this.gridInner =  this.el.find(this.opts.gridInner);
        this.gridSize = this.opts.gridSize;
        this.gridItem = this.opts.gridItem;
        this.gridItemInner = this.opts.gridItemInner;
        this.gridStyle = this.opts.gridStyle.replace(/^\./g, '');
        this.gridFilter = this.el.find(this.opts.gridFilter);
        this.dataLg =  this.el.data('col-lg') ?  this.el.data('col-lg') :  this.opts.dataLg;
        this.dataMd =  this.el.data('col-md') ?  this.el.data('col-md') :  this.opts.dataMd;
        this.dataSm =  this.el.data('col-sm') ?  this.el.data('col-sm') :  this.opts.dataSm;
        this.dataXs =  this.el.data('col-xs') ?  this.el.data('col-xs') :  this.opts.dataXs;
        this.dataGutter =  this.el.data('gutter') ?  this.el.data('gutter') :  this.opts.dataGutter;
        this.dataRatio =  this.el.data('ratio') ?  this.el.data('ratio') :  this.opts.dataRatio;
        this.breakpoint = this.opts.breakpoint;
        this.init();
    }

    mdGridJs.prototype = {
        init: function() {
            this.onLoad();
            this.createGrid();
            this.resizeBound();
            this.setGridFilter();
            this.onResize();
        },

        createGrid : function() {
            var layout;
            if( this.el.hasClass('grid-packery') ) {
                layout = 'packery'
            }else {
                layout = 'masonry'
            }

            var options = {
                layoutMode: layout,
                itemSelector: this.gridItem,
                masonry: {
                    columnWidth: this.gridSize
                },
            };

            $(this.gridInner).imagesLoaded($.proxy(function() {
                $(this.gridInner).isotope(options);
            }, this));
        },

        resizeBound: function() {
            if (typeof Outlayer !== 'undefined') {
                $.extend(Outlayer.prototype, {
                    resize: function() {
                        if (!this.isResizeBound) {
                            return;
                        }
                        this.layout();
                    }
                });
            }
        },

        getColumn: function(column) {
            this.setGridInner();
            this.setSize(column);
            this.dataItemElm();
        },

        windowWidth: function() {
            return window.innerWidth;
        },

        getGridInner: function() {
            return $(this.gridInner).width();
        },

        setGridInner: function() {
            this.gridInner.css({
                'margin-left': -this.dataGutter / 2,
                'margin-right': -this.dataGutter / 2,
            })
        },

        getSize: function(column) {
            return Math.floor(this.getGridInner() / column);
        },

        setSize: function(column) {
            $(this.gridSize, this.gridInner).css({
                'width': this.getSize(column)
            });
        },

        getItemElm: function() {
           return this.el.find(this.gridItem);
        },

        dataItemElm: function() {
            var _this = this,
                item = this.getItemElm(),
                column = _this.checkBreakpoint(),
                sizer = this.getSize(column);
            item.each(function() {
                var itemElm = $(this),
                    colspan = itemElm.data('colspan') ? itemElm.data('colspan') : 1,
                    rowspan = itemElm.data('rowspan') ? itemElm.data('rowspan') : 1;

                _this.setItemElm(itemElm, sizer, column, colspan, rowspan);
            });
        },

        setItemElm: function(itemElm, sizer, column, colspan, rowspan){
            var width = sizer,
                height,
                ratio = this.dataRatio;
            
            height = Math.floor((sizer*ratio) / 100 ) * rowspan;

            if( column >= colspan ) {
                width = sizer * colspan;
            }else {
                width = sizer * column;
                
                if( colspan == rowspan ) {
                    height = Math.floor((sizer*ratio) / 100);
                }
            }

            if( this.el.hasClass(this.gridStyle) ) {
                height = ''
            }

            itemElm.css({
                'width': width,
                'height': height,
            });
            this.setSpacing(itemElm);
        },

        setSpacing: function(itemElm) {
            var gutterHalf = this.dataGutter / 2,
                item = itemElm.find(this.gridItemInner);

            if( this.el.hasClass(this.gridStyle)) {
                item.css({
                    'position': 'relative',
                    'padding-top': gutterHalf,
                    'padding-bottom': gutterHalf,
                    'padding-left': gutterHalf,
                    'padding-right': gutterHalf,
                })
            }else {
                item.css({
                    'position': 'absolute',
                    'top': gutterHalf,
                    'left': gutterHalf,
                    'bottom': gutterHalf,
                    'right': gutterHalf,
                })
            }
        },

        setGridFilter: function() {
            if(this.gridFilter) {
                var _this = this;
                _this.gridFilter.on('click', 'a', function(event) {
                    event.preventDefault();
                    var self = $(event.currentTarget),
                        filter = self.data().filter;
                    
                    $(_this.gridInner).isotope({
                        filter: filter
                    });

                    _this.gridFilter.find('.current').removeClass('current');
                    self.closest('li').addClass('current');
                });
            }
        },

        checkBreakpoint: function() {
            var width = window.innerWidth;
            var match = -1,
                column;


            if ( this.breakpoint.xs <= width && this.breakpoint.xs > match) {
                column = this.dataXs;
                match = Number(this.breakpoint.xs);

            }

            if ( this.breakpoint.sm <= width && this.breakpoint.sm > match) {
                match = Number(this.breakpoint.sm);
                 column = this.dataSm;
            }

            if ( this.breakpoint.md <= width && this.breakpoint.md > match) {
                match = Number(this.breakpoint.md);
                 column = this.dataMd;
            }

            if ( this.breakpoint.lg <= width && this.breakpoint.lg > match) {
                match = Number(this.breakpoint.lg);
                column = this.dataLg;
            }

            return column; 
        },

        onResize: function() {
            var _this = this,
                setimeout,
                column = _this.checkBreakpoint();

            _this.getColumn(column);

            $(window).on('resize', function() {
                setimeout = setTimeout(function() {
                    column = _this.checkBreakpoint();
                    _this.getColumn(column);
                    
                    clearTimeout(setimeout)
                }, 50);
            })
        },

        onLoad: function() {
            var _this = this;
            setTimeout(function() {
                _this.el.removeClass('grid-loading');
            }, 50);
        }
    }

    $.fn.mdGridJs = function(opt) {
        return this.each(function() {
            var $this = $(this),
                data;

            data = new mdGridJs($this, opt);
        });
    }

})(jQuery);