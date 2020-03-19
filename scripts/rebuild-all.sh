./scripts/npm-build-all.sh "core"
./scripts/npm-build-all.sh "content-services"
cd lib/dist
rm *.tgz
npm pack core/
npm pack content-services/
cd ../../
