rm -r $(dirname $0)/../lib/dist
$(dirname $0)/npm-build-all.sh
cd $(dirname $0)/../lib/dist
npm pack core/
npm pack content-services/
cd ../../../alfresco-content-app
rm -R node_modules/@alfresco/adf-core
rm -R node_modules/@alfresco/adf-content-services
npm install ../alfresco-ng2-components/lib/dist/alfresco-adf-core-2.6.1.tgz
npm install ../alfresco-ng2-components/lib/dist/alfresco-adf-content-services-2.6.1.tgz
