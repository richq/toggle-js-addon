all: disable-javascript.xpi

disable-javascript.xpi: bootstrap.js install.rdf
	zip $@ $^ icon.png


install: disable-javascript.xpi
	adb push disable-javascript.xpi /mnt/sdcard/
	adb shell am start -a android.intent.action.VIEW -c android.intent.category.DEFAULT -d file:///mnt/sdcard/disable-javascript.xpi -n org.mozilla.firefox/.App

