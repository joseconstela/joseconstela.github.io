---
layout: post
title:  "New NPM package: nodesfc (Single File Code)"
date:   2019-01-18 18:20:10 +0200
---

> Single File Code, or sfc, allows to execute nodejs scripts with its dependencies defined in the script itself.

Instead of having a package.json file and installing the dependencies via npm commands, you can specify the dependencies in your script comments.

SFC will take care of installing the dependencies.

![](/images/nodesfc.gif)

### Package

[https://www.npmjs.com/package/nodesfc](https://www.npmjs.com/package/nodesfc)

### Usage

Define your script dependencies as comment

    /**
     * @dependency lodash latest
     */
    require('lodash').map([1,2,3,4], n => console.log(n))

Execute nodesfc

    nodesfc myfile.js