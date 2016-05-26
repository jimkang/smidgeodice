HOMEDIR = $(shell pwd)
USER = bot
PRIVUSER = root
SERVER = smidgeo
SSHCMD = ssh $(USER)@$(SERVER)
PRIVSSHCMD = ssh $(PRIVUSER)@$(SERVER)
PROJECTNAME = smidgeodice
APPDIR = /opt/$(PROJECTNAME)

test:
	node tests/replytests.js
	node tests/rollstotweetstests.js

restart-server:
	$(PRIVSSHCMD) service $(PROJECTNAME) restart

restart-webhook-server:
	$(PRIVSSHCMD) service $(PROJECTNAME)-webhook restart

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt/ --exclude node_modules/
	$(SSHCMD) "cd  $(APPDIR) && chmod u+x $(PROJECTNAME)-server.js && \
		chmod u+x $(PROJECTNAME)-webhook-server.js && \
		npm prune && npm install"
	$(PRIVSSHCMD) "systemctl restart $(PROJECTNAME) && systemctl restart $(PROJECTNAME)-webhook"

install-services:
	$(PRIVSSHCMD) "cp $(APPDIR)/*.service /etc/systemd/system && \
		systemctl daemon-reload"

check-status:
	$(SSHCMD) "systemctl status $(PROJECTNAME)"
	$(SSHCMD) "systemctl status $(PROJECTNAME)-webhook"
