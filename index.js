export default function(settings) {
  const types = settings.types;
  const template = settings.template;

  const WEBPACK_PROP = "webpackRequireWeakId";
  const SERVER_PROP = "serverSideRequirePath";

  const webpackTemplate = template(`() => require.resolveWeak(MODULE)`);
  const serverTemplate = template(`PATH.join(__dirname, MODULE)`);

  return {
    visitor: {
      ImportDeclaration: function(path) {
        const opts = {
          server: true,
          webpack: false,
          source: 'react-loadable',
          ...this.opts
        };

        if (!opts.server && !opts.webpack) return;

        const source = path.node.source.value;
        if (source !== opts.source) return;

        const defaultSpecifier = path.get("specifiers").find(specifier => {
          return specifier.isImportDefaultSpecifier();
        });

        if (!defaultSpecifier) return;

        const bindingName = defaultSpecifier.node.local.name;
        const binding = path.scope.getBinding(bindingName);

        binding.referencePaths.forEach(refPath => {
          const callExpression = refPath.parentPath;
          if (!callExpression.isCallExpression()) return;

          const args = callExpression.get("arguments");
          if (args.length !== 1) throw callExpression.error;

          const options = args[0];
          if (!options.isObjectExpression()) return;

          const properties = options.get("properties");
          const propertiesMap = {};

          properties.forEach(property => {
            const key = property.get("key");
            propertiesMap[key.node.name] = property;
          });

          if (
            (!opts.webpack || properties[WEBPACK_PROP]) &&
            (!opts.server || properties[SERVER_PROP])
          ) {
            return;
          }

          const loaderMethod = propertiesMap.loader.get("value");
          let dynamicImport;

          loaderMethod.traverse({
            Import: function Import(path) {
              dynamicImport = path.parentPath;
              path.stop();
            }
          });

          if (!dynamicImport) return;

          const importedModule = dynamicImport.get("arguments")[0];

          if (opts.webpack && !propertiesMap[WEBPACK_PROP]) {
            const webpack = webpackTemplate({
              MODULE: importedModule.node
            }).expression;

            propertiesMap.loader.insertAfter(
              types.objectProperty(types.identifier(WEBPACK_PROP), webpack)
            );
          }

          if (opts.server && !propertiesMap[SERVER_PROP]) {
            const server = serverTemplate({
              PATH: this.addImport("path", "default", "path"),
              MODULE: importedModule.node
            }).expression;

            propertiesMap.loader.insertAfter(
              types.objectProperty(types.identifier(SERVER_PROP), server)
            );
          }
        });
      }
    }
  };
}
