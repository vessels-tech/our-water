# Deploy to App Center


```bash
cd ow_client
make switch-mywell-dev

nvm use 10.15.3
# rebuild ready for dev distribution
make reinstall-node bundle build-production

# upload to hockeyapp
make hockey


```