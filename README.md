# A customized Copy of react-loadable/babel plugin

This is a replica of [react-loadable](https://github.com/thejameskyle/react-loadable)'s babel plugin.

## Notable Differences:
1. Removed flow based personal preference.
2. Added an option `source` to specify the name of the imported library, defaults to "react-loadable".
3. Split into a seprate repository as this is a development dependency, while the main library is not.

## install

if you are using `react-loadable/babel` this is not needed because sadly the plugin is baked inside the library.

```
yarn add --dev react-make-async-babel-plugin
```

## Babel Plugin

Included in the `react-loadable` package is a Babel plugin that can add
`serverSideRequirePath` and `webpackRequireWeakId` for you.

**Input:**

```js
import Loadable from 'react-loadable';

Loadable({
  loader: () => import('./MyComponent'),
  LoadingComponent: () => null,
});
```

**Output:**

```js
import _path from 'path';
import Loadable from 'react-loadable';

Loadable({
  loader: () => import('./MyComponent'),
  LoadingComponent: () => null,
  serverSideRequirePath: _path.join(__dirname, './MyComponent'),
  webpackRequireWeakId: () => require.resolveWeak('./MyComponent'),
});
```

#### Plugin Setup

If you have `react-loadable` installed already, all you need to do is add this
plugin to your Babel config:

```js
{
  plugins: [
    ["react-make-async-babel-plugin", {
      server: true,
      webpack: true
    }]
  ]
}
```

**Options:**

- `server` (default: `true`) - When `true` adds `serverSideRequirePath` config.
- `webpack` (default: `false`) - When `true` adds `webpackRequireWeakId` config.
- `source` (default: `react-loadable`) - match against the library name to add the properties to its configs object.



