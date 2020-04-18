$(document).ready(function () {
  function gridJs() {
    $(".grid-css").mdGridJs();
  }

  function dropdonwJs() {
    $(".dropdownJs").on("click", function (e) {
      e.stopPropagation();
      var self = $(this);

      if (!self.hasClass("active")) {
        $(".dropdownJs").removeClass("active");
        $(".dropdownJs").next().hide();
        self.addClass("active");
        self.next().slideDown();
      } else {
        self.next().slideUp();
        self.removeClass("active");
      }

      // self.next().slideDown();

      self.next().on("click", function (e) {
        e.stopPropagation();
      });

      $("body").on("click", function () {
        $(".dropdownJs").next().hide();
      });
    });
  }

  function openStarredMini() {
    $(".open-starred-mini").on("click", function (e) {
      e.stopPropagation();
      $(".starred-popup").toggleClass("starred-popup-show");

      $("body").on("click", function (e) {
        $(".starred-popup").removeClass("starred-popup-show");
      });

      $(".starred-popup").on("click", function (e) {
        e.stopPropagation();
      });
    });
  }

  function clickMenuMobile() {
    $(".header__iconmenu").on("click", function () {
      $(".header__nav").toggleClass("header__nav-active");
    });
  }

  function widgetJs() {
    $(".widgetJs .widget__title").on("click", function () {
      var self = $(this);

      self.toggleClass("active");
      self.next().slideToggle();
    });
  }

  function stickyJs() {
    $(".stickyJs .sticky").theiaStickySidebar({
      minWidth: 1200,
      additionalMarginTop: 60,
    });
  }

  function slideRange() {
    $(".slider-range").each(function () {
      var self = $(this),
        _max = parseInt(self.attr("data-max")),
        _min = parseInt(self.attr("data-min"));

      self.slider({
        range: true,
        min: _min,
        max: _max,
        values: [_min, _max],
        slide: function (event, ui) {
          // $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
        },
      });
    });
  }

  function sidebarFilterMobile() {
    $(".sidebar-filter-mobile__icon").on("click", "a", function () {
      var self = $(this),
        target = self.attr("data-item");

      console.log(target);

      $("#mb-popup-widget-modal").on("show.bs.modal", function (event) {
        $(event.currentTarget).find(".mb-popup-widget").hide();
        $(event.currentTarget)
          .find('.mb-popup-widget[data-item="' + target + '"]')
          .show();
      });
    });
  }

  function onAskMe() {
    $("#ask-me").on("click", function (event) {
      event.preventDefault();
      var q = $("#ask-me-q").val();
      if (!q) return;
      $("#ask-me-loading").show();
      $(".lds-hourglass").show();
      $.ajax({
        method: "POST",
        url: "/api/ask-me",
        data: { q },
      })
        .done(function (res) {
          const { data = [] } = res;
          if (data.length > 0) {
            const { answer, vote, link } = data[0];

            $(".itinerary-overview")
              .html(answer)
              .attr("data-time", vote + " votes");
            $("#ask-me-link").attr("href", link);
            $("#ask-me-link > span").text(link);
          }
          $("#ask-me-loading").hide();
          $(".lds-hourglass").hide();
        })
        .fail(function () {
          $("#ask-me-loading").hide();
          $(".lds-hourglass").hide();
        });
    });
  }

  onAskMe();
  sidebarFilterMobile();
  slideRange();
  dropdonwJs();
  openStarredMini();
  clickMenuMobile();
  widgetJs();
  stickyJs();

  $(window).on("load", function () {
    gridJs();
    $("#ask-me-loading").hide();
    $(".lds-hourglass").hide();
  });
});
