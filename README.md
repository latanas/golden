
Install dependencies:

```
npm install
```

The package tsd only looks for "node" and not "nodejs",
so you may need to "ln -s /usr/bin/nodejs /usr/bin/node".

Build:

```
source ./golden.sh
gulp
```

Unit test:

```
gulp test
```
