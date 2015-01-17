PM2 = node_modules/pm2/bin/pm2

test:
	node tests/replytests.js
	node tests/rollstotweetstests.js

run:
	$(PM2) start server.js --name r0llbot

stop:
	$(PM2) stop r0llbot
