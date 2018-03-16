"use strict";

const $ = require("jquery");
const escape = require("css.escape");
const input = $("#input");
const viewport = $("#viewport");

var serverHash = -1; // eslint-disable-line no-var
var lastMessageId = -1; // eslint-disable-line no-var

module.exports = {
	inputCommands: {collapse, expand, join},
	findCurrentNetworkChan,
	serverHash,
	lastMessageId,
	confirmExit,
	forceFocus,
	scrollIntoViewNicely,
	hasRoleInChannel,
	move,
	resetHeight,
	setNick,
	toggleNotificationMarkers,
	requestIdleCallback,
};

function findCurrentNetworkChan(name) {
	name = name.toLowerCase();

	return $(".network .chan.active")
		.parent(".network")
		.find(".chan")
		.filter(function() {
			return $(this).attr("aria-label").toLowerCase() === name;
		})
		.first();
}

function resetHeight(element) {
	element.style.height = element.style.minHeight;
}

// Given a channel element will determine if the lounge user is one of the supplied roles.
function hasRoleInChannel(channel, roles) {
	if (!channel || !roles) {
		return false;
	}

	const channelID = channel.data("id");
	const network = $("#sidebar .network").has(`.chan[data-id="${channelID}"]`);
	const ownNick = network.data("nick");
	const user = channel.find(`.names-original .user[data-name="${escape(ownNick)}"]`).first();
	return user.parent().is("." + roles.join(", ."));
}

// Triggering click event opens the virtual keyboard on mobile
// This can only be called from another interactive event (e.g. button click)
function forceFocus() {
	input.trigger("click").trigger("focus");
}

// Reusable scrollIntoView parameters for channel list / user list
function scrollIntoViewNicely(el) {
	// Ideally this would use behavior: "smooth", but that does not consistently work in e.g. Chrome
	// https://github.com/iamdustan/smoothscroll/issues/28#issuecomment-364061459
	el.scrollIntoView({block: "nearest", inline: "nearest"});
}

function collapse() {
	$(".chan.active .toggle-button.toggle-preview.opened").click();
	return true;
}

function expand() {
	$(".chan.active .toggle-button.toggle-preview:not(.opened)").click();
	return true;
}

function join(args) {
	const channel = args[0];

	if (channel) {
		const chan = findCurrentNetworkChan(channel);

		if (chan.length) {
			chan.trigger("click");
		}
	}
}

function setNick(nick) {
	$("#nick").text(nick);
}

const favicon = $("#favicon");

function toggleNotificationMarkers(newState) {
	// Toggles the favicon to red when there are unread notifications
	if (favicon.data("toggled") !== newState) {
		const old = favicon.prop("href");
		favicon.prop("href", favicon.data("other"));
		favicon.data("other", old);
		favicon.data("toggled", newState);
	}

	// Toggles a dot on the menu icon when there are unread notifications
	viewport.toggleClass("notified", newState);
}

function confirmExit() {
	if ($(document.body).hasClass("public")) {
		window.onbeforeunload = function() {
			return "Are you sure you want to navigate away from this page?";
		};
	}
}

function move(array, old_index, new_index) {
	if (new_index >= array.length) {
		let k = new_index - array.length;

		while ((k--) + 1) {
			this.push(undefined);
		}
	}

	array.splice(new_index, 0, array.splice(old_index, 1)[0]);
	return array;
}

function requestIdleCallback(callback, timeout) {
	if (window.requestIdleCallback) {
		// During an idle period the user agent will run idle callbacks in FIFO order
		// until either the idle period ends or there are no more idle callbacks eligible to be run.
		window.requestIdleCallback(callback, {timeout});
	} else {
		callback();
	}
}
