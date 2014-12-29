all: disable-javascript.xpi

XPI := disable-javascript.xpi

$(XPI): bootstrap.js install.rdf icon.png
	zip $@ $^


install: $(XPI)
	adb push $(XPI) /mnt/sdcard/
	adb shell am start -a android.intent.action.VIEW \
		-c android.intent.category.DEFAULT \
		-d file:///mnt/sdcard/$(XPI) \
		-n org.mozilla.firefox/.App

