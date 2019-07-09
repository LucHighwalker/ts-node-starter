if [ "$ENVIRONMENT" = "dev" ]; then
    nodemon
else
    ts-node ./src/index.ts
fi