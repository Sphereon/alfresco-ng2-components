$(dirname $0)/npm-build-all.sh
cd $(dirname $0)/../lib/dist
npm pack content-services
cd $(dirname $0)/../alfresco-content-app
npm install ../alfresco-ng2-components/lib/dist/alfresco-adf-content-services-2.6.1.tgz
cd ../alfresco-ng2-components
