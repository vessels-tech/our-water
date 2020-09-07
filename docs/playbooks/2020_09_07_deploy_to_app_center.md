# Deploy to App Center



## 1. Build and deploy mywell-dev
```bash
cd ow_client
make switch-mywell-dev

nvm use 10.15.3
# rebuild ready for dev distribution
make reinstall-node bundle build-production

# upload to hockeyapp
make upload-test
```


## 2. Build and deploy mywell

```bash
cd ow_client
make switch-mywell-prod

nvm use 10.15.3
# rebuild ready for dev distribution
make reinstall-node bundle build-production

# upload to hockeyapp
make upload-test
```