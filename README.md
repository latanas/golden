
#### Install dependencies:

```
npm install
```

You may need to do "ln -s /usr/bin/nodejs /usr/bin/node",
because the package tsd only looks for "node" and not "nodejs".

#### Build:

```
source ./golden.sh
gulp
```

#### Unit test:

```
gulp test
```

#### Run:
http://www.atanaslaskov.com/golden/

Run locally:

```
python3 -m http.server
```

Then you can play at localhost:8000.
