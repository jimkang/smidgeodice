APPNAME = smidgeodice
HOMEDIR = /var/www/$(APPNAME)
PM2 = $(HOMEDIR)/node_modules/pm2/bin/pm2
GITDIR = /var/repos/$(APPNAME).git
USER = noderunner

test:
	node tests/replytests.js
	node tests/rollstotweetstests.js

run:
	$(PM2) start server.js --name $(APPNAME)

stop:
	$(PM2) stop $(APPNAME)

npm-install:
	cd $(HOMEDIR)
	npm install
	npm prune

sync-worktree-to-git:
	git --work-tree=$(HOMEDIR) --git-dir=$(GITDIR) checkout -f

post-receive: sync-worktree-to-git npm-install stop run

# The idea is for the repo's post-receive hook to simply be (minus the var reference):
# However, it will only work *after* the first time the worktree is synced. That 
# has to be done manually the first time.
# cd /var/www/$(APPNAME) && make post-receive

install-logrotate-conf:
	cp $(HOMEDIR)/admin/logrotate.conf_entry /etc/logrotate.d/$(APPNAME)