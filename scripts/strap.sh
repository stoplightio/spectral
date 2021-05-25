mkdir -p ./node_modules/@stoplight/spectral-functions && cp -r ./dist/functions/* ./node_modules/@stoplight/spectral-functions
echo '{"name": "@stoplight/spectral-functions", "main": "./index.js" }' > ./node_modules/@stoplight/spectral-functions/package.json

mkdir -p ./node_modules/@stoplight/spectral-formats && cp -r ./dist/formats/* ./node_modules/@stoplight/spectral-formats
echo '{"name": "@stoplight/spectral-formats", "main": "./index.js" }' > ./node_modules/@stoplight/spectral-formats/package.json

mkdir -p ./node_modules/@stoplight/spectral-utils && cp -r ./dist/utils/* ./node_modules/@stoplight/spectral-utils
echo '{"name": "@stoplight/spectral-utils", "main": "./index.js" }' > ./node_modules/@stoplight/spectral-utils/package.json

mkdir -p ./node_modules/@stoplight/spectral-rulesets && cp -r ./dist/rulesets/* ./node_modules/@stoplight/spectral-rulesets
echo '{"name": "@stoplight/spectral-rulesets", "main": "./index.js" }' > ./node_modules/@stoplight/spectral-rulesets/package.json

mkdir -p ./node_modules/@stoplight/spectral-core && cp -r ./dist/* ./node_modules/@stoplight/spectral-core
echo '{"name": "@stoplight/spectral-core", "main": "./index.js" }' > ./node_modules/@stoplight/spectral-core/package.json
