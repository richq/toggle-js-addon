all: disable-javascript.xpi

XPI := disable-javascript.xpi

locales := $(wildcard locale/*/*)

$(XPI): bootstrap.js install.rdf icon.png chrome.manifest $(locales)
	zip $@ $^

install: $(XPI)
	adb push $(XPI) /mnt/sdcard/
	ipaddr=$$(ip addr | awk '/inet.*global/{sub("/.*", ""); print $$2 ":8000"}') ; \
	adb shell am start -a android.intent.action.VIEW \
		-c android.intent.category.DEFAULT \
		-d http://$${ipaddr} \
		-n org.mozilla.fennec/.App
	python3 -m http.server

