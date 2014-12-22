#!/usr/bin/env python

import urllib

def img2base64(img):
    return open(img, "rb").read().encode("base64").replace('\n', '')

disabled_base64 = img2base64("assets/no-js.png")
enabled_base64 = img2base64("assets/jsenabled.png")


data = open('bootstrap.js')
output = []
for line in data.readlines():
    if line.startswith('const DISABLED_ICON'):
        line = 'const DISABLED_ICON = "data:image/png;base64,%s";\n' % disabled_base64
    if line.startswith('const ENABLED_ICON'):
        line = 'const ENABLED_ICON = "data:image/png;base64,%s";\n' % enabled_base64
    output.append(line)

data.close()
data = open('bootstrap.js', 'w')
for line in output:
    data.write(line)
data.close()
data = open('index.html', 'w')
data.write("<img src='data:image/png;base64,%s'>" % disabled_base64)
data.write("<img src='data:image/png;base64,%s'>" % enabled_base64)
data.close()
