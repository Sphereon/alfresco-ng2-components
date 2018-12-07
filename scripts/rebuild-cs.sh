./scripts/npm-build-all.sh "content-services"
cd lib/dist
rm *.tgz
npm pack content-services/
cd ../../
