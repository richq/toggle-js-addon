all: disable-javascript.xpi

XPI := disable-javascript.xpi

locales := $(wildcard locale/*/*)

$(XPI): bootstrap.js install.rdf icon.png chrome.manifest $(locales)
	zip $@ $^


install: $(XPI)
	adb push $(XPI) /mnt/sdcard/
	adb shell am start -a android.intent.action.VIEW \
		-c android.intent.category.DEFAULT \
		-d file:///mnt/sdcard/$(XPI) \
		-n org.mozilla.firefox/.App

