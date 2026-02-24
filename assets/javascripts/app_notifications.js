/**
 * Add notification badge (pill) to favicon in browser tab
 * @url stackoverflow.com/questions/65719387/
 */
class Badger {
  constructor(options) {
    Object.assign(
      this,
      {
        backgroundColor: "#f00",
        color: "#fff",
        size: 0.6, // 0..1 (Scale in respect to the favicon image size)
        position: "ne", // Position inside favicon "n", "e", "s", "w", "ne", "nw", "se", "sw"
        radius: 8, // Border radius
        //srcs: [""],        // Favicon source (dafaults to the <link> icon href)
        onChange() {},
      },
      options
    );
    this.canvas = document.createElement("canvas");
    this.srcs = this.srcs || this.faviconELs.map((a) => a.getAttribute("href"));
    this.ctx = this.canvas.getContext("2d");
  }

  faviconELs = Array.from(document.querySelectorAll("link[rel$=icon]"));

  _drawIcon(idx) {
    this.ctx.clearRect(0, 0, this.faviconSize[idx], this.faviconSize[idx]);
    this.ctx.drawImage(
      this.img[idx],
      0,
      0,
      this.faviconSize[idx],
      this.faviconSize[idx]
    );
  }

  _drawShape(idx) {
    const r = this.radius;
    const xa = this.offset[idx].x;
    const ya = this.offset[idx].y;
    const xb = this.offset[idx].x + this.badgeSize[idx];
    const yb = this.offset[idx].y + this.badgeSize[idx];
    this.ctx.beginPath();
    this.ctx.moveTo(xb - r, ya);
    this.ctx.quadraticCurveTo(xb, ya, xb, ya + r);
    this.ctx.lineTo(xb, yb - r);
    this.ctx.quadraticCurveTo(xb, yb, xb - r, yb);
    this.ctx.lineTo(xa + r, yb);
    this.ctx.quadraticCurveTo(xa, yb, xa, yb - r);
    this.ctx.lineTo(xa, ya + r);
    this.ctx.quadraticCurveTo(xa, ya, xa + r, ya);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fill();
    this.ctx.closePath();
  }

  _drawVal(idx) {
    const margin = (this.badgeSize[idx] * 0.18) / 2;
    this.ctx.beginPath();
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    this.ctx.font = `bold ${this.badgeSize * 0.82}px Arial`;
    this.ctx.fillStyle = this.color;
    this.ctx.fillText(
      this.value,
      this.badgeSize[idx] / 2 + this.offset[idx].x,
      this.badgeSize[idx] / 2 + this.offset[idx].y + margin
    );
    this.ctx.closePath();
  }

  _drawFavicon(idx) {
    this.faviconELs[idx].setAttribute("href", this.dataURL);
  }

  _draw(idx) {
    this._drawIcon(idx);
    if (this.value) this._drawShape(idx);
    if (this.value) this._drawVal(idx);
    this._drawFavicon(idx);
  }

  _setup(idx) {
    this.faviconSize ||= new Array();
    this.badgeSize ||= new Array();
    this.offset ||= new Array();

    this.faviconSize[idx] = this.img[idx].naturalWidth;
    this.badgeSize[idx] = this.faviconSize[idx] * this.size;
    this.canvas.width = this.faviconSize[idx];
    this.canvas.height = this.faviconSize[idx];
    const sd = this.faviconSize[idx] - this.badgeSize[idx];
    const sd2 = sd / 2;
    this.offset[idx] = {
      n: { x: sd2, y: 0 },
      e: { x: sd, y: sd2 },
      s: { x: sd2, y: sd },
      w: { x: 0, y: sd2 },
      nw: { x: 0, y: 0 },
      ne: { x: sd, y: 0 },
      sw: { x: 0, y: sd },
      se: { x: sd, y: sd },
    }[this.position];
  }

  // Public functions / methods:

  update(idx) {
    idx = idx || 0;
    this._value = Math.min(99, parseInt(this._value, 10));
    if (this.img && this.img[idx]) {
      this._draw(idx);
      if (this.onChange) this.onChange.call(this);
    } else {
      this.img = this.img || new Array();
      this.img[idx] = new Image();
      this.img[idx].addEventListener("load", () => {
        this._setup(idx);
        this._draw(idx);
        if (this.onChange) this.onChange.call(this);
      });
      this.img[idx].src = this.srcs[idx];
    }
  }

  get dataURL() {
    return this.canvas.toDataURL();
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    for (var i = 0; i < this.faviconELs.length; i++) this.update(i);
  }
}

function urlSetParam(uri, key, val) {
  return uri
    .replace(
      new RegExp("([?&]" + key + "(?=[=&#]|$)[^#&]*|(?=#|$))"),
      "&" + key + "=" + encodeURIComponent(val)
    )
    .replace(/^([^?&]+)&/, "$1?");
}

var appNotificationsBadger;

$(document).ready(function () {
  appNotificationsBadger = new Badger({});

  // Live update value example:
  //appNotificationsBadger.value = 0;
  //let aSpan = $('#notificationsLink').parent().prepend('<span></span>');
  let notificationLink = $("#notificationsLink");
  let aParent = notificationLink.parent();
  let aSpan = $(document.createElement("span"));
  let newLink = $(
    '<a href="' +
      $("#notificationsLink").attr("href") +
      '" id="notification_count">&nbsp;</a>'
  );
  newLink.hide();

  notificationLink.detach();
  aSpan.append(notificationLink);

  notificationLink.after(newLink);
  aParent.append(aSpan);

  $("#notificationsLink").click(function () {
    $("#notificationsContainer").remove();

    $.ajax({
      type: "GET",
      url: $(this).attr("href"),
      dataType: "html",
      success: function (data) {
        $("#notificationsLink").parent().addClass("notification_li");
        $("#notificationsLink").parent().append(data);
        $("#notificationsContainer").fadeToggle(300);
      },
    });

    return false;
  });

  //Document Click
  $(document).click(function () {
    $("#notificationsContainer").hide();
  });
  //Popup Click
  $("#notificationsContainer").click(function () {
    return false;
  });

  $(".view-notification").click(function () {
    var link = $(this);

    $.ajax({
      type: "GET",
      url: $(this).attr("href"),
      dataType: "html",
      success: function () {
        //link.parent().removeClass( "new" );
        //link.remove();
      },
    });

    // single notification toggle
    if (link.parent().hasClass("notification")) {
      if (link.parent().hasClass("new")) {
        link.parent().removeClass("new");
        link.attr("href", urlSetParam(link.attr("href"), "mark_as_unseen", ""));
        link.text(locale_str_mark_as_unseen).fadeIn();
      } else {
        link.parent().addClass("new");
        link.attr("href", urlSetParam(link.attr("href"), "mark_as_unseen", 1));
        link.text(locale_str_mark_as_seen).fadeIn();
      }
    }
    // group notices toogle
    else {
      if (link.parent().parent().parent().hasClass("new")) {
        group_parent = link.parent().parent().parent();
        group_parent.removeClass("new");
        all_links = group_parent.find(".view-notification");
        all_links.attr(
          "href",
          urlSetParam(all_links.attr("href"), "mark_as_unseen", "")
        );
        all_links.text(locale_str_mark_as_unseen).fadeIn();
      } else {
        link.parent().addClass("notification new"); // Mark as seen only for single notification
        link.attr("href", urlSetParam(link.attr("href"), "mark_as_unseen", 1));
        link.text(locale_str_mark_as_seen).fadeIn();
      }
    }

    return false;
  });

  if ($("#notificationsLink").length > 0) {
    // in case of double Login Popup Window at signin page
    $.ajax({
      type: "GET",
      url: "/app-notifications/unread-number/",
      dataType: "json",
      success: function (data) {
        $("#notification_count").text(data);
        appNotificationsBadger.value = data;
        if (!isNaN(parseInt(data)) && parseInt(data) > 0) {
          $("#notification_count").show();
        } else {
          $("#notification_count").hide();
        }
      },
    });
  }

  $("#notification_count").click(function () {
    window.open("/app-notifications/", "_blank");
  });

  $("#notification_count").hover(function () {
    $(this).css("cursor", "pointer");
  });

  function getIssueIdFromMessage(message) {
    return message.match(/#(\d+)/)[1];
  }

  function onShowNotification(url) {
    console.log("notification is shown!");
    //$.get(url);
  }

  function onCloseNotification(id) {
    console.log("notification is closed!");
  }

  function onClickNotification(url) {
    window.focus();
    //sender.close();
    location.href = url;
  }

  function onErrorNotification() {
    console.error(
      "Error showing notification. You may need to request permission."
    );
  }

  function onPermissionGranted() {
    console.log("Permission has been granted by the user");
    doNotification();
  }

  function onPermissionDenied() {
    console.warn("Permission has been denied by the user");
  }

  function doNotification() {
    $.ajax({
      type: "GET",
      url: "/app-notifications/live/",
      dataType: "json",
      success: function (data) {
        if (data.length > 0) {
          for (i in data) {
            var n = new Notify("Redmine #" + data[i].id, {
              body: data[i].title,
              tag: "",
              icon: data[i].icon,
              notifyShow: () => {
                onShowNotification(data[i].url);
              },
              notifyClose: () => {
                onCloseNotification(data[i].id);
              },
              notifyClick: () => {
                onClickNotification(data[i].url, this);
              },
              notifyError: onErrorNotification, //,
              //timeout: 60 // 60 secs
            });
            n.show();
          }
        }
      },
    });
  }

  function enableLiveDesktopNotification() {
    if (typeof Notify !== "undefined") {
      if (!Notify.needsPermission) {
        //doNotification(); // do once at first
        //setInterval(function(){doNotification();}, 120*1000); // then do per 120 secs
      } else if (Notify.isSupported()) {
        Notify.requestPermission(onPermissionGranted, onPermissionDenied);
      }
    }
  }

  if (!AppNotifications.FayeServer || AppNotifications.FayeServer.trim() === '') {
    return true;
  }

  try {
    var client = new Faye.Client(AppNotifications.FayeServer);
  } catch (e) {
    $("#notificationsLink")
      .parent()
      .after(
        '<li><span class="notification-title">Faye server is unreachable.</span></li>'
      );
    return true;
  }

  function showNotification(data) {
    var issueId = getIssueIdFromMessage(data.message);
    var url = AppNotifications.NotificationsUrl +
      "/" +
      data.id +
      "?issue_id=" +
      issueId;    

    var n = new Notify("Redmine", {
      closeOnClick: true,
      body: data.message,
      tag: "notification-" + getIssueIdFromMessage(data.message),
      icon: data.avatar,
      notifyShow: () => {
        onShowNotification(url);
      },
      notifyClose: () => {
        onCloseNotification(data.id);
      },
      notifyClick: () => {
        onClickNotification(url);
      },
      notifyError: onErrorNotification, //,
      //timeout: 60 // 60 secs
    });
    n.show();
  }

  var private_subscription = client.subscribe(
    "/notifications/private/" + AppNotifications.CurrentUserId,
    function (data) {
      /*
      if ($("#notification_count").length == 0) {
        $("#notificationsLink")
          .parent()
          .after("<li><span id='notification_count'></span></li>");
      }
      */
      $("#notification_count").text(data.count);
      appNotificationsBadger.value = data.count;

      var useDesktopNotifications = typeof Notify !== "undefined";

      if (!("Notification" in window) || !useDesktopNotifications) {
        $(document.body).append(
          "<div class='push-notification hide' id='notification-" +
            data.id +
            "'>" +
            data.message +
            "</div>"
        );
        $("#notification-" + data.id)
          .fadeIn("fast")
          .delay(10000)
          .fadeOut(1200, function () {
            $("#notification-" + data.id).remove();
          });
      } else {
        if (Notification.permission === "granted") showNotification(data);
        else if (Notification.permission !== "denied") {
          Notification.requestPermission(function (permission) {
            if (permission === "granted") showNotification(data);
          });
        }
      }
    }
  );

  enableLiveDesktopNotification();
});
