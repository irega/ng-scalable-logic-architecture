# Angular scalable logic architecture

This project shows a possible implementation of a SPA architecture (Single Page Application) for a client that must satisfy the following requirements:

* Same application available to different variants.
* Scalable: add a new variant or extend an existing one without effort.
* Reuse code between different variants.

In the example, each variant is a car manufacturer. In this way, we have a different application for each manufacturer, developing on a single project and reusing most of the code.

For code reuse we can support on the native inheritance of classes in Typescript, with the "paths" property (aliases) in the compilation options. These compilation options, as well as the webpack configuration, are generated dynamically with gulp when we are building the project for each of the manufacturers.

## Setup

Execute from the project root:

```shell
npm install
```

## Scripts

* Generate tsconfig for a specific manufacturer:

```shell
npm run create-tsconfig -- --manufacturer honda
```

The available manufacturers can be consulted in the "manufacturers" property into the configuration of the "package.json" file.

This script can be useful so that the IDE loads correctly all the references and we have, for example, "intellisense" about the variant with which we are currently working.

* Build the application for a specific manufacturer:

```shell
npm run build-dev -- --manufacturer honda
```

Webpack devserver with hot module replacement will be executed on the port indicated in the configuration of the "package.json" file.

* Build the application for all manufacturers:

```shell
npm run build-prod
```

The same application will be built for each of the manufacturers, generating it in different folders within the publication path.

* Lint:

```shell
npm run lint
```